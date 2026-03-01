import os
import asyncio
import argparse
import uuid
from datetime import datetime
from typing import Optional, List

from dotenv import load_dotenv
from livekit import api

load_dotenv()

LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
SIP_TRUNK_ID = os.getenv("SIP_TRUNK_ID")
DEFAULT_SIP_TO = os.getenv("SIP_TO")
DEFAULT_ROOM_NAME = os.getenv("SIP_ROOM_NAME", f"sip-room-{uuid.uuid4().hex[:8]}")
CALLER_NAME = os.getenv("SIP_FROM_NAME", "Scheme Saarthi Agent")

# Optional: inputs to create a SIP trunk if one is not configured
SIP_PROVIDER_ADDRESS = os.getenv("SIP_PROVIDER_ADDRESS")
SIP_PHONE_NUMBERS = os.getenv("SIP_PHONE_NUMBERS")  # comma-separated
SIP_AUTH_USERNAME = os.getenv("SIP_AUTH_USERNAME")
SIP_AUTH_PASSWORD = os.getenv("SIP_AUTH_PASSWORD")
SIP_TRUNK_NAME = os.getenv("SIP_TRUNK_NAME", "Scheme Saarthi Trunk")


def normalize_indian_phone(phone: str) -> str:
    """
    Normalize Indian phone number to E.164 format (+91XXXXXXXXXX)
    Takes last 10 digits and adds +91 prefix
    
    Examples:
        9949214499 → +919949214499
        919949214499 → +919949214499
        +919949214499 → +919949214499
        08074355155 → +918074355155
    """
    # Remove any non-digit characters
    digits = ''.join(filter(str.isdigit, phone))
    
    # Take last 10 digits (Indian mobile numbers are 10 digits)
    last_10_digits = digits[-10:]
    
    # Add +91 prefix for India
    return f"+91{last_10_digits}"


async def ensure_room(api_client: api.LiveKitAPI, room_name: str) -> None:
    try:
        # If room exists, this will raise; we create idempotently by deleting first
        await api_client.room.delete_room(api.DeleteRoomRequest(room=room_name))
    except Exception:
        pass
    await api_client.room.create_room(api.CreateRoomRequest(name=room_name))


async def create_or_get_trunk(api_client: api.LiveKitAPI) -> Optional[str]:
    """Attempt to return a SIP trunk id. If SIP_TRUNK_ID is set, use it.
    Otherwise try to create a trunk from env details. Returns trunk id or None.
    """
    if SIP_TRUNK_ID:
        return SIP_TRUNK_ID

    # Require all fields to attempt trunk creation
    if not (SIP_PROVIDER_ADDRESS and SIP_AUTH_USERNAME and SIP_AUTH_PASSWORD):
        return None

    try:
        # Normalize phone numbers list
        numbers: List[str] = []
        if SIP_PHONE_NUMBERS:
            numbers = [n.strip() for n in SIP_PHONE_NUMBERS.split(',') if n.strip()]

        # Try to find an existing trunk by name
        try:
            # If the API supports listing trunks
            trunks = await api_client.sip.list_sip_trunks(api.ListSIPTrunksRequest())
            for t in getattr(trunks, 'trunks', []) or []:
                if getattr(t, 'name', '') == SIP_TRUNK_NAME:
                    return getattr(t, 'sid', None) or getattr(t, 'id', None)
        except Exception:
            pass

        # Create a new SIP trunk if possible
        # Note: Depending on LiveKit API version, these fields/names may differ.
        req = api.CreateSIPTrunkRequest(
            name=SIP_TRUNK_NAME,
            auth_username=SIP_AUTH_USERNAME,
            auth_password=SIP_AUTH_PASSWORD,
            inbound_numbers=numbers,
            provider={'address': SIP_PROVIDER_ADDRESS},
        )
        trunk = await api_client.sip.create_sip_trunk(req)
        return getattr(trunk, 'sid', None) or getattr(trunk, 'id', None)
    except Exception:
        # If trunk creation fails, return None; caller will handle error
        return None


async def make_outbound_call(sip_to: str, room_name: str) -> dict:
    if not (LIVEKIT_URL and LIVEKIT_API_KEY and LIVEKIT_API_SECRET):
        raise RuntimeError("Missing LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET")

    if not SIP_TRUNK_ID:
        raise RuntimeError(
            "SIP_TRUNK_ID not set!\n"
            "\n"
            "SETUP REQUIRED:\n"
            "1. You need to create ONE SIP trunk (one-time setup)\n"
            "2. Run: python setup_sip_trunk.py\n"
            "3. Follow prompts to create trunk with your SIP provider (Twilio/Telnyx)\n"
            "4. Save the trunk ID to .env: SIP_TRUNK_ID=ST_xxxxx\n"
            "5. Restart sipserver.py\n"
            "\n"
            "See SIP_TRUNK_SETUP_GUIDE.md for detailed instructions.\n"
            "NOTE: You only create ONE trunk that's reused for all calls!"
        )

    # Normalize Indian phone number to E.164 format
    normalized_phone = normalize_indian_phone(sip_to)
    print(f"[PHONE] Original number: {sip_to}")
    print(f"[PHONE] Normalized to: {normalized_phone}")

    api_client = api.LiveKitAPI(
        url=LIVEKIT_URL,
        api_key=LIVEKIT_API_KEY,
        api_secret=LIVEKIT_API_SECRET,
    )

    # Create a fresh room for the call
    await ensure_room(api_client, room_name)

    participant_identity = f"sip_{uuid.uuid4().hex[:8]}"

    # Resolve or create trunk id
    trunk_id = await create_or_get_trunk(api_client)
    if not trunk_id:
        raise RuntimeError("No SIP trunk available. Set SIP_TRUNK_ID or SIP_* env to create one.")

    # Print request body
    request_body = {
        "sip_trunk_id": trunk_id,
        "sip_call_to": normalized_phone,
        "room_name": room_name,
        "participant_identity": participant_identity,
        "participant_name": CALLER_NAME,
        "wait_until_answered": True
    }
    print("\n" + "="*60)
    print("REQUEST TO LIVEKIT:")
    print("="*60)
    for key, value in request_body.items():
        print(f"  {key}: {value}")
    print("="*60 + "\n")

    resp = await api_client.sip.create_sip_participant(
        api.CreateSIPParticipantRequest(
            sip_trunk_id=trunk_id,
            sip_call_to=normalized_phone,
            room_name=room_name,
            participant_identity=participant_identity,
            participant_name=CALLER_NAME,
            krisp_enabled=True,
        )
    )

    # Print response
    print("\n" + "="*60)
    print("RESPONSE FROM LIVEKIT:")
    print("="*60)
    print(f"  participant_id: {resp.participant_id}")
    print(f"  participant_identity: {resp.participant_identity}")
    print(f"  room_name: {resp.room_name}")
    print(f"  sip_call_id: {resp.sip_call_id}")
    print("="*60 + "\n")

    return {
        "room": room_name,
        "participant_identity": participant_identity,
        "call": {
            "phone": normalized_phone,  # Return normalized phone
            "trunk_id": trunk_id,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "response": str(resp),
        },
    }


async def main():
    parser = argparse.ArgumentParser(description="Dial a SIP call via LiveKit Cloud")
    parser.add_argument("--to", dest="to", default=DEFAULT_SIP_TO, help="Destination E.164 phone number")
    parser.add_argument("--room", dest="room", default=DEFAULT_ROOM_NAME, help="Room name to host the call")
    parser.add_argument("--customer-name", dest="customer_name", default=None, help="Customer name for dynamic room name")
    args = parser.parse_args()

    if not args.to:
        raise RuntimeError("Provide destination number via --to or SIP_TO env var")

    room_name = args.room
    if args.customer_name:
        # Make room name dynamic from customer name
        sanitized = ''.join(ch if ch.isalnum() or ch in ('-', '_') else '-' for ch in args.customer_name)
        room_name = sanitized.lower() or DEFAULT_ROOM_NAME

    result = await make_outbound_call(args.to, room_name)
    print(result)


if __name__ == "__main__":
    asyncio.run(main())
