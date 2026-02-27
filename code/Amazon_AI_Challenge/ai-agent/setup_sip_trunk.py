"""
SIP Trunk Setup Script - ONE-TIME SETUP
This script helps you create or list SIP outbound trunks for LiveKit.

IMPORTANT: You only need to create ONE trunk that will be reused for all calls.
"""

import os
import asyncio
from dotenv import load_dotenv
from livekit import api
from livekit.protocol.sip import (
    CreateSIPOutboundTrunkRequest,
    SIPOutboundTrunkInfo,
    ListSIPOutboundTrunkRequest
)

load_dotenv()

async def list_existing_trunks():
    """List all existing SIP outbound trunks"""
    try:
        lkapi = api.LiveKitAPI()
        
        print("\n" + "="*60)
        print("📋 LISTING EXISTING SIP OUTBOUND TRUNKS")
        print("="*60)
        
        response = await lkapi.sip.list_sip_outbound_trunk(
            ListSIPOutboundTrunkRequest()
        )
        
        if response.items:
            print(f"\n✅ Found {len(response.items)} trunk(s):\n")
            for idx, trunk in enumerate(response.items, 1):
                print(f"Trunk {idx}:")
                print(f"  📌 Trunk ID: {trunk.sip_trunk_id}")
                print(f"  📝 Name: {trunk.name}")
                print(f"  🌐 Address: {trunk.address}")
                print(f"  📞 Numbers: {trunk.numbers}")
                print(f"  🔧 Transport: {trunk.transport}")
                print()
        else:
            print("\n⚠️  No SIP trunks found. You need to create one.")
            print("\n💡 Instructions:")
            print("   1. Sign up for a SIP provider (Twilio, Telnyx, etc.)")
            print("   2. Get a phone number from your SIP provider")
            print("   3. Get your SIP trunk credentials (address, username, password)")
            print("   4. Run this script with --create option")
        
        await lkapi.aclose()
        return response.items if response.items else []
        
    except Exception as e:
        print(f"\n❌ Error listing trunks: {e}")
        return []


async def create_trunk_interactive():
    """Interactive trunk creation"""
    print("\n" + "="*60)
    print("🚀 CREATE NEW SIP OUTBOUND TRUNK")
    print("="*60)
    
    print("\n⚠️  IMPORTANT NOTES:")
    print("   - You need a SIP provider account (Twilio, Telnyx, Plivo, etc.)")
    print("   - Free tier typically allows 1-2 trunks total")
    print("   - This trunk will be reused for ALL outbound calls")
    print("   - You only need to do this ONCE\n")
    
    # Get trunk details
    trunk_name = input("Enter trunk name (e.g., 'My Outbound Trunk'): ").strip()
    
    print("\n📞 SIP Provider Selection:")
    print("   1. Twilio")
    print("   2. Telnyx")
    print("   3. Other")
    provider = input("Select provider (1/2/3): ").strip()
    
    if provider == "1":
        # Twilio
        print("\n💡 For Twilio:")
        print("   - Format: <your-trunk-name>.pstn.twilio.com")
        print("   - Example: my-trunk-123.pstn.twilio.com")
        address = input("Enter Twilio trunk address: ").strip()
    elif provider == "2":
        # Telnyx
        print("\n💡 For Telnyx, use: sip.telnyx.com (or regional address)")
        address = input("Enter Telnyx address [sip.telnyx.com]: ").strip() or "sip.telnyx.com"
    else:
        address = input("Enter SIP provider address: ").strip()
    
    phone_number = input("\nEnter phone number (with country code, e.g., +19876543210): ").strip()
    
    print("\n🔐 Authentication:")
    auth_username = input("Enter SIP username: ").strip()
    auth_password = input("Enter SIP password: ").strip()
    
    # Confirm
    print("\n" + "="*60)
    print("📋 TRUNK CONFIGURATION SUMMARY:")
    print("="*60)
    print(f"  Name: {trunk_name}")
    print(f"  Address: {address}")
    print(f"  Number: {phone_number}")
    print(f"  Username: {auth_username}")
    print(f"  Password: {'*' * len(auth_password)}")
    print("="*60)
    
    confirm = input("\n✅ Create this trunk? (yes/no): ").strip().lower()
    if confirm != "yes":
        print("❌ Trunk creation cancelled.")
        return None
    
    # Create trunk
    try:
        lkapi = api.LiveKitAPI()
        
        trunk = SIPOutboundTrunkInfo(
            name=trunk_name,
            address=address,
            numbers=[phone_number],
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
        print("\n💾 SAVE THIS TRUNK ID TO YOUR .env FILE:")
        print(f"     SIP_TRUNK_ID={result.sip_trunk_id}")
        print("="*60)
        
        # Update .env file
        update_env = input("\n📝 Update .env file automatically? (yes/no): ").strip().lower()
        if update_env == "yes":
            update_env_file(result.sip_trunk_id)
        
        await lkapi.aclose()
        return result
        
    except Exception as e:
        print(f"\n❌ Error creating trunk: {e}")
        print("\n💡 Common issues:")
        print("   - Invalid SIP provider credentials")
        print("   - Phone number format incorrect (needs country code)")
        print("   - Free tier limit reached (max 1-2 trunks)")
        return None


def update_env_file(trunk_id):
    """Update .env file with trunk ID"""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    try:
        # Read existing .env
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                lines = f.readlines()
        else:
            lines = []
        
        # Update or add SIP_TRUNK_ID
        updated = False
        for i, line in enumerate(lines):
            if line.startswith('SIP_TRUNK_ID='):
                lines[i] = f'SIP_TRUNK_ID={trunk_id}\n'
                updated = True
                break
        
        if not updated:
            lines.append(f'\nSIP_TRUNK_ID={trunk_id}\n')
        
        # Write back
        with open(env_path, 'w') as f:
            f.writelines(lines)
        
        print(f"✅ Updated {env_path}")
        
    except Exception as e:
        print(f"❌ Error updating .env: {e}")


async def main():
    print("\n" + "="*60)
    print("🔧 LIVEKIT SIP TRUNK SETUP UTILITY")
    print("="*60)
    
    # Check environment
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    url = os.getenv("LIVEKIT_URL")
    
    if not all([api_key, api_secret, url]):
        print("\n❌ Missing LiveKit credentials in .env file!")
        print("   Required variables:")
        print("   - LIVEKIT_API_KEY")
        print("   - LIVEKIT_API_SECRET")
        print("   - LIVEKIT_URL")
        return
    
    print("\n✅ LiveKit credentials found")
    
    # Menu
    print("\n" + "="*60)
    print("OPTIONS:")
    print("="*60)
    print("  1. List existing trunks")
    print("  2. Create new trunk")
    print("  3. Both (list then create)")
    print("="*60)
    
    choice = input("\nSelect option (1/2/3): ").strip()
    
    if choice in ["1", "3"]:
        trunks = await list_existing_trunks()
        
        if trunks:
            trunk_id = trunks[0].sip_trunk_id
            print(f"\n💡 To use this trunk, add to your .env file:")
            print(f"   SIP_TRUNK_ID={trunk_id}")
            
            if choice == "3":
                create_more = input("\n➕ Create another trunk? (yes/no): ").strip().lower()
                if create_more != "yes":
                    return
    
    if choice in ["2", "3"]:
        await create_trunk_interactive()


if __name__ == "__main__":
    asyncio.run(main())
