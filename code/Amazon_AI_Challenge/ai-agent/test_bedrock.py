"""
Quick Bedrock Access Test
"""
import os
from dotenv import load_dotenv
import boto3
from botocore.exceptions import ClientError

# Load environment variables
load_dotenv()

print("=" * 60)
print("AWS BEDROCK ACCESS TEST")
print("=" * 60)

# Show what credentials we're using (masked)
access_key = os.getenv('AWS_ACCESS_KEY_ID', '')
secret_key = os.getenv('AWS_SECRET_ACCESS_KEY', '')
region = os.getenv('AWS_REGION', 'us-east-1')

print(f"\n📋 Configuration:")
print(f"   Access Key: {access_key[:4]}...{access_key[-4:] if len(access_key) > 8 else 'MISSING'}")
print(f"   Secret Key: {'*' * 10}{secret_key[-4:] if len(secret_key) > 4 else 'MISSING'}")
print(f"   Region: {region}")

if not access_key or not secret_key:
    print("\n❌ ERROR: AWS credentials not found in .env file!")
    exit(1)

# Test Bedrock access
print("\n" + "=" * 60)
print("TESTING BEDROCK MODEL ACCESS")
print("=" * 60)

target_model = "anthropic.claude-3-5-haiku-20241022-v1:0"

try:
    # Create Bedrock Runtime client
    bedrock = boto3.client(
        'bedrock-runtime',
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )
    
    print(f"\n🔍 Testing: {target_model}")
    print("   Sending test message...")
    
    # Try to invoke the model
    response = bedrock.converse(
        modelId=target_model,
        messages=[
            {
                "role": "user",
                "content": [{"text": "Say hello in one word"}]
            }
        ]
    )
    
    # Success!
    reply = response['output']['message']['content'][0]['text']
    print(f"\n✅ SUCCESS! Model is accessible!")
    print(f"   Model responded: \"{reply}\"")
    print(f"\n🎉 CLAUDE 3.5 HAIKU IS FULLY WORKING!")
    
except ClientError as e:
    error_code = e.response['Error']['Code']
    error_msg = e.response['Error']['Message']
    
    print(f"\n❌ FAILED: {error_code}")
    print(f"   Message: {error_msg}")
    
    if 'ResourceNotFoundException' in error_code:
        print("\n⚠️  MODEL ACCESS NOT GRANTED!")
        print("\n📋 TO FIX:")
        print("   1. Open: https://console.aws.amazon.com/bedrock/")
        print("   2. Ensure you're in us-east-1 region")
        print("   3. Click 'Model access' → 'Manage model access'")
        print("   4. Find Anthropic section")
        print("   5. Check 'Claude 3.5 Haiku' model")
        print("   6. Fill usecase form and submit")
        print("   7. Wait 15 mins - 24 hours for approval")
        print("\n   Then come back and run this test again!")
    elif 'AccessDeniedException' in error_code:
        print("\n⚠️  IAM PERMISSIONS ISSUE!")
        print("   Your AWS user needs: bedrock:InvokeModel permission")
    
except Exception as e:
    print(f"\n❌ Unexpected error: {e}")
    print(f"   Error type: {type(e).__name__}")

print("\n" + "=" * 60)
