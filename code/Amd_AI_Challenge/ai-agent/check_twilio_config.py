"""
Test script to verify Twilio SIP trunk configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

print("="*60)
print("CHECKING TWILIO SIP CONFIGURATION")
print("="*60)

print("\n📋 Current .env Configuration:")
print(f"  SIP_PROVIDER_ADDRESS: {os.getenv('SIP_PROVIDER_ADDRESS')}")
print(f"  SIP_PHONE_NUMBERS: {os.getenv('SIP_PHONE_NUMBERS')}")
print(f"  SIP_AUTH_USERNAME: {os.getenv('SIP_AUTH_USERNAME')}")
print(f"  SIP_TRUNK_ID: {os.getenv('SIP_TRUNK_ID')}")

print("\n" + "="*60)
print("🔍 WHAT TO CHECK IN TWILIO:")
print("="*60)

print("\n1. Go to: https://console.twilio.com/us1/develop/voice/manage/trunks")
print("2. Click on your trunk (should see 'abhi' or similar name)")
print("3. Look for 'SIP TRUNK DOMAIN' or 'TRUNK SID'")
print("4. It should look like: abhi.pstn.twilio.com OR abhi-xxxx.pstn.twilio.com")

print("\n" + "="*60)
print("⚠️  CRITICAL TWILIO CHECKLIST:")
print("="*60)

print("\n✓ Trunk Configuration:")
print("  1. Does the trunk exist in Twilio?")
print("  2. Is it properly configured with Origination URIs?")
print("  3. Does the domain match: 'abhi.pstn.twilio.com'?")

print("\n✓ Authentication:")
print("  1. Credential List created with:")
print(f"     Username: {os.getenv('SIP_AUTH_USERNAME')}")
print("     Password: (check it matches your .env)")
print("  2. Credential List assigned to the trunk?")

print("\n✓ Origination (MOST IMPORTANT!):")
print("  1. Add Origination URI in trunk:")
print("     URI: sip:health-agent-7tjc9ces.livekit.cloud")
print("     OR use the LiveKit URL from your .env")
print("  2. Enable: ✓")
print("  3. Priority: 10")
print("  4. Weight: 10")

print("\n✓ Numbers:")
print("  1. Is +18786669982 assigned to this trunk?")

print("\n" + "="*60)
print("🔧 POSSIBLE FIXES:")
print("="*60)

print("\n1. Verify trunk domain name in Twilio")
print("   - Current: abhi.pstn.twilio.com")
print("   - Might need to be: abhi-XXXXX.pstn.twilio.com (with random suffix)")

print("\n2. Add LiveKit to Origination URIs (CRITICAL!)")
print("   - Without this, Twilio won't accept calls from LiveKit")
print("   - URI must be: sip:health-agent-7tjc9ces.livekit.cloud")

print("\n3. Re-create trunk with correct settings:")
print("   - Run: python setup_sip_trunk.py")
print("   - Choose option 2")
print("   - Use EXACT trunk domain from Twilio console")

print("\n" + "="*60)
print("📞 TEST STEPS:")
print("="*60)

print("\n1. Fix Twilio trunk (add Origination URI)")
print("2. Wait 1-2 minutes")
print("3. Run: python sip.py --to +919949214499 --citizen-name Test")
print("4. Check Twilio logs immediately after")
print("5. Should see call attempt in logs now")

print("\n" + "="*60)
