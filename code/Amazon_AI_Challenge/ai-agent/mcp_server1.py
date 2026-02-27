"""
Scheme Saarthi AI MCP Server using FastMCP
Tools: Scheme eligibility check, consultation booking, scheme inquiry tracking
Backend: MERN backend API (Express + MongoDB)
"""

from fastmcp import FastMCP
import os
from datetime import datetime, timedelta
import json
from typing import Optional
import logging
from dotenv import load_dotenv
from starlette.responses import JSONResponse
from starlette.requests import Request
import subprocess
import asyncio
import aiohttp

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastMCP server
mcp = FastMCP("schemesaarthi-agent-server")

# Backend API URL
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "https://d2svfu6tjqm2v.cloudfront.net/webhook/guntur-electronics-webhook")
logger.info(f"📊 Using backend API: {BACKEND_URL}")
logger.info(f"🔗 Using n8n webhook: {N8N_WEBHOOK_URL}")



# ========== Custom Routes ==========

@mcp.custom_route("/health", methods=["GET"])
async def health_check(request):
    """Health check endpoint"""
    return JSONResponse({
        "status": "healthy",
        "server": "schemesaarthi-agent-server",
        "timestamp": datetime.now().isoformat(),
        "backend_url": BACKEND_URL,
        "tools_available": [
            "search_schemes",
            "check_scheme_eligibility",
            "schedule_consultation",
            "create_scheme_inquiry",
            "get_pending_applications",
            "check_consultation_availability",
            "book_consultation",
            "send_sms",
            "send_gmail_confirmation",
            "update_citizen_phone",
            "get_citizen_history",
            "create_application",
            "get_scheme_details"
        ]
    })


@mcp.custom_route("/", methods=["GET"])
async def root(request):
    """Root endpoint"""
    return JSONResponse({
        "message": "Scheme Saarthi AI MCP Server",
        "status": "running",
        "backend": BACKEND_URL,
        "docs": "/docs"
    })


# ========== Helper Function for API calls ==========

async def call_backend_api(endpoint: str, method: str = "GET", data: dict = None):
    """Helper function to call MERN backend API"""
    url = f"{BACKEND_URL}{endpoint}"
    
    logger.info("="*60)
    logger.info(f"🔗 API CALL: {method} {endpoint}")
    if data:
        logger.info(f"📤 Request Data: {data}")
    logger.info("="*60)
    
    async with aiohttp.ClientSession() as session:
        if method == "GET":
            async with session.get(url) as response:
                result=await response.json()
                logger.info(f"✅ Response Status: {response.status}")
                logger.info(f"📥 Response Data: {result}")
                return result
        elif method == "POST":
            async with session.post(url, json=data) as response:
                result=await response.json()
                logger.info(f"✅ Response Status: {response.status}")
                logger.info(f"📥 Response Data: {result}")
                return result
        elif method == "PUT":
            async with session.put(url, json=data) as response:
                result=await response.json()
                logger.info(f"✅ Response Status: {response.status}")
                logger.info(f"📥 Response Data: {result}")
                return result


# ========== MCP Tools ==========

@mcp.tool()
async def check_consultation_availability(date_str: str, time_str: str, window_minutes: int = 60) -> str:
    """
    Check MongoDB backend for consultation appointment availability at the requested date/time.
    Returns available nearby slots if the requested slot is taken.
    
    Args:
        date_str: Date in format YYYY-MM-DD
        time_str: Time in format HH:MM (24-hour format)
        window_minutes: Minutes to search before/after for alternative slots (default 60)
    
    Returns:
        JSON string with availability status and suggested slots if unavailable
    """
    try:
        logger.info("="*50)
        logger.info(f"📅 Checking consultation availability for {date_str} {time_str}")
        logger.info("="*50)
        
        # Call backend API
        result = await call_backend_api(
            "/api/appointments/check-availability",
            method="POST",
            data={
                "date_str": date_str,
                "time_str": time_str,
                "window_minutes": window_minutes
            }
        )
        
        logger.info(f"✅ Backend response: {result}")
        logger.info("="*50)
        
        return json.dumps(result, default=str)
        
    except Exception as e:
        logger.error(f"❌ Error checking availability: {e}", exc_info=True)
        return json.dumps({
            "available": False,
            "error": f"Error checking availability: {str(e)}"
        })


@mcp.tool()
async def book_consultation(
    citizen_name: str,
    phone: str,
    email: str,
    consultation_date: str,
    consultation_time: str,
    citizen_id: str = "",
    consultation_type: str = "general",
    notes: str = ""
) -> str:
    """
    Book a consultation session for citizen to get help with schemes.
    This should be called AFTER checking availability and getting confirmation from citizen.
    
    Args:
        citizen_name: Citizen name
        phone: Phone number
        email: Email address
        consultation_date: Consultation date in YYYY-MM-DD format
        consultation_time: Consultation time in HH:MM format
        citizen_id: Unique citizen session ID (optional)
        consultation_type: Type (general/document_help/application_support/grievance)
        notes: Optional notes about the consultation
    
    Returns:
        JSON string with booking status including citizen_id
    """
    try:
        logger.info("="*50)
        logger.info(f"📅 BOOKING CONSULTATION for {citizen_name}")
        logger.info(f"🆔 Citizen ID: {citizen_id if citizen_id else 'Not provided'}")
        logger.info(f"📞 Phone: {phone}")
        logger.info(f"📧 Email: {email}")
        logger.info(f"🕐 Date/Time: {consultation_date} {consultation_time}")
        logger.info(f"📋 Type: {consultation_type}")
        logger.info("="*50)
        
        # Call backend API
        result = await call_backend_api(
            "/api/appointments/book",
            method="POST",
            data={
                "customer_name": citizen_name,
                "phone": phone,
                "email": email,
                "appointment_date": consultation_date,
                "appointment_time": consultation_time,
                "customer_id": citizen_id,
                "consultation_type": consultation_type,
                "notes": notes
            }
        )
        
        logger.info(f"✅ Consultation booked successfully!")
        logger.info("="*50)
        
        return json.dumps(result, default=str)
        
    except Exception as e:
        logger.error(f"❌ Failed to book consultation: {e}", exc_info=True)
        return json.dumps({
            "status": "error",
            "error": str(e)
        })

@mcp.tool()
async def check_scheme_eligibility(phone: str, scheme_id: str = "") -> str:
    """
    Check citizen's eligibility for government schemes based on their profile.
    Returns eligible schemes with benefit amounts and application process.
    
    Args:
        phone: Citizen phone number (required)
        scheme_id: Specific scheme ID (optional, to check single scheme)
    
    Returns:
        JSON string with eligibility status and scheme details
    
    Example:
        check_scheme_eligibility(phone="+919999999999")
        check_scheme_eligibility(phone="+919999999999", scheme_id="PM-KISAN")
    """
    try:
        logger.info(f"🔍 Checking scheme eligibility for phone: {phone}")
        
        data={"phone": phone}
        if scheme_id:
            data["scheme_id"]=scheme_id
        
        result = await call_backend_api(
            "/api/applications/check-eligibility",
            method="POST",
            data=data
        )
        
        logger.info(f"✅ Eligibility check result: {result.get('count', 0)} schemes found")
        return json.dumps(result, default=str)
        
    except Exception as e:
        logger.error(f"❌ Eligibility check error: {e}", exc_info=True)
        return json.dumps({
            "eligible": False,
            "error": str(e)
        })




@mcp.tool()
async def schedule_consultation(
    citizen_phone: str,
    citizen_name: str,
    query_description: str,
    preferred_date: str,
    preferred_time: str,
    district: str = "",
    consultation_type: str = "general",
    email: str = "",
    preferred_language: str = "Hindi"
) -> str:
    """
    Schedule a consultation session for citizen to get help with schemes/applications.
    This can be for document help, application support, or general queries.
    
    Args:
        citizen_phone: Citizen phone number
        citizen_name: Citizen full name
        query_description: Description of help needed
        preferred_date: Preferred date in YYYY-MM-DD format
        preferred_time: Preferred time in HH:MM format (24-hour)
        district: Citizen's district (optional)
        consultation_type: Type (general/document_help/application_support/grievance)
        email: Citizen email (optional)
        preferred_language: Preferred language (Hindi/Telugu/Tamil/English)
    
    Returns:
        JSON string with booking confirmation
    
    Example:
        schedule_consultation(
            citizen_phone="+919999999999",
            citizen_name="Ramesh Kumar",
            query_description="Need help filling PM-KISAN application form",
            preferred_date="2026-03-15",
            preferred_time="14:00",
            district="Guntur",
            consultation_type="application_support",
            preferred_language="Telugu"
        )
    """
    try:
        logger.info("="*60)
        logger.info(f"📅 Scheduling consultation for {citizen_phone}")
        logger.info(f"   Citizen: {citizen_name}")
        logger.info(f"   Query: {query_description}")
        logger.info(f"   Date/Time: {preferred_date} {preferred_time}")
        logger.info(f"   Type: {consultation_type}")
        logger.info(f"   Language: {preferred_language}")
        logger.info("="*60)
        
        consultation_data = {
            "phone": citizen_phone,
            "customer_name": citizen_name,
            "email": email,
            "appointment_date": preferred_date,
            "appointment_time": preferred_time,
            "issue_description": query_description,
            "address": district,
            "product_name": consultation_type,
            "appointment_type": consultation_type,
            "status": "scheduled",
            "preferred_language": preferred_language
        }
        
        result = await call_backend_api(
            "/api/appointments",
            method="POST",
            data=consultation_data
        )
        
        consultation_id=result.get('appointment', {}).get('_id', 'unknown')
        logger.info(f"✅ Consultation scheduled successfully! ID: {consultation_id}")
        logger.info("="*60)
        
        return json.dumps({
            "success": True,
            "consultation_id": str(consultation_id),
            "message": f"Consultation scheduled for {preferred_date} at {preferred_time}",
            "consultation_type": consultation_type,
            "details": result
        }, default=str)
        
    except Exception as e:
        logger.error(f"❌ Booking error: {e}", exc_info=True)
        return json.dumps({
            "success": False,
            "error": str(e)
        })


@mcp.tool()
async def create_scheme_inquiry(
    citizen_phone: str,
    citizen_name: str,
    inquiry_type: str,
    interested_schemes: str = "",
    notes: str = ""
) -> str:
    """
    Create a scheme inquiry for follow-up tracking.
    Use this when citizen shows interest in specific schemes or needs more information.
    
    Args:
        citizen_phone: Citizen phone number
        citizen_name: Citizen full name
        inquiry_type: Type of inquiry - "scheme_interest", "application_help", or "eligibility_question"
        interested_schemes: Comma-separated scheme IDs or names
        notes: Additional notes about the conversation
    
    Returns:
        JSON string with inquiry creation confirmation
    
    Example:
        create_scheme_inquiry(
            citizen_phone="+919999999999",
            citizen_name="Ramesh Kumar",
            inquiry_type="scheme_interest",
            interested_schemes="PM-KISAN,PMAY-G",
            notes="Citizen is a farmer with 2 acres land, wants housing scheme too"
        )
    """
    try:
        logger.info(f"📋 Creating scheme inquiry: {inquiry_type} for {citizen_phone}")
        
        inquiry_data = {
            "phone": citizen_phone,
            "customer_name": citizen_name,
            "lead_type": inquiry_type,
            "product_interest": interested_schemes,
            "notes": notes,
            "status": "open",
            "follow_up_date": (datetime.now() + timedelta(days=1)).isoformat()
        }
        
        result = await call_backend_api(
            "/api/salesleads",
            method="POST",
            data=inquiry_data
        )
        
        logger.info(f"✅ Scheme inquiry created: {result.get('_id')}")
        return json.dumps({
            "success": True,
            "inquiry_id": str(result.get('_id')),
            "message": f"Scheme inquiry created for {inquiry_type}",
            "details": result
        }, default=str)
        
    except Exception as e:
        logger.error(f"❌ Inquiry creation error: {e}", exc_info=True)
        return json.dumps({
            "success": False,
            "error": str(e)
        })


@mcp.tool()
async def get_pending_applications(days_threshold: int = 7) -> str:
    """
    Get list of citizens with pending scheme applications (for proactive follow-up calls).
    Use this to identify applications that need document submission or status updates.
    
    Args:
        days_threshold: Number of days since application submission (default 7)
    
    Returns:
        JSON list of citizens with pending applications
    
    Example:
        get_pending_applications(days_threshold=7)
    """
    try:
        logger.info(f"📊 Fetching applications pending for {days_threshold} days")
        
        result = await call_backend_api(
            f"/api/applications/pending/{days_threshold}",
            method="GET"
        )
        
        logger.info(f"✅ Found {len(result)} pending applications")
        return json.dumps({
            "count": len(result),
            "applications": result
        }, default=str)
        
    except Exception as e:
        logger.error(f"❌ Error fetching expiring warranties: {e}", exc_info=True)
        return json.dumps({
            "error": str(e),
            "count": 0,
            "warranties": []
        })


@mcp.tool()
def send_sms(to: str, body: str) -> str:
    """
    Send SMS to customer using Twilio.
    
    Args:
        to: Phone number in E.164 format (e.g., +15105550100)
        body: SMS message body
    
    Returns:
        JSON string with send status
    """
    try:
        logger.info("="*50)
        logger.info(f"📱 SENDING SMS to {to}")
        logger.info(f"📝 Message: {body[:50]}..." if len(body) > 50 else f"📝 Message: {body}")
        logger.info("="*50)
        
        from twilio.rest import Client
        
        sid = os.getenv("TWILIO_ACCOUNT_SID")
        token = os.getenv("TWILIO_AUTH_TOKEN")
        from_phone = os.getenv("TWILIO_PHONE_NUMBER")
        
        if not sid or not token or not from_phone:
            logger.error("❌ Twilio credentials missing in .env")
            return json.dumps({
                "status": "error",
                "error": "Twilio credentials not configured in .env"
            })
        
        # Format phone number - add +91 if it's a 10-digit Indian number
        formatted_to = to.strip()
        if not formatted_to.startswith('+'):
            # Remove any spaces, dashes, parentheses
            clean_number = ''.join(c for c in formatted_to if c.isdigit())
            
            # If 10 digits, assume Indian number and add +91
            if len(clean_number) == 10:
                formatted_to = f"+91{clean_number}"
                logger.info(f"📱 Formatted Indian number: {formatted_to}")
            # If 11 digits starting with 1, assume US number
            elif len(clean_number) == 11 and clean_number.startswith('1'):
                formatted_to = f"+{clean_number}"
            # If more than 10 digits, add + prefix
            elif len(clean_number) > 10:
                formatted_to = f"+{clean_number}"
        
        logger.info(f"📞 From: {from_phone}")
        logger.info(f"📱 To: {formatted_to}")
        logger.info("🔌 Creating Twilio client...")
        client = Client(sid, token)
        logger.info("📤 Sending message...")
        msg = client.messages.create(body=body, from_=from_phone, to=formatted_to)
        
        logger.info(f"✅ SMS sent successfully: {msg.sid}")
        logger.info("="*50)
        return json.dumps({
            "status": "sent",
            "message_id": msg.sid,
            "to": formatted_to
        })
        
    except Exception as e:
        logger.error(f"❌ Failed to send SMS: {e}", exc_info=True)
        return json.dumps({
            "status": "error",
            "error": str(e)
        })


@mcp.tool()
def send_gmail_confirmation(
    customer_name: str,
    phone: str,
    email: str,
    appointment_date: str,
    appointment_time: str,
    reason: str = "",
    contact_person: str = "Service Team"
) -> str:
    """
    Send appointment confirmation by calling n8n webhook that creates Google Calendar event.
    
    Args:
        customer_name: Customer name
        phone: Phone number
        email: Email address
        appointment_date: Appointment date in YYYY-MM-DD format
        appointment_time: Appointment time in HH:MM format
        reason: Reason for appointment (optional)
        contact_person: Contact person name (default: Service Team)
    
    Returns:
        JSON string with send status and appointment details
    """
    try:
        logger.info("="*50)
        logger.info(f"📧 SENDING APPOINTMENT CONFIRMATION to {email}")
        logger.info(f"👤 Customer: {customer_name}")
        logger.info(f"📅 Date/Time: {appointment_date} {appointment_time}")
        logger.info(f"👥 Contact: {contact_person}")
        logger.info("="*50)
        
        # Call n8n webhook
        n8n_webhook_url = os.getenv("N8N_WEBHOOK_URL", "https://n8n-nightly-tmr6.onrender.com/webhook/guntur-electronics-webhook")
        
        import requests
        payload = {
            "action": "book_appointment_with_calendar",
            "customer_name": customer_name,
            "phone": phone,
            "email": email,
            "appointment_date": appointment_date,
            "appointment_time": appointment_time,
            "reason": reason,
            "contact_person": contact_person
        }
        
        logger.info(f"🔌 Calling n8n webhook: {n8n_webhook_url}")
        response = requests.post(n8n_webhook_url, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        logger.info(f"✅ Appointment confirmed and calendar event created")
        logger.info(f"📋 Response: {result}")
        logger.info("="*50)
        
        return json.dumps({
            "status": "success",
            "message": "Appointment booked in Google Calendar and confirmation sent",
            **result
        })
        
    except Exception as e:
        logger.error(f"❌ Failed to send confirmation: {e}", exc_info=True)
        return json.dumps({
            "status": "error",
            "error": str(e)
        })


@mcp.tool()
async def update_customer_phone(
    user_id: str,
    phone: str,
    customer_name: str = ""
) -> str:
    """
    Update customer's phone number in the database.
    Call this IMMEDIATELY when customer provides their phone number during conversation.
    
    Args:
        user_id: Customer's user ID from Google OAuth
        phone: Phone number provided by customer (format: +91XXXXXXXXXX or any format)
        customer_name: Customer's name (optional)
    
    Returns:
        JSON string with update status
    """
    try:
        logger.info("="*60)
        logger.info(f"📞 UPDATING CUSTOMER PHONE")
        logger.info(f"🆔 User ID: {user_id}")
        logger.info(f"📱 Phone: {phone}")
        logger.info(f"👤 Name: {customer_name}")
        logger.info("="*60)
        
        # Call backend API to update phone
        result = await call_backend_api(
            "/api/auth/update-phone",
            method="POST",
            data={
                "user_id": user_id,
                "phone": phone,
                "name": customer_name
            }
        )
        
        logger.info(f"✅ Phone updated successfully")
        logger.info("="*60)
        
        return json.dumps({
            "status": "success",
            "message": f"Phone number {phone} saved successfully",
            "phone": phone
        })
        
    except Exception as e:
        logger.error(f"❌ Error updating phone: {e}", exc_info=True)
        return json.dumps({
            "status": "error",
            "error": f"Failed to update phone: {str(e)}"
        })


@mcp.tool()
async def get_customer_history(phone: str) -> str:
    """
    **Retrieve customer's complete history including past appointments, warranties, and transcripts.**
    
    Use this tool to cross-reference past transactions and provide personalized support.
    This addresses the problem statement requirement for "cross-referencing past transactions".
    
    When to use:
    - Customer asks: "What was my last appointment?"
    - Customer says: "Check my warranty status"
    - Customer mentions previous service: "Last time the technician came..."
    - You need context about customer's history
    
    Args:
        phone: Customer's phone number (must be exact match from database)
    
    Returns:
        JSON string with complete customer history:
        - past_appointments: List of previous service visits
        - active_warranties: Current warranty coverage
        - conversation_history: Past AI conversation summaries
        - last_service_date: Most recent interaction date
    
    Example:
        get_customer_history(phone="+919876543210")
    """
    try:
        logger.info("="*60)
        logger.info(f"📚 FETCHING CUSTOMER HISTORY")
        logger.info(f"📱 Phone: {phone}")
        logger.info("="*60)
        
        # Fetch appointments
        appointments_result = await call_backend_api(f"/api/appointments/phone/{phone}")
        appointments = appointments_result if isinstance(appointments_result, list) else []
        
        # Fetch warranties
        warranties_result = await call_backend_api(f"/api/warranties/phone/{phone}")
        warranties = warranties_result.get("warranties", []) if isinstance(warranties_result, dict) else []
        
        # Fetch transcripts (all transcripts, filter by phone if available)
        transcripts_result = await call_backend_api("/api/transcripts")
        all_transcripts = transcripts_result if isinstance(transcripts_result, list) else []
        customer_transcripts = [t for t in all_transcripts if t.get("phone") == phone]
        
        # Build summary
        summary = {
            "customer_phone": phone,
            "total_appointments": len(appointments),
            "total_warranties": len(warranties),
            "total_conversations": len(customer_transcripts),
            "past_appointments": [
                {
                    "date": apt.get("appointment_date"),
                    "time": apt.get("appointment_time"),
                    "product": apt.get("product_name", "Service"),
                    "issue": apt.get("issue_description", ""),
                    "status": apt.get("status", "unknown"),
                    "visit_charge": apt.get("visit_charge", 300)
                }
                for apt in appointments[:5]  # Last 5 appointments
            ],
            "active_warranties": [
                {
                    "product": w.get("product_name"),
                    "invoice": w.get("invoice_id"),
                    "expiry_date": w.get("warranty_end_date"),
                    "is_active": w.get("status") == "ACTIVE"
                }
                for w in warranties
            ],
            "recent_conversations": [
                {
                    "date": t.get("updated_at"),
                    "session_id": t.get("customer_id"),
                    "summary": t.get("transcript", "")[:200] + "..." if len(t.get("transcript", "")) > 200 else t.get("transcript", "")
                }
                for t in customer_transcripts[:3]  # Last 3 conversations
            ],
            "last_service_date": appointments[0].get("appointment_date") if appointments else None
        }
        
        logger.info(f"✅ Found {len(appointments)} appointments, {len(warranties)} warranties, {len(customer_transcripts)} conversations")
        logger.info("="*60)
        
        return json.dumps(summary, indent=2)
        
    except Exception as e:
        logger.error(f"❌ Error fetching customer history: {e}", exc_info=True)
        return json.dumps({
            "status": "error",
            "error": f"Failed to fetch history: {str(e)}",
            "customer_phone": phone
        })


async def _execute_transfer(room_name: str, ai_agent_identity: str) -> str:
    """Internal helper function to execute transfer logic"""
    try:
        from livekit_room_manager import initiate_transfer_to_human
        from livekit import api as lk_api
        
        logger.info("="*60)
        logger.info(f"🔄 TRANSFER REQUEST")
        logger.info(f"   Room: {room_name}")
        logger.info(f"   AI Identity: {ai_agent_identity}")
        logger.info("="*60)
        
        if not room_name or not ai_agent_identity:
            error_msg = "Both room_name and ai_agent_identity are required"
            logger.error(f"❌ {error_msg}")
            return json.dumps({
                "status": "error",
                "message": error_msg
            })
        
        # Resolve 'auto' to actual AI agent identity
        actual_agent_identity = ai_agent_identity
        if ai_agent_identity == "auto":
            logger.info("🔍 Resolving 'auto' to actual AI agent identity...")
            api_client = lk_api.LiveKitAPI(
                url=os.getenv("LIVEKIT_URL"),
                api_key=os.getenv("LIVEKIT_API_KEY"),
                api_secret=os.getenv("LIVEKIT_API_SECRET"),
            )
            try:
                participants = await api_client.room.list_participants(
                    lk_api.ListParticipantsRequest(room=room_name)
                )
                for p in participants.participants:
                    if p.kind == 4:  # AI agent
                        actual_agent_identity = p.identity
                        logger.info(f"✅ Resolved AI agent identity: {actual_agent_identity}")
                        break
            finally:
                await api_client.aclose()
            
            if actual_agent_identity == "auto":
                logger.error("❌ Could not find AI agent in room")
                return json.dumps({
                    "status": "error",
                    "message": "Could not identify AI agent"
                })
        
        # Initiate transfer asynchronously - returns immediately
        asyncio.create_task(initiate_transfer_to_human(room_name, actual_agent_identity))
        
        logger.info("✅ Transfer initiated - human agent being called")
        
        # Schedule AI agent shutdown after brief delay
        async def schedule_shutdown():
            await asyncio.sleep(8)  # Give time for AI to finish speaking
            logger.info("🚪 Triggering AI agent shutdown via remove participant")
            # Remove AI agent from room to trigger session end
            from livekit_room_manager import remove_participant_from_room
            try:
                await remove_participant_from_room(room_name, actual_agent_identity)
                logger.info("✅ AI agent removed from room")
            except Exception as e:
                logger.error(f"❌ Failed to remove AI: {e}")
        
        asyncio.create_task(schedule_shutdown())
        
        # Return immediately - transfer happens in background
        return json.dumps({
            "status": "success",
            "message": "Transfer initiated, human agent joining",
        })
        
    except Exception as e:
        logger.error(f"❌ Transfer failed: {e}")
        return json.dumps({
            "status": "error",
            "message": str(e)
        })


@mcp.tool()
async def connect_to_customer_agent(room_name: str, ai_agent_identity: str) -> str:
    """
    🔄 Transfer call to human scheme advisor/agent
    
    This initiates transfer to human agent - adds SIP call and schedules AI removal.
    
    Args:
        room_name: Current LiveKit room name (REQUIRED)
        ai_agent_identity: AI agent identity in the room (REQUIRED)
    
    🗣️ Say to citizen BEFORE calling:
    "Main abhi ek scheme advisor ko connect kar rahi hoon... ek minute dijiye..."
    
    Returns:
        JSON with transfer status
    """
    return await _execute_transfer(room_name, ai_agent_identity)


# Keep old name for compatibility but mark deprecated  
@mcp.tool()
async def transfer_to_human_agent(room_name: str, ai_agent_identity: str, reason: str = "customer request") -> str:
    """Deprecated: Use connect_to_customer_agent instead"""
    return await _execute_transfer(room_name, ai_agent_identity)


# Transfer tool disabled - monitoring conversation instead in main.py
# This prevents the agent from trying to call it and generating responses
# Transfer is now triggered automatically by monitoring keywords


# ========== New Scheme Saarthi Tools ==========

@mcp.tool()
async def search_schemes(
    age: int = None,
    gender: str = None,
    occupation: str = None,
    income: int = None,
    caste: str = None,
    state: str = None,
    category: str = None
) -> str:
    """
    Search for eligible government schemes based on citizen profile.
    
    Args:
        age: Citizen age (optional)
        gender: Gender (Male/Female/Other) (optional)
        occupation: Occupation (farmer/student/unemployed/etc) (optional)
        income: Annual income in rupees (optional)
        caste: Caste category (SC/ST/OBC/General) (optional)
        state: State name (optional)
        category: Scheme category (Agriculture/Education/Health/Housing) (optional)
    
    Returns:
        JSON list of eligible schemes with details
    
    Example:
        search_schemes(age=45, occupation="farmer", income=100000)
    """
    try:
        logger.info("🔍 Searching schemes with filters...")
        
        params = {}
        if age: params['age'] = age
        if gender: params['gender'] = gender
        if occupation: params['occupation'] = occupation
        if income: params['income'] = income
        if caste: params['caste'] = caste
        if state: params['state'] = state
        if category: params['category'] = category
        
        # Build query string
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        endpoint = f"/api/schemes/search?{query_string}" if query_string else "/api/schemes"
        
        result = await call_backend_api(endpoint, method="GET")
        
        logger.info(f"✅ Found {len(result.get('schemes', []))} schemes")
        return json.dumps(result, default=str)
        
    except Exception as e:
        logger.error(f"❌ Scheme search error: {e}", exc_info=True)
        return json.dumps({
            "schemes": [],
            "error": str(e)
        })


@mcp.tool()
async def get_scheme_details(scheme_id: str) -> str:
    """
    Get detailed information about a specific government scheme.
    
    Args:
        scheme_id: Unique scheme identifier (e.g., "PM-KISAN", "PMAY-G")
    
    Returns:
        JSON with complete scheme details including eligibility, benefits, documents required
    
    Example:
        get_scheme_details(scheme_id="PM-KISAN")
    """
    try:
        logger.info(f"📋 Fetching details for scheme: {scheme_id}")
        
        result = await call_backend_api(
            f"/api/schemes/{scheme_id}",
            method="GET"
        )
        
        logger.info(f"✅ Retrieved scheme details")
        return json.dumps(result, default=str)
        
    except Exception as e:
        logger.error(f"❌ Error fetching scheme details: {e}", exc_info=True)
        return json.dumps({
            "error": str(e),
            "scheme_id": scheme_id
        })


@mcp.tool()
async def create_application(
    citizen_phone: str,
    scheme_id: str,
    documents_submitted: list = None
) -> str:
    """
    Create a new scheme application for a citizen.
    
    Args:
        citizen_phone: Citizen phone number
        scheme_id: Scheme ID to apply for
        documents_submitted: List of document names submitted (optional)
    
    Returns:
        JSON with application ID and status
    
    Example:
        create_application(
            citizen_phone="+919999999999",
            scheme_id="PM-KISAN",
            documents_submitted=["aadhaar", "land_records"]
        )
    """
    try:
        logger.info(f"📝 Creating application for scheme: {scheme_id}")
        
        application_data = {
            "phone": citizen_phone,
            "scheme_id": scheme_id,
            "documents_submitted": documents_submitted or [],
            "status": "draft"
        }
        
        result = await call_backend_api(
            "/api/applications",
            method="POST",
            data=application_data
        )
        
        logger.info(f"✅ Application created: {result.get('_id')}")
        return json.dumps({
            "success": True,
            "application_id": str(result.get('_id')),
            "message": f"Application created for {scheme_id}",
            "details": result
        }, default=str)
        
    except Exception as e:
        logger.error(f"❌ Application creation error: {e}", exc_info=True)
        return json.dumps({
            "success": False,
            "error": str(e)
        })


@mcp.tool()
async def get_citizen_history(citizen_phone: str) -> str:
    """
    Get complete history of a citizen including applications, inquiries, and consultations.
    
    Args:
        citizen_phone: Citizen phone number
    
    Returns:
        JSON with citizen profile, applications, and interaction history
    
    Example:
        get_citizen_history(citizen_phone="+919999999999")
    """
    try:
        logger.info(f"📊 Fetching history for: {citizen_phone}")
        
        # Get citizen profile
        citizen = await call_backend_api(
            f"/api/citizens/phone/{citizen_phone}",
            method="GET"
        )
        
        # Get applications
        applications = await call_backend_api(
            f"/api/applications/phone/{citizen_phone}",
            method="GET"
        )
        
        # Get consultations
        consultations = await call_backend_api(
            f"/api/appointments/phone/{citizen_phone}",
            method="GET"
        )
        
        logger.info(f"✅ Retrieved citizen history")
        return json.dumps({
            "citizen": citizen,
            "applications": applications,
            "consultations": consultations
        }, default=str)
        
    except Exception as e:
        logger.error(f"❌ Error fetching citizen history: {e}", exc_info=True)
        return json.dumps({
            "error": str(e),
            "phone": citizen_phone
        })


@mcp.tool()
async def update_citizen_phone(old_phone: str, new_phone: str) -> str:
    """
    Update citizen's phone number in the system.
    
    Args:
        old_phone: Current phone number
        new_phone: New phone number
    
    Returns:
        JSON with update status
    """
    try:
        logger.info(f"🔄 Updating phone: {old_phone} -> {new_phone}")
        
        result = await call_backend_api(
            "/api/auth/update-phone",
            method="POST",
            data={
                "oldPhone": old_phone,
                "newPhone": new_phone
            }
        )
        
        logger.info(f"✅ Phone updated successfully")
        return json.dumps({
            "success": True,
            "message": "Phone number updated",
            "details": result
        }, default=str)
        
    except Exception as e:
        logger.error(f"❌ Phone update error: {e}", exc_info=True)
        return json.dumps({
            "success": False,
            "error": str(e)
        })


# ========== Server Entry Point ==========

if __name__ == "__main__":
    logger.info("🚀 Starting Scheme Saarthi AI MCP Server...")
    
    # Get port from environment or default to 8001
    # Use MCP_SERVER_PORT for this server specifically, fallback to PORT, then 8001
    port = int(os.getenv("MCP_SERVER_PORT", os.getenv("PORT", "8001")))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"🌐 Starting SSE server on {host}:{port}")
    logger.info(f"📊 Backend URL: {BACKEND_URL}")
    
    # Run with SSE transport for LiveKit agent integration
    mcp.run(transport="sse", host=host, port=port)
