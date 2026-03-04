"""
Quick AWS Payment Method Status Check
"""
import os
from dotenv import load_dotenv
import boto3

load_dotenv()

print("=" * 70)
print("TESTING AWS BEDROCK ACCESS WITH CURRENT CREDENTIALS")
print("=" * 70)

try:
    bedrock_runtime = boto3.client(
        'bedrock-runtime',
        region_name='us-east-1',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    
    print("\n🧪 Testing Amazon Nova Lite (instant access model)...")
    print("   If this fails with payment error, UPI AutoPay not active yet\n")
    
    response = bedrock_runtime.converse(
        modelId='us.amazon.nova-lite-v1:0',
        messages=[{"role": "user", "content": [{"text": "hi"}]}]
    )
    
    reply = response['output']['message']['content'][0]['text']
    print(f"✅ SUCCESS! Payment method is working!")
    print(f"   AWS Bedrock responded: {reply}")
    print(f"\n🎉 Your UPI AutoPay is ACTIVE and working!")
    print(f"   You can now use all AWS Bedrock models!\n")
    
except Exception as e:
    error = str(e)
    print(f"❌ FAILED: {error[:150]}...\n")
    
    if 'INVALID_PAYMENT' in error:
        print("⚠️  UPI AUTOPAY NOT ACTIVE YET")
        print("\nWhat to do:")
        print("1. Check AWS Console: https://console.aws.amazon.com/billing/home#/paymentmethods")
        print("2. Verify UPI AutoPay status shows 'Active' or 'Verified'")
        print("3. Check your UPI app (GPay/PhonePe) for pending mandate approval")
        print("4. Wait 2-5 minutes if you just added it")
        print("5. Restart agent after it's verified")
    elif 'IncompleteSignature' in error:
        print("⚠️  Credential format issue (not a payment issue)")
        print("   Your agent may still work - try: python main.py start")
    else:
        print("❓ Unexpected error - check AWS console for payment method status")

print("=" * 70)
