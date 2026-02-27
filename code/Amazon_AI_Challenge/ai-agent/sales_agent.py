"""
Sales Agent - Outbound Calling for Lead Qualification
Specialized agent for proactive sales campaigns
"""

from dotenv import load_dotenv
from sales_prompt import get_sales_agent_instructions, get_sales_agent_system_message
from livekit import agents, rtc
from livekit.agents import Agent, AgentSession
from livekit.plugins import google
from livekit.plugins.google.beta import realtime
from mcp_client import MCPServerSse
from mcp_client.agent_tools import MCPToolsIntegration
import os
import logging
import asyncio
import requests
import json
from datetime import datetime

load_dotenv()

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")


class SalesAgent(Agent):
    """Sales Agent for Outbound Calling"""
    
    def __init__(self, campaign_context: dict, tools: list = None) -> None:
        """
        Initialize sales agent with campaign context
        
        campaign_context = {
            "campaign_type": "festival_offer" | "warranty_expiry" | "amc_renewal" | "new_product_launch",
            "customer_name": "John Doe",
            "customer_phone": "+919876543210",
            "product_interest": "Air Conditioner",
            "festival_name": "Sankranti" (optional),
            "offer_details": "20% discount" (optional),
            "lead_id": "lead_mongo_id" (optional),
            "past_purchases": [...] (optional),
            "engagement_score": 75 (optional)
        }
        """
        self.campaign_context = campaign_context
        self.customer_phone = campaign_context.get('customer_phone')
        self.customer_name = campaign_context.get('customer_name')
        self.lead_id = campaign_context.get('lead_id')
        self.campaign_type = campaign_context.get('campaign_type')
        
        # Generate sales agent instructions based on campaign
        instructions = get_sales_agent_instructions(campaign_context)
        
        # Model configuration for sales calls
        model_config = {
            "model": "models/gemini-2.5-flash-native-audio-preview-09-2025",
            "voice": "Kore",  # Professional Indian female voice
            "temperature": 0.7,
        }
        
        super().__init__(
            instructions=instructions,
            llm=realtime.RealtimeModel(**model_config),
            tools=tools or [],
            allow_interruptions=True,  # Allow customer to interrupt
        )
        
        self.transcript = []
        self.call_outcome = None  # Will be set during/after call
        self.lead_qualification = {
            "interested": None,
            "budget": None,
            "timeline": None,
            "qualification_status": "unqualified"
        }
        
        logger.info(f"📞 Sales Agent initialized for {self.customer_name} ({self.customer_phone})")
        logger.info(f"   Campaign: {self.campaign_type}")
        logger.info(f"   Product: {campaign_context.get('product_interest')}")
    
    def get_transcript(self) -> str:
        """Return the full conversation transcript"""
        if not self.transcript:
            return ""
        
        transcript_lines = []
        for item in self.transcript:
            role = item.get('role', 'unknown')
            content = item.get('content', '')
            timestamp = item.get('timestamp', '')
            transcript_lines.append(f"[{timestamp}] {role.upper()}: {content}")
        
        return "\n".join(transcript_lines)
    
    async def update_lead_after_call(self):
        """Update sales lead in backend after call completes"""
        try:
            if not self.lead_id:
                logger.warning("No lead_id provided, skipping lead update")
                return
            
            # Determine call outcome and qualification
            transcript_text = self.get_transcript().lower()
            
            # Analyze transcript for qualification
            if any(word in transcript_text for word in ['interested', 'yes', 'sure', 'definitely', 'when can', 'show me']):
                self.call_outcome = 'interested'
                self.lead_qualification['interested'] = True
            elif any(word in transcript_text for word in ['not interested', 'no thanks', 'not now', 'busy']):
                self.call_outcome = 'not_interested'
                self.lead_qualification['interested'] = False
            elif 'no answer' in transcript_text or 'not available' in transcript_text:
                self.call_outcome = 'no_answer'
            else:
                self.call_outcome = 'answered'
            
            # Check for budget mentions
            if '₹' in transcript_text or 'rupees' in transcript_text or 'thousand' in transcript_text or 'lakh' in transcript_text:
                self.lead_qualification['budget'] = 'mentioned'
            
            # Check for timeline
            if any(word in transcript_text for word in ['today', 'tomorrow', 'this week', 'next week', 'soon']):
                self.lead_qualification['timeline'] = 'short_term'
            elif any(word in transcript_text for word in ['month', 'next month', 'planning']):
                self.lead_qualification['timeline'] = 'medium_term'
            
            # Determine final qualification status
            if self.lead_qualification['interested'] and self.lead_qualification.get('budget') and self.lead_qualification.get('timeline') == 'short_term':
                qualification_status = 'high_priority'
            elif self.lead_qualification['interested']:
                qualification_status = 'qualified'
            elif self.call_outcome == 'not_interested':
                qualification_status = 'disqualified'
            else:
                qualification_status = 'unqualified'
            
            # Update lead in backend
            update_data = {
                'status': 'contacted',
                'call_outcome': self.call_outcome,
                'last_call_date': datetime.now().isoformat(),
                'notes': f"Outbound call made. Outcome: {self.call_outcome}. Qualification: {qualification_status}",
                'qualification_status': qualification_status
            }
            
            response = requests.patch(
                f"{BACKEND_URL}/api/salesleads/{self.lead_id}",
                json=update_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                logger.info(f"✅ Lead updated successfully: {qualification_status}")
            else:
                logger.error(f"❌ Failed to update lead: {response.text}")
            
        except Exception as e:
            logger.error(f"Error updating lead after call: {e}")


async def sales_entrypoint(ctx: agents.JobContext):
    """
    Entrypoint for Sales Agent (outbound calls)
    Called from sipserver.py when initiating outbound sales calls
    """
    
    logger.info("=" * 60)
    logger.info("📞 SALES AGENT STARTING - Outbound Call")
    logger.info("=" * 60)
    
    # Exception handler for LiveKit errors
    def exception_handler(loop, context):
        exception = context.get('exception')
        if exception and isinstance(exception, RuntimeError):
            if 'mark_generation_done' in str(exception):
                logger.debug(f"⚠️ Suppressed voice generation race condition")
                return
        if exception and 'ChanClosed' in str(type(exception)):
            logger.debug(f"⚠️ Suppressed audio channel closure (normal)")
            return
        loop.default_exception_handler(context)
    
    loop = asyncio.get_event_loop()
    loop.set_exception_handler(exception_handler)
    
    # Get campaign context from job metadata
    # This will be passed from sipserver.py
    metadata = ctx.job.metadata or {}
    campaign_context = {
        "campaign_type": metadata.get("campaign_type", "general"),
        "customer_name": metadata.get("customer_name", "Customer"),
        "customer_phone": metadata.get("customer_phone"),
        "product_interest": metadata.get("product_interest", "electronics"),
        "festival_name": metadata.get("festival_name"),
        "offer_details": metadata.get("offer_details"),
        "lead_id": metadata.get("lead_id"),
        "past_purchases": json.loads(metadata.get("past_purchases", "[]")),
        "engagement_score": int(metadata.get("engagement_score", 0)) if metadata.get("engagement_score") else 0
    }
    
    logger.info(f"Campaign Context: {campaign_context}")
    
    # Initialize MCP Server for sales tools (if needed)
    mcp_sse_url = os.getenv("MCP_SSE_URL", "http://localhost:8000/sse")
    logger.info(f"Connecting to MCP Server: {mcp_sse_url}")
    
    try:
        mcp_client = MCPServerSse(mcp_sse_url)
        await mcp_client.initialize()
        
        mcp_tools = MCPToolsIntegration(mcp_client)
        tools = mcp_tools.get_tools()
        
        logger.info(f"✅ MCP Tools loaded: {len(tools)} tools available")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize MCP tools: {e}")
        tools = []
    
    # Create Sales Agent
    sales_agent = SalesAgent(campaign_context=campaign_context, tools=tools)
    
    # Connect to room (already created by sip.py)
    await ctx.connect(auto_subscribe=agents.AutoSubscribe.AUDIO_ONLY)
    
    # Start agent session
    session = AgentSession(agent=sales_agent)
    session.start(ctx.room)
    
    logger.info("📞 Sales call started!")
    
    # Track conversation
    @session.on("agent_speech")
    def on_agent_speech(text: str):
        """Track agent speech"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        sales_agent.transcript.append({
            "role": "agent",
            "content": text,
            "timestamp": timestamp
        })
        logger.info(f"🤖 Agent: {text}")
    
    @session.on("user_speech")
    def on_user_speech(text: str):
        """Track user speech"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        sales_agent.transcript.append({
            "role": "customer",
            "content": text,
            "timestamp": timestamp
        })
        logger.info(f"👤 Customer: {text}")
    
    # Wait for call to complete
    await session.wait_for_completion()
    
    # After call ends, update lead in backend
    logger.info("📞 Call ended. Updating lead...")
    await sales_agent.update_lead_after_call()
    
    # Save transcript
    try:
        transcript_data = {
            "phone": sales_agent.customer_phone,
            "customer_name": sales_agent.customer_name,
            "transcript": sales_agent.get_transcript(),
            "call_type": "outbound_sales",
            "campaign_type": sales_agent.campaign_type,
            "call_outcome": sales_agent.call_outcome
        }
        
        response = requests.post(
            f"{BACKEND_URL}/api/transcripts/save",
            json=transcript_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            logger.info("✅ Sales call transcript saved")
        else:
            logger.error(f"❌ Failed to save transcript: {response.text}")
    
    except Exception as e:
        logger.error(f"Error saving transcript: {e}")
    
    logger.info("=" * 60)
    logger.info("📞 SALES AGENT COMPLETED")
    logger.info("=" * 60)


if __name__ == "__main__":
    # For testing - run as standalone agent
    from livekit.agents.cli import run_app
    
    run_app(
        agents.WorkerOptions(
            entrypoint_fnc=sales_entrypoint,
        )
    )
