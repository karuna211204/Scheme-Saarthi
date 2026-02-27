"""
SIP Call Server - FastAPI Server for Outbound Sales Calls
Handles campaign-based outbound calling with festival offers and promotions
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
    description="Outbound sales call server for festival campaigns and promotions",
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

class SalesCallRequest(BaseModel):
    customer_phone: str = Field(..., description="Customer phone number in E.164 format")
    customer_name: str = Field(..., description="Customer full name")
    campaign_type: str = Field(..., description="Campaign type: festival_offer, warranty_expiry, amc_renewal, new_product_launch")
    festival_name: Optional[str] = Field("", description="Festival name (e.g., Sankranti, Diwali, Ugadi)")
    offer_details: Optional[str] = Field("", description="Specific offer details")
    product_interest: Optional[str] = Field("", description="Product customer might be interested in")


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
            "initiate_call": "POST /initiate-sales-call or POST /sip/initiate-sales-call",
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


@app.post("/sip/initiate-sales-call")
async def initiate_sales_call_sip(request: SalesCallRequest):
    """Initiate sales call (CloudFront /sip prefix)"""
    return await initiate_sales_call(request)


@app.post("/initiate-sales-call")
async def initiate_sales_call(request: SalesCallRequest):
    """
    Initiate an outbound sales call for proactive campaigns.
    This creates a sales lead, then starts a SIP call via LiveKit.
    
    Example:
    {
        "customer_phone": "+919999999999",
        "customer_name": "Ramesh Kumar",
        "campaign_type": "festival_offer",
        "festival_name": "Sankranti",
        "offer_details": "30% off + Free installation on all washing machines",
        "product_interest": "Washing Machine"
    }
    """
    try:
        logger.info("📞"*25)
        logger.info(f"📱 INITIATING SALES CALL")
        logger.info(f"   Customer: {request.customer_name}")
        logger.info(f"   Phone: {request.customer_phone}")
        logger.info(f"   Campaign: {request.campaign_type}")
        if request.festival_name:
            logger.info(f"   Festival: {request.festival_name}")
        if request.offer_details:
            logger.info(f"   Offer: {request.offer_details}")
        logger.info("📞"*25)
        
        # Create campaign context
        campaign_context = {
            "customer_phone": request.customer_phone,
            "customer_name": request.customer_name,
            "campaign_type": request.campaign_type,
            "festival_name": request.festival_name,
            "offer_details": request.offer_details,
            "product_interest": request.product_interest,
            "call_initiated_at": datetime.now().isoformat()
        }
        
        # Create sales lead record in backend
        lead_notes = f"Outbound call initiated for {request.campaign_type}"
        if request.festival_name:
            lead_notes += f" - {request.festival_name} campaign"
        if request.offer_details:
            lead_notes += f". Offer: {request.offer_details}"
        
        lead_result = await call_backend_api(
            "/api/salesleads",
            method="POST",
            data={
                "phone": request.customer_phone,
                "customer_name": request.customer_name,
                "lead_type": request.campaign_type,
                "product_interest": request.product_interest,
                "notes": lead_notes,
                "status": "calling",
                "campaign_context": campaign_context
            }
        )
        
        logger.info(f"✅ Sales lead created: {lead_result.get('_id')}")
        
        # Call sip.py as subprocess to initiate the call
        # Use sys.executable to get the current Python interpreter (from venv)
        import sys
        cmd = [
            sys.executable,  # This will use the virtual environment's Python
            os.path.join(os.path.dirname(__file__), "sip.py"),
            "--to", request.customer_phone,
            "--customer-name", request.customer_name
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
                    "lead_id": str(lead_result.get('_id'))
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
            "customer_name": request.customer_name,
            "customer_phone": request.customer_phone,
            "campaign_type": request.campaign_type,
            "festival_name": request.festival_name,
            "offer_details": request.offer_details,
            "room": call_data.get('room'),
            "lead_id": str(lead_result.get('_id')),
            "message": f"Outbound call initiated to {request.customer_name} for {request.campaign_type}",
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
