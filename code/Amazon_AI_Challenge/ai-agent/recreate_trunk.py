"""
Create new SIP trunk with updated credentials from .env
"""
import os
import asyncio
from dotenv import load_dotenv
from livekit import api
from livekit.protocol.sip import (
    CreateSIPOutboundTrunkRequest,
    SIPOutboundTrunkInfo,
    DeleteSIPTrunkRequest
)

load_dotenv()

async def delete_old_trunk():
    """Delete the old trunk first"""
    try:
        lkapi = api.LiveKitAPI()
        trunk_id = os.getenv("SIP_TRUNK_ID")
        
        if trunk_id:
            print(f"\n🗑️  Deleting old trunk: {trunk_id}")
            await lkapi.sip.delete_sip_trunk(
                DeleteSIPTrunkRequest(sip_trunk_id=trunk_id)
            )
            print("✅ Old trunk deleted")
        
        await lkapi.aclose()
    except Exception as e:
        print(f"⚠️  Could not delete old trunk: {e}")

async def create_new_trunk():
    """Create new trunk with credentials from .env"""
    try:
        lkapi = api.LiveKitAPI()
        
        # Get credentials from .env
        trunk_name = os.getenv("SIP_TRUNK_NAME", "Health Agent Trunk")
        address = os.getenv("SIP_PROVIDER_ADDRESS", "abhi.pstn.twilio.com")
        phone_numbers = os.getenv("SIP_PHONE_NUMBERS", "+18786669982").split(",")
        auth_username = os.getenv("SIP_AUTH_USERNAME", "abhiram")
        auth_password = os.getenv("SIP_AUTH_PASSWORD", "Abhiram@12345")
        
        print("\n" + "="*60)
        print("🚀 CREATING NEW SIP TRUNK")
        print("="*60)
        print(f"  Name: {trunk_name}")
        print(f"  Address: {address}")
        print(f"  Numbers: {phone_numbers}")
        print(f"  Username: {auth_username}")
        print(f"  Password: {'*' * len(auth_password)}")
        print("="*60)
        
        trunk = SIPOutboundTrunkInfo(
            name=trunk_name,
            address=address,
            numbers=phone_numbers,
            auth_username=auth_username,
            auth_password=auth_password
        )
        
        request = CreateSIPOutboundTrunkRequest(trunk=trunk)
        
        print("\n⏳ Creating trunk...")
        result = await lkapi.sip.create_sip_outbound_trunk(request)
        
        print("\n" + "="*60)
        print("✅ TRUNK CREATED SUCCESSFULLY!")
        print("="*60)
        print(f"  📌 Trunk ID: {result.sip_trunk_id}")
        print(f"  📝 Name: {result.name}")
        print(f"  🌐 Address: {result.address}")
        print(f"  📞 Numbers: {result.numbers}")
        print("="*60)
        
        print(f"\n💾 UPDATE YOUR .env FILE:")
        print(f"   SIP_TRUNK_ID={result.sip_trunk_id}")
        
        # Update .env file
        env_path = os.path.join(os.path.dirname(__file__), '.env')
        with open(env_path, 'r') as f:
            lines = f.readlines()
        
        updated = False
        for i, line in enumerate(lines):
            if line.startswith('SIP_TRUNK_ID='):
                lines[i] = f'SIP_TRUNK_ID={result.sip_trunk_id}\n'
                updated = True
                break
        
        if not updated:
            lines.append(f'\nSIP_TRUNK_ID={result.sip_trunk_id}\n')
        
        with open(env_path, 'w') as f:
            f.writelines(lines)
        
        print(f"✅ Updated .env file with new trunk ID")
        
        await lkapi.aclose()
        return result.sip_trunk_id
        
    except Exception as e:
        print(f"\n❌ Error creating trunk: {e}")
        return None

async def main():
    print("\n" + "="*60)
    print("🔄 RECREATING SIP TRUNK WITH UPDATED CREDENTIALS")
    print("="*60)
    
    # Delete old trunk
    await delete_old_trunk()
    
    # Wait a moment
    await asyncio.sleep(1)
    
    # Create new trunk
    trunk_id = await create_new_trunk()
    
    if trunk_id:
        print("\n" + "="*60)
        print("🎉 SUCCESS!")
        print("="*60)
        print(f"  New Trunk ID: {trunk_id}")
        print("\n📋 NEXT STEPS:")
        print("  1. Restart sipserver.py")
        print("  2. Test call: python sip.py --to +919949214499 --customer-name Test")
        print("  3. Check LiveKit dashboard for status")
        print("="*60)

if __name__ == "__main__":
    asyncio.run(main())
