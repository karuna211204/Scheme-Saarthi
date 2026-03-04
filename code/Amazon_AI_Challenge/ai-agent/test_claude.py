"""Quick Claude 3.5 Haiku Test"""
import os
from dotenv import load_dotenv
import boto3

load_dotenv()

print("Testing Claude 3.5 Haiku access...")
print("=" * 60)

try:
    bedrock = boto3.client(
        'bedrock-runtime',
        region_name='us-east-1',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    
    response = bedrock.converse(
        modelId='anthropic.claude-3-5-haiku-20241022-v1:0',
        messages=[{"role": "user", "content": [{"text": "Say 'hello' in one word"}]}]
    )
    
    reply = response['output']['message']['content'][0]['text']
    print(f"✅ SUCCESS! Claude 3.5 Haiku is working!")
    print(f"   Response: {reply}")
    print("\n🎉 You can now use Claude 3.5 Haiku!")
    
except Exception as e:
    error_msg = str(e)
    print(f"❌ FAILED: {error_msg[:100]}")
    
    if 'ResourceNotFoundException' in error_msg:
        print("\n⚠️  MODEL ACCESS NOT GRANTED")
        print("   You need to request access in Bedrock console")
    elif 'INVALID_PAYMENT_INSTRUMENT' in error_msg:
        print("\n⚠️  PAYMENT METHOD ISSUE")
        print("   Add valid credit card in AWS billing settings")
    elif 'AccessDeniedException' in error_msg:
        print("\n⚠️  ACCESS DENIED")
        if 'INVALID_PAYMENT' in error_msg:
            print("   Payment method required - add credit card")
        else:
            print("   IAM permissions or model access not granted")

print("=" * 60)
