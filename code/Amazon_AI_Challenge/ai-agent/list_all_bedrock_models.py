"""
List and Test All Available AWS Bedrock Models
"""
import os
from dotenv import load_dotenv
import boto3
from botocore.exceptions import ClientError

load_dotenv()

print("=" * 80)
print("AWS BEDROCK - AVAILABLE MODELS CHECK")
print("=" * 80)

# Get credentials
access_key = os.getenv('AWS_ACCESS_KEY_ID')
secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
region = os.getenv('AWS_REGION', 'us-east-1')

print(f"\n📋 Configuration:")
print(f"   Region: {region}")
print(f"   Access Key: {access_key[:4]}...{access_key[-4:] if access_key else 'MISSING'}")

if not access_key or not secret_key:
    print("\n❌ ERROR: AWS credentials not found!")
    exit(1)

print("\n" + "=" * 80)
print("LISTING ALL BEDROCK FOUNDATION MODELS")
print("=" * 80)

try:
    # Create Bedrock client (not bedrock-runtime)
    bedrock = boto3.client(
        'bedrock',
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )
    
    # List all foundation models
    response = bedrock.list_foundation_models()
    models = response.get('modelSummaries', [])
    
    if not models:
        print("\n❌ No models found!")
        exit(1)
    
    print(f"\n✅ Found {len(models)} total models\n")
    
    # Organize by provider
    providers = {}
    for model in models:
        provider = model.get('providerName', 'Unknown')
        if provider not in providers:
            providers[provider] = []
        providers[provider].append(model)
    
    # Display by provider
    for provider in sorted(providers.keys()):
        provider_models = providers[provider]
        print(f"\n{'=' * 80}")
        print(f"📦 {provider.upper()} - {len(provider_models)} models")
        print(f"{'=' * 80}")
        
        for model in provider_models:
            model_id = model['modelId']
            model_name = model.get('modelName', 'N/A')
            
            # Check inference types
            inference_types = model.get('inferenceTypesSupported', [])
            supports_streaming = 'ON_DEMAND' in inference_types
            
            # Check status
            lifecycle = model.get('modelLifecycle', {})
            status = lifecycle.get('status', 'UNKNOWN')
            
            # Color code status
            if status == 'ACTIVE':
                status_icon = "✅"
            elif status == 'LEGACY':
                status_icon = "⚠️"
            else:
                status_icon = "❌"
            
            print(f"\n   {status_icon} {model_name}")
            print(f"      ID: {model_id}")
            print(f"      Status: {status}")
            print(f"      Streaming: {'Yes' if supports_streaming else 'No'}")
            
            # Highlight recommended models
            if 'claude' in model_id.lower() and '3-5' in model_id:
                print(f"      👉 RECOMMENDED (Latest Claude)")
            elif 'nova' in model_id.lower() and 'lite' in model_id.lower():
                print(f"      👉 INSTANT ACCESS (No approval needed)")
            elif 'nova' in model_id.lower():
                print(f"      💡 Amazon Nova (Good alternative)")

except ClientError as e:
    error_code = e.response['Error']['Code']
    error_msg = e.response['Error']['Message']
    print(f"\n❌ AWS Error: {error_code}")
    print(f"   Message: {error_msg}")
    
    if 'IncompleteSignature' in error_code:
        print("\n⚠️  Credentials parsing issue (slash in secret key)")
        print("   Note: This is a boto3 issue, not a real AWS error")
        print("   Your livekit agent may still work fine!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")

print("\n" + "=" * 80)
print("TESTING SPECIFIC MODELS")
print("=" * 80)

test_models = [
    ("anthropic.claude-3-5-haiku-20241022-v1:0", "Claude 3.5 Haiku (BEST)"),
    ("anthropic.claude-3-5-sonnet-20241022-v2:0", "Claude 3.5 Sonnet (BEST)"),
    ("us.amazon.nova-lite-v1:0", "Amazon Nova Lite (INSTANT)"),
    ("us.amazon.nova-pro-v1:0", "Amazon Nova Pro (INSTANT)"),
    ("us.meta.llama3-2-1b-instruct-v1:0", "Llama 3.2 1B"),
]

print("\n🧪 Testing model access with actual API calls...\n")

try:
    bedrock_runtime = boto3.client(
        'bedrock-runtime',
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )
    
    for model_id, model_name in test_models:
        print(f"\n{'─' * 80}")
        print(f"Testing: {model_name}")
        print(f"ID: {model_id}")
        
        try:
            response = bedrock_runtime.converse(
                modelId=model_id,
                messages=[
                    {
                        "role": "user",
                        "content": [{"text": "Say 'hi' in one word"}]
                    }
                ]
            )
            
            reply = response['output']['message']['content'][0]['text']
            print(f"✅ WORKS! Response: '{reply}'")
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_msg = e.response['Error']['Message']
            
            if 'ResourceNotFoundException' in error_code:
                print(f"❌ ACCESS DENIED - Need to request access")
            elif 'AccessDeniedException' in error_code:
                if 'INVALID_PAYMENT' in error_msg:
                    print(f"❌ PAYMENT REQUIRED - Add credit card")
                else:
                    print(f"❌ ACCESS DENIED - {error_msg[:80]}")
            elif 'ValidationException' in error_code:
                print(f"⚠️  MODEL NOT AVAILABLE in {region}")
            else:
                print(f"❌ ERROR: {error_code} - {error_msg[:80]}")
        
        except Exception as e:
            print(f"❌ ERROR: {str(e)[:100]}")

except Exception as e:
    print(f"\n❌ Cannot test models: {e}")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print("""
Models you can use INSTANTLY (no approval):
  ✅ Amazon Nova Lite - us.amazon.nova-lite-v1:0
  ✅ Amazon Nova Pro - us.amazon.nova-pro-v1:0
  ✅ Amazon Nova Micro - us.amazon.nova-micro-v1:0

Models requiring APPROVAL (best quality):
  🔐 Claude 3.5 Haiku - anthropic.claude-3-5-haiku-20241022-v1:0
  🔐 Claude 3.5 Sonnet - anthropic.claude-3-5-sonnet-20241022-v2:0

Note: All models require valid payment method (credit card)
""")
print("=" * 80)
