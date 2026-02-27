"""
Auto-create SIP trunk using credentials from .env file
"""
import os
import asyncio
from dotenv import load_dotenv
from livekit import api
from livekit.protocol.sip import (
    CreateSIPOutboundTrunkRequest,
    SIPOutboundTrunkInfo,
)

load_dotenv()

async def create_trunk():
    """Create SIP trunk automatically from .env credentials"""
    
    # Get credentials from .env
    trunk_name = os.getenv("SIP_TRUNK_NAME", "Health Agent Trunk")
    address = os.getenv("SIP_PROVIDER_ADDRESS")
    phone_numbers = os.getenv("SIP_PHONE_NUMBERS", "").split(",")
    auth_username = os.getenv("SIP_AUTH_USERNAME")
    auth_password = os.getenv("SIP_AUTH_PASSWORD")
    
    print("\n" + "="*60)
    print("🚀 AUTO-CREATING SIP TRUNK FROM .env")
    print("="*60)
    print(f"  Name: {trunk_name}")
    print(f"  Address: {address}")
    print(f"  Numbers: {phone_numbers}")
    print(f"  Username: {auth_username}")
    print("="*60)
    
    if not all([address, phone_numbers, auth_username, auth_password]):
        print("\n❌ Missing SIP credentials in .env file!")
        print("   Required: SIP_PROVIDER_ADDRESS, SIP_PHONE_NUMBERS, SIP_AUTH_USERNAME, SIP_AUTH_PASSWORD")
        return None
    
    try:
        lkapi = api.LiveKitAPI()
        
        trunk = SIPOutboundTrunkInfo(
            name=trunk_name,
            address=address,
            numbers=[n.strip() for n in phone_numbers if n.strip()],
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
        print("\n💾 ADD THIS TO YOUR EC2 .env FILE:")
        print(f"     SIP_TRUNK_ID={result.sip_trunk_id}")
        print("="*60)
        
        # Update local .env file
        update_env_file(result.sip_trunk_id)
        
        await lkapi.aclose()
        return result.sip_trunk_id
        
    except Exception as e:
        print(f"\n❌ Error creating trunk: {e}")
        print("\n💡 This might mean:")
        print("   - Trunk already exists (check with list command)")
        print("   - Invalid credentials")
        print("   - Free tier limit reached")
        return None


def update_env_file(trunk_id):
    """Update .env file with trunk ID"""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    try:
        with open(env_path, 'r') as f:
            content = f.read()
        
        # Replace SIP_TRUNK_ID= with the new trunk ID
        if 'SIP_TRUNK_ID=' in content:
            content = content.replace('SIP_TRUNK_ID=', f'SIP_TRUNK_ID={trunk_id}')
        else:
            content += f'\nSIP_TRUNK_ID={trunk_id}\n'
        
        with open(env_path, 'w') as f:
            f.write(content)
        
        print(f"\n✅ Updated local {env_path} with SIP_TRUNK_ID")
        
    except Exception as e:
        print(f"❌ Error updating .env: {e}")


if __name__ == "__main__":
    trunk_id = asyncio.run(create_trunk())
    if trunk_id:
        print("\n" + "="*60)
        print("📋 NEXT STEPS:")
        print("="*60)
        print("1. Copy this SIP_TRUNK_ID to your EC2 .env file")
        print("2. Restart sipserver.py on EC2")
        print("3. Test the outbound call from your frontend")
        print("="*60)
