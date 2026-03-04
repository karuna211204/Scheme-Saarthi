"""
Check AWS Bedrock Model Access
Based on: https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html
"""
import boto3
import json
from botocore.exceptions import ClientError

def check_bedrock_access():
    print("=" * 60)
    print("AWS BEDROCK MODEL ACCESS CHECKER")
    print("=" * 60)
    
    # Create Bedrock client
    try:
        bedrock = boto3.client('bedrock', region_name='us-east-1')
        print("✅ Successfully connected to AWS Bedrock (us-east-1)")
    except Exception as e:
        print(f"❌ Failed to connect to AWS Bedrock: {e}")
        return
    
    print("\n" + "=" * 60)
    print("CHECKING CLAUDE 3.5 HAIKU MODEL ACCESS")
    print("=" * 60)
    
    target_model = "anthropic.claude-3-5-haiku-20241022-v1:0"
    
    # Method 1: Try to get the specific model
    print(f"\n🔍 Checking access to: {target_model}")
    try:
        response = bedrock.get_foundation_model(modelIdentifier=target_model)
        print("✅ Model exists and is visible")
        print(f"   Model Name: {response['modelDetails']['modelName']}")
        print(f"   Provider: {response['modelDetails']['providerName']}")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            print("❌ Model not found or no access granted")
        else:
            print(f"❌ Error: {e.response['Error']['Code']} - {e.response['Error']['Message']}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    
    # Method 2: List all available Claude models
    print("\n" + "=" * 60)
    print("LISTING ALL ACCESSIBLE CLAUDE MODELS")
    print("=" * 60)
    
    try:
        response = bedrock.list_foundation_models()
        claude_models = [m for m in response['modelSummaries'] 
                        if 'claude' in m['modelId'].lower()]
        
        if claude_models:
            print(f"\n✅ Found {len(claude_models)} Claude models:")
            for model in claude_models:
                print(f"\n   Model ID: {model['modelId']}")
                print(f"   Name: {model.get('modelName', 'N/A')}")
                print(f"   Provider: {model.get('providerName', 'N/A')}")
                
                # Check if it's the one we need
                if model['modelId'] == target_model:
                    print("   ⭐ THIS IS THE TARGET MODEL!")
        else:
            print("\n❌ No Claude models found - likely no access granted")
            print("\n📋 REQUIRED ACTIONS:")
            print("   1. Go to: https://console.aws.amazon.com/bedrock/")
            print("   2. Select region: us-east-1")
            print("   3. Click 'Model access' in left sidebar")
            print("   4. Click 'Manage model access'")
            print("   5. Find 'Anthropic' section")
            print("   6. Check the box for Claude 3.5 Haiku")
            print("   7. Fill out the use case form if prompted")
            print("   8. Submit and wait for approval (can take 15 mins - 24 hours)")
            
    except Exception as e:
        print(f"❌ Error listing models: {e}")
    
    # Method 3: Try to invoke the model (will fail if no access)
    print("\n" + "=" * 60)
    print("TESTING MODEL INVOCATION")
    print("=" * 60)
    
    try:
        bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
        print(f"\n🔍 Attempting test invocation of {target_model}...")
        
        response = bedrock_runtime.converse(
            modelId=target_model,
            messages=[
                {
                    "role": "user",
                    "content": [{"text": "Hello"}]
                }
            ]
        )
        print("✅ SUCCESS! Model is accessible and working!")
        print(f"   Model responded with: {response['output']['message']['content'][0]['text'][:100]}...")
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_msg = e.response['Error']['Message']
        
        if error_code == 'ResourceNotFoundException':
            print("❌ BLOCKED: Model access not granted for this account")
            print(f"   Error: {error_msg}")
            print("\n⚠️  YOU NEED TO REQUEST MODEL ACCESS!")
            print("   Follow the steps above to enable the model.")
        elif error_code == 'AccessDeniedException':
            print("❌ BLOCKED: IAM permissions issue")
            print(f"   Error: {error_msg}")
            print("\n📋 Check IAM permissions for bedrock:InvokeModel")
        else:
            print(f"❌ Error: {error_code}")
            print(f"   Message: {error_msg}")
    except Exception as e:
        print(f"❌ Unexpected error during invocation: {e}")
    
    print("\n" + "=" * 60)
    print("CHECK COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    check_bedrock_access()
