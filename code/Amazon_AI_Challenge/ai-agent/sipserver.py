"""
SIP Call Server - FastAPI Server for Outbound Awareness Calls
Handles campaign-based outbound calling for scheme awareness and benefit notifications
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import os
import subprocess
import logging
from datetime import datetime
from dotenv import load_dotenv
import aiohttp

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Scheme Saarthi SIP Server",
    description="Outbound awareness call server for government scheme campaigns and benefit notifications",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Backend API URL
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")


# ========== Request Models ==========

class AwarenessCallRequest(BaseModel):
    citizen_phone: str = Field(..., description="Citizen phone number in E.164 format")
    citizen_name: str = Field(..., description="Citizen full name")
    campaign_type: str = Field(..., description="Campaign type: scheme_awareness, deadline_reminder, application_status, document_required")
    scheme_name: Optional[str] = Field("", description="Scheme name (e.g., PM-KISAN, PMAY-G, Ayushman Bharat)")
    message_details: Optional[str] = Field("", description="Specific message details")
    scheme_category: Optional[str] = Field("", description="Scheme category (Agriculture, Education, Healthcare)")


# ========== Helper Functions ==========

async def call_backend_api(endpoint: str, method: str = "GET", data: dict = None):
    """Helper function to call MERN backend API"""
    url = f"{BACKEND_URL}{endpoint}"
    
    async with aiohttp.ClientSession() as session:
        if method == "GET":
            async with session.get(url) as response:
                return await response.json()
        elif method == "POST":
            async with session.post(url, json=data) as response:
                return await response.json()


# ========== Routes ==========

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Scheme Saarthi SIP Server",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "initiate_call": "POST /initiate-awareness-call or POST /sip/initiate-awareness-call",
            "health": "GET /health or GET /sip/health"
        }
    }


# CloudFront proxied root with /sip prefix
@app.get("/sip")
async def root_sip():
    """Root endpoint (CloudFront /sip prefix)"""
    return await root()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "server": "schemesaarthi-sip-server",
        "timestamp": datetime.now().isoformat(),
        "backend_url": BACKEND_URL
    }


# CloudFront proxied routes with /sip prefix
@app.get("/sip/health")
async def health_check_sip():
    """Health check endpoint (CloudFront /sip prefix)"""
    return await health_check()


@app.post("/sip/initiate-awareness-call")
async def initiate_awareness_call_sip(request: AwarenessCallRequest):
    """Initiate awareness call (CloudFront /sip prefix)"""
    return await initiate_awareness_call(request)


@app.post("/initiate-awareness-call")
async def initiate_awareness_call(request: AwarenessCallRequest):
    """
    Initiate an outbound awareness call for proactive scheme campaigns.
    This creates a scheme inquiry, then starts a SIP call via LiveKit.
    
    Example:
    {
        "citizen_phone": "+919999999999",
        "citizen_name": "Ramesh Kumar",
        "campaign_type": "scheme_awareness",
        "scheme_name": "PM-KISAN",
        "message_details": "You may be eligible for ₹6000/year direct cash benefit",
        "scheme_category": "Agriculture"
    }
    """
    try:
        logger.info("📞"*25)
        logger.info(f"📱 INITIATING AWARENESS CALL")
        logger.info(f"   Citizen: {request.citizen_name}")
        logger.info(f"   Phone: {request.citizen_phone}")
        logger.info(f"   Campaign: {request.campaign_type}")
        if request.scheme_name:
            logger.info(f"   Scheme: {request.scheme_name}")
        if request.message_details:
            logger.info(f"   Message: {request.message_details}")
        logger.info("📞"*25)
        
        # Create campaign context
        campaign_context = {
            "citizen_phone": request.citizen_phone,
            "citizen_name": request.citizen_name,
            "campaign_type": request.campaign_type,
            "scheme_name": request.scheme_name,
            "message_details": request.message_details,
            "scheme_category": request.scheme_category,
            "call_initiated_at": datetime.now().isoformat()
        }
        
        # Create scheme inquiry record in backend
        inquiry_notes = f"Outbound call initiated for {request.campaign_type}"
        if request.scheme_name:
            inquiry_notes += f" - {request.scheme_name}"
        if request.message_details:
            inquiry_notes += f". Message: {request.message_details}"
        
        inquiry_result = await call_backend_api(
            "/api/scheme-inquiries",
            method="POST",
            data={
                "phone": request.citizen_phone,
                "citizen_name": request.citizen_name,
                "scheme_id": request.scheme_name or "general",
                "scheme_category": request.scheme_category,
                "notes": inquiry_notes,
                "status": "calling",
                "campaign_context": campaign_context
            }
        )
        
        logger.info(f"✅ Scheme inquiry created: {inquiry_result.get('_id')}")
        
        # Call sip.py as subprocess to initiate the call
        # Use sys.executable to get the current Python interpreter (from venv)
        import sys
        cmd = [
            sys.executable,  # This will use the virtual environment's Python
            os.path.join(os.path.dirname(__file__), "sip.py"),
            "--to", request.citizen_phone,
            "--citizen-name", request.citizen_name
        ]
        
        logger.info(f"🔌 Calling sip.py subprocess: {' '.join(cmd)}")
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if proc.returncode != 0:
            logger.error(f"❌ SIP call failed: {proc.stderr}")
            raise HTTPException(
                status_code=500,
                detail={
                    "success": False,
                    "error": proc.stderr.strip(),
                    "inquiry_id": str(inquiry_result.get('_id'))
                }
            )
        
        # Parse sip.py output
        sip_output = proc.stdout.strip()
        try:
            call_data = eval(sip_output)  # sip.py prints a dict
        except:
            call_data = {"raw_output": sip_output}
        
        logger.info(f"✅ Call initiated successfully")
        logger.info(f"   Room: {call_data.get('room', 'unknown')}")
        logger.info(f"   Participant: {call_data.get('participant_identity', 'unknown')}")
        logger.info("📞"*25)
        
        return {
            "success": True,
            "call_initiated": True,
            "citizen_name": request.citizen_name,
            "citizen_phone": request.citizen_phone,
            "campaign_type": request.campaign_type,
            "scheme_name": request.scheme_name,
            "message_details": request.message_details,
            "room": call_data.get('room'),
            "inquiry_id": str(inquiry_result.get('_id')),
            "message": f"Outbound awareness call initiated to {request.citizen_name} for {request.campaign_type}",
            "call_details": call_data
        }
        
    except subprocess.TimeoutExpired:
        logger.error("❌ SIP call timeout")
        raise HTTPException(
            status_code=504,
            detail={
                "success": False,
                "error": "Call initiation timeout after 30 seconds"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error initiating sales call: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": str(e)
            }
        )


# ========== Run Server ==========

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("SIP_SERVER_PORT", "8003"))
    host = "0.0.0.0"
    
    logger.info("🚀 Starting Scheme Saarthi SIP Server...")
    logger.info(f"🌐 Server will run on {host}:{port}")
    
    uvicorn.run(app, host=host, port=port, log_level="info")
