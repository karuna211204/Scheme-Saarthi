"""
LiveKit Room Management Utilities
Simple functions for managing participants in LiveKit rooms using SDK
"""

import os
import asyncio
from dotenv import load_dotenv
from livekit import api
import logging
import uuid
from datetime import datetime, timezone

load_dotenv()

LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
SIP_TRUNK_ID = os.getenv("SIP_TRUNK_ID")
HUMAN_AGENT_NUMBER = os.getenv("HUMAN_AGENT_NUMBER", "8074355155")

logger = logging.getLogger(__name__)


def normalize_indian_phone(phone: str) -> str:
    """Normalize Indian phone number to E.164 format (+91XXXXXXXXXX)"""
    digits = ''.join(filter(str.isdigit, phone))
    last_10_digits = digits[-10:]
    return f"+91{last_10_digits}"


async def remove_participant_from_room(room_name: str, participant_identity: str) -> dict:
    """Remove a participant from a LiveKit room using SDK"""
    try:
        if not (LIVEKIT_URL and LIVEKIT_API_KEY and LIVEKIT_API_SECRET):
            raise RuntimeError("Missing LIVEKIT credentials")
        
        logger.info(f"Removing participant {participant_identity} from room {room_name}")
        
        api_client = api.LiveKitAPI(
            url=LIVEKIT_URL,
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
        )
        
        try:
            await api_client.room.remove_participant(
                api.RoomParticipantIdentity(
                    room=room_name,
                    identity=participant_identity,
                )
            )
            logger.info(f"✅ Removed participant {participant_identity}")
            return {"success": True, "message": f"Removed {participant_identity}"}
        finally:
            await api_client.aclose()
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ Failed to remove participant: {error_msg}")
        
        # If participant not found, that's okay
        if "not_found" in error_msg.lower() or "404" in error_msg:
            logger.info("⚠️ Participant not found (already disconnected)")
            return {"success": True, "message": "Already disconnected"}
        
        return {"success": False, "error": error_msg}


async def add_sip_participant_to_room(room_name: str, phone_number: str, participant_name: str = "Human Agent") -> dict:
    """Add a SIP participant (phone call) to an existing LiveKit room using SDK"""
    try:
        if not (LIVEKIT_URL and LIVEKIT_API_KEY and LIVEKIT_API_SECRET):
            raise RuntimeError("Missing LIVEKIT credentials")
        
        if not SIP_TRUNK_ID:
            raise RuntimeError("SIP_TRUNK_ID not configured")
        
        normalized_phone = normalize_indian_phone(phone_number)
        logger.info(f"Adding SIP participant to room {room_name}: {normalized_phone}")
        
        api_client = api.LiveKitAPI(
            url=LIVEKIT_URL,
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
        )
        
        participant_identity = f"human-agent-{uuid.uuid4().hex[:8]}"
        
        try:
            resp = await api_client.sip.create_sip_participant(
                api.CreateSIPParticipantRequest(
                    sip_trunk_id=SIP_TRUNK_ID,
                    sip_call_to=normalized_phone,
                    room_name=room_name,
                    participant_identity=participant_identity,
                    participant_name=participant_name,
                    krisp_enabled=True,
                )
            )
            
            logger.info(f"✅ SIP participant added: {resp.participant_id}")
            
            return {
                "success": True,
                "room": room_name,
                "participant_id": resp.participant_id,
                "participant_identity": resp.participant_identity,
                "sip_call_id": resp.sip_call_id,
                "phone": normalized_phone,
                "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            }
        finally:
            await api_client.aclose()
        
    except Exception as e:
        logger.error(f"❌ Failed to add SIP participant: {e}")
        return {"success": False, "error": str(e)}


async def initiate_transfer_to_human(room_name: str, ai_agent_identity: str = "auto") -> dict:
    """
    Initiate transfer to human agent (non-blocking)
    This function ONLY adds SIP call and waits for human to connect.
    AI agent removal is handled by session.shutdown() in main.py
    """
    try:
        logger.info(f"🔄 Starting transfer in room: {room_name}")
        
        # Step 1: Add human agent via SIP
        logger.info(f"📞 Adding human agent: {HUMAN_AGENT_NUMBER}")
        result = await add_sip_participant_to_room(room_name, HUMAN_AGENT_NUMBER, "Human Agent")
        
        if not result.get("success"):
            logger.error(f"❌ Failed to add human: {result.get('error')}")
            return {"success": False, "error": result.get('error')}
        
        logger.info(f"✅ SIP call initiated: {result.get('sip_call_id')}")
        
        # Step 2: Wait for human to connect (optional - don't block)
        logger.info("⏳ Human agent being called...")
        api_client = api.LiveKitAPI(
            url=LIVEKIT_URL,
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
        )
        
        try:
            human_connected = False
            for i in range(15):  # Wait up to 15 seconds max
                await asyncio.sleep(1)
                
                participants_response = await api_client.room.list_participants(
                    api.ListParticipantsRequest(room=room_name)
                )
                
                # Check if SIP participant (kind=3) joined
                for p in participants_response.participants:
                    if p.kind == 3:  # SIP
                        logger.info(f"✅ Human connected: {p.identity}")
                        human_connected = True
                        break
                
                if human_connected:
                    break
            
            if not human_connected:
                logger.info("⏳ Human agent still connecting...")
                        
        finally:
            await api_client.aclose()
        
        logger.info("✅ Transfer initiated - AI will disconnect via session.shutdown()")
        return {"success": True}
        
    except Exception as e:
        logger.error(f"❌ Transfer failed: {e}")
        return {"success": False, "error": str(e)}

