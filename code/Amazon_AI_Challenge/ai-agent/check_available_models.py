"""
Check what Bedrock models are currently available
"""
import os
from dotenv import load_dotenv
import boto3

load_dotenv()

print("=" * 70)
print("CHECKING AVAILABLE BEDROCK MODELS")
print("=" * 70)

region = os.getenv('AWS_REGION', 'us-east-1')

try:
    # Use bedrock client (not bedrock-runtime)
    bedrock = boto3.client(
        'bedrock',
        region_name=region,
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    
    print(f"\n🔍 Checking in region: {region}\n")
    
    # List foundation models
    response = bedrock.list_foundation_models()
    
    # Filter for Claude models
    claude_models = [m for m in response['modelSummaries'] if 'claude' in m['modelId'].lower()]
    
    if claude_models:
        print(f"✅ Found {len(claude_models)} Claude models:\n")
        for model in claude_models:
            model_id = model['modelId']
            status = "✅ AVAILABLE" if model.get('modelLifecycle', {}).get('status') == 'ACTIVE' else "⚠️  " + model.get('modelLifecycle', {}).get('status', 'UNKNOWN')
            print(f"   {status}")
            print(f"      ID: {model_id}")
            print(f"      Name: {model.get('modelName', 'N/A')}")
            
            # Check if this is the one we want
            if 'haiku' in model_id.lower() and '3-5' in model_id:
                print(f"      👉 THIS IS YOUR TARGET MODEL!")
            print()
    else:
        print("❌ No Claude models found\n")
    
    # Also list all available models
    print("\n" + "=" * 70)
    print("ALL AVAILABLE MODELS")
    print("=" * 70)
    
    all_models = response['modelSummaries']
    
    providers = {}
    for model in all_models:
        provider = model.get('providerName', 'Unknown')
        if provider not in providers:
            providers[provider] = []
        providers[provider].append(model['modelId'])
    
    for provider, models in sorted(providers.items()):
        print(f"\n📦 {provider}: {len(models)} models")
        for model_id in models[:3]:  # Show first 3
            print(f"   - {model_id}")
        if len(models) > 3:
            print(f"   ... and {len(models) - 3} more")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print(f"\nThis might mean:")
    print("   1. Credentials issue")
    print("   2. IAM permissions missing (bedrock:ListFoundationModels)")
    print("   3. Region doesn't have Bedrock enabled")

print("\n" + "=" * 70)
