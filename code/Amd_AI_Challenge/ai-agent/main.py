"""
Scheme Saarthi Main Entry Point - LiveKit Agent with Gemini Realtime Model
Voice-first AI for government scheme discovery
"""

from dotenv import load_dotenv
from scheme_prompt import AGENT_INSTRUCTION, SESSION_INSTRUCTION
from livekit import agents, rtc
from livekit.agents import Agent, AgentSession
from livekit.plugins import google, simli
from livekit.plugins.google.beta import realtime
from mcp_client import MCPServerSse
from mcp_client.agent_tools import MCPToolsIntegration
from PIL import Image
from datetime import datetime, timezone
import os
import logging
import asyncio

load_dotenv()

# Setup logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Global transcript storage
conversation_transcript = []


class SchemeSaarthiAgent(Agent):
    """Scheme Saarthi AI Agent that helps citizens discover government schemes"""
    
    def __init__(self, tools: list = None, retry_on_error: bool = False, citizen_context: str = "", room_name: str = "", agent_identity: str = "") -> None:
        # Use more stable model configuration to avoid 1011 errors
        model_config = {
            "model": os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash-native-audio-preview-09-2025"),
            "voice": "Kore",  # Indian female voice
            "temperature": 0.7,  # Slightly lower temperature
        }
        
        # If retrying, use even more conservative settings
        if retry_on_error:
            model_config["temperature"] = 0.6
            logger.info("Using conservative model settings for retry")
        
        # Generate unique citizen session ID
        import uuid
        self.citizen_id = str(uuid.uuid4())[:8]  # Short unique ID
        
        # Store room name and agent identity for transfer functionality
        self.room_name = room_name
        self.agent_identity = agent_identity
        
        # Inject citizen_id and citizen context into instructions
        instructions_with_id = f"{AGENT_INSTRUCTION}\n\n🆔 YOUR CITIZEN SESSION ID: {self.citizen_id}\nUse this when creating records."
        
        # Add citizen context if provided
        if citizen_context:
            instructions_with_id += citizen_context
        
        super().__init__(
            instructions=instructions_with_id,
            llm=realtime.RealtimeModel(**model_config),
            tools=tools or [],
            allow_interruptions=True,
        )
        self.transcript = []
        logger.info(f"🆔 Generated Citizen Session ID: {self.citizen_id}")
        logger.info(f"🏠 Room Name stored: {self.room_name}")
        logger.info(f"🤖 Agent Identity stored: {self.agent_identity}")
    
    def get_transcript(self) -> str:
        """Return the full conversation transcript as a formatted string"""
        if not self.transcript:
            return ""
        
        transcript_lines = []
        for item in self.transcript:
            role = item.get('role', 'unknown')
            content = item.get('content', '')
            timestamp = item.get('timestamp', '')
            transcript_lines.append(f"[{timestamp}] {role.upper()}: {content}")
        
        return "\n".join(transcript_lines)


async def entrypoint(ctx: agents.JobContext):
    """
    Main entrypoint for the Scheme Saarthi AI agent
    Initializes the agent with Gemini realtime model and MCP tools
    """
    
    # Set up custom exception handler to suppress known LiveKit voice errors
    def exception_handler(loop, context):
        exception = context.get('exception')
        if exception and isinstance(exception, RuntimeError):
            if 'mark_generation_done' in str(exception):
                # Suppress this known race condition error in LiveKit voice
                logger.debug(f"⚠️ Suppressed voice generation race condition: {exception}")
                return
        # Suppress ChanClosed errors (normal when audio stream ends)
        if exception and 'ChanClosed' in str(type(exception)):
            logger.debug(f"⚠️ Suppressed audio channel closure (normal): {exception}")
            return
        # For other exceptions, use default handler
        loop.default_exception_handler(context)
    
    # Get current event loop and set custom handler
    loop = asyncio.get_event_loop()
    loop.set_exception_handler(exception_handler)
    
    # Get citizen info from participant metadata
    citizen_name="Citizen"
    citizen_email=""
    citizen_phone=""
    user_id=""
    
    try:
        logger.info("="*60)
        logger.info("🇮🇳 SCHEME SAARTHI AI AGENT STARTING")
        logger.info("="*60)
        logger.info(f"📍 Room Name: {ctx.room.name}")
        logger.info(f"🌐 LiveKit URL: {os.getenv('LIVEKIT_URL', 'NOT SET')}")
        logger.info(f"🔑 API Key: {'✅ Set' if os.getenv('LIVEKIT_API_KEY') else '❌ Missing'}")
        
        # Connect to the room first
        logger.info("🔗 Connecting to LiveKit room...")
        await ctx.connect()
        logger.info("✅ Connected to room")
        logger.info(f"🏠 Room state: {ctx.room.connection_state}")
        
        # Get agent identity and room name RIGHT HERE
        room_name = ctx.room.name
        # Generate a unique agent identity for this session
        import uuid
        agent_identity = f"ai-agent-{uuid.uuid4().hex[:8]}"
        logger.info(f"🤖 AI Agent Identity: {agent_identity}")
        logger.info(f"🏠 Room Name: {room_name}")
        
        # Wait for participant and extract metadata
        logger.info("⏳ Waiting for participant to join...")
        await ctx.wait_for_participant()
        logger.info(f"✅ Participant joined! Total participants: {len(ctx.room.remote_participants)}")
        
        if len(ctx.room.remote_participants) > 0:
            participant=list(ctx.room.remote_participants.values())[0]
            logger.info(f"👤 Participant: {participant.identity}")
            
            if participant.metadata:
                try:
                    import json
                    metadata=json.loads(participant.metadata)
                    citizen_email=metadata.get("email", "")
                    citizen_phone=metadata.get("phone", "")
                    user_id=metadata.get("user_id", "")
                    citizen_name=metadata.get("name", participant.identity)
                    logger.info(f"📋 Citizen: {citizen_name}")
                    logger.info(f"📧 Email: {citizen_email}")
                    logger.info(f"📞 Phone: {citizen_phone}")
                    logger.info(f"🆔 User ID: {user_id}")
                except Exception as e:
                    logger.warning(f"⚠️ Could not parse metadata: {e}")
                    citizen_name=participant.identity
        
        logger.info(f"🔑 Google API Key: {'✅ Set' if os.getenv('GOOGLE_API_KEY') else '❌ Missing'}")
        logger.info(f"🏥 MCP Server URL: {os.getenv('MCP_SERVER_URL', 'http://localhost:8001/sse')}")
        logger.info(f"📚 RAG Server URL: {os.getenv('RAG_SERVER_URL', 'http://localhost:8002/sse')}")
        logger.info("="*60)
        
        # Initialize MCP Server connections (both main and RAG)
        mcp_server_url = os.environ.get("MCP_SERVER_URL", "http://localhost:8001/sse")
        rag_server_url = os.environ.get("RAG_SERVER_URL", "http://localhost:8002/sse")
        
        logger.info(f"🔌 Connecting to main MCP server at {mcp_server_url}")
        logger.info(f"🔌 Connecting to RAG MCP server at {rag_server_url}")
        
        # Main MCP Server (scheme search, document verification, applications)
        mcp_server = MCPServerSse(
            params={"url": mcp_server_url},
            cache_tools_list=True,
            name="Scheme Saarthi MCP Server"
        )
        
        # RAG MCP Server (government scheme knowledge base)
        rag_server = MCPServerSse(
            params={"url": rag_server_url},
            cache_tools_list=True,
            name="Scheme Saarthi RAG Server"
        )
        
        # Connect and get tools from both MCP servers
        tools = []
        
        try:
            await mcp_server.connect()
            logger.info("✅ Main MCP server connected successfully")
            
            main_tools = await MCPToolsIntegration.prepare_dynamic_tools(
                mcp_servers=[mcp_server],
                convert_schemas_to_strict=True,
                auto_connect=False
            )
            tools.extend(main_tools)
            logger.info(f"✅ Loaded {len(main_tools)} tools from main server")
        except Exception as e:
            logger.warning(f"⚠️ Failed to connect to main MCP server: {e}")
        
        try:
            await rag_server.connect()
            logger.info("✅ RAG MCP server connected successfully")
            
            rag_tools = await MCPToolsIntegration.prepare_dynamic_tools(
                mcp_servers=[rag_server],
                convert_schemas_to_strict=True,
                auto_connect=False
            )
            tools.extend(rag_tools)
            logger.info(f"✅ Loaded {len(rag_tools)} RAG tools from RAG server")
        except Exception as e:
            logger.warning(f"⚠️ Failed to connect to RAG server: {e}")
            logger.info("ℹ️ Agent will work without knowledge base access")
        
        logger.info(f"📊 Total tools available: {len(tools)}")
        
        # Get n8n webhook URL from environment
        n8n_webhook_url = os.getenv("N8N_WEBHOOK_URL", "https://schemesaarthi-webhook.example.com/webhook")
        logger.info(f"🔗 n8n Webhook URL: {n8n_webhook_url}")
        
        # Build citizen context BEFORE creating agent
        # Check if phone is missing for conversational collection
        phone_status = "✅ Phone available" if citizen_phone else "⚠️ PHONE MISSING - Ask citizen naturally"
        logger.info(f"📞 Phone Status: {phone_status}")
        
        # Build citizen context to inject into instructions
        if citizen_phone:
            citizen_context = f"""

🆔 CURRENT CITIZEN INFORMATION:
- Name: {citizen_name}
- Email: {citizen_email}
- Phone: {citizen_phone}
- User ID: {user_id}

📍 SESSION INFORMATION:
- Room Name: {room_name}

IMPORTANT:
- When searching schemes or creating applications, use phone number: {citizen_phone}
- When the citizen starts speaking, greet them by name: "Namaste {citizen_name}!"
- You already know their contact details, so don't ask for phone/email unless updating.

🔄 TO TRANSFER TO HUMAN AGENT:
- Say: "I understand. Let me connect you with a government helpdesk officer right away. Please hold for just a moment."
- Then call: transfer_to_human_agent(room_name="{room_name}", ai_agent_identity="auto", reason="Citizen requested human assistance")
- Note: Use "auto" for ai_agent_identity - the system will detect it automatically
"""
            has_phone = True
        else:
            # Phone is missing - instruct agent to ask only when needed
            citizen_context = f"""

🆔 CURRENT CITIZEN INFORMATION:
- Name: {citizen_name}
- Email: {citizen_email}
- Phone: ⚠️ NOT PROVIDED YET
- User ID: {user_id}

📍 SESSION INFORMATION:
- Room Name: {room_name}

⚠️ PHONE NUMBER COLLECTION:
- The citizen has NOT provided their phone number yet.
- Greet them normally by name: "Namaste {citizen_name}!"
- DO NOT ask for phone number immediately or upfront.
- ONLY ask for phone number when citizen wants to:
  * Apply for a scheme
  * Receive SMS eligibility reports
  * Track application status
  * Any action that requires contacting them
- When they need these services, say: "To proceed, I'll need your phone number. What's your mobile number?"
- When they provide it, IMMEDIATELY call: update_citizen_phone(user_id="{user_id}", phone="<their_phone>", citizen_name="{citizen_name}")
- After saving, continue with the requested service naturally.
- For general questions about schemes, NO phone number needed.

🔄 TO TRANSFER TO HUMAN AGENT:
- Say: "I understand. Let me connect you with a government helpdesk officer right away. Please hold for just a moment."
- Then call: transfer_to_human_agent(room_name="{room_name}", ai_agent_identity="auto", reason="Citizen requested human assistance")
- Note: Use "auto" for ai_agent_identity - the system will detect it automatically
"""
        
        logger.info("✅ Citizen context prepared for agent instructions")
        
        # Create agent with all MCP tools and citizen context
        logger.info("Creating SchemeSaarthiAgent with citizen context...")
        agent = SchemeSaarthiAgent(
            tools=tools, 
            retry_on_error=False, 
            citizen_context=citizen_context,
            room_name=room_name,
            agent_identity=agent_identity
        )
        
        # Update agent's citizen_id to use phone for better tracking
        if citizen_phone:
            agent.citizen_id = citizen_phone.replace("+", "").replace(" ", "").replace("-", "")
            logger.info(f"🆔 Using phone as citizen ID: {agent.citizen_id}")
        
        logger.info("✅ Agent created successfully with citizen context injected")
        
        # Create agent session without llm (it's in the Agent now)
        logger.info("📦 Creating agent session...")
        session = AgentSession()
        logger.info("✅ Agent session created")
        
        # Set up conversation tracking with transcript
        @session.on("conversation_item_added")
        def on_conversation_item_added(event):
            """Track all conversation items for transcript"""
            try:
                from datetime import datetime
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                
                role = event.item.role if hasattr(event.item, 'role') else 'unknown'
                content = event.item.text_content if hasattr(event.item, 'text_content') else ''
                
                if content and content.strip():
                    transcript_entry = {
                        'role': role,
                        'content': content.strip(),
                        'timestamp': timestamp
                    }
                    
                    # Safely append to transcript
                    try:
                        agent.transcript.append(transcript_entry)
                        conversation_transcript.append(transcript_entry)
                    except Exception as append_error:
                        logger.warning(f"⚠️ Could not append to transcript: {append_error}")
                    
                    role_display = role.upper() if role in ['user', 'assistant'] else role
                    logger.info(f"📝 [{role_display}] {content[:100]}{'...' if len(content) > 100 else ''}")
            except Exception as e:
                logger.error(f"❌ Error tracking conversation: {e}")
        
        # ============= TAVUS CODE COMMENTED OUT - NOW USING SIMLI =============
        # tavus_api_key = os.getenv("TAVUS_API_KEY")
        # tavus_replica_id = os.getenv("TAVUS_REPLICA_ID")
        # tavus_persona_id = os.getenv("TAVUS_PERSONA_ID")
        # 
        # if tavus_api_key and (tavus_replica_id or tavus_persona_id):
        #     logger.info("🎭 Initializing Tavus video avatar...")
        #     logger.info(f"   API Key: {'✅ Set' if tavus_api_key else '❌ Missing'}")
        #     logger.info(f"   Replica ID: {tavus_replica_id or 'Not set'}")
        #     logger.info(f"   Persona ID: {tavus_persona_id or 'Not set'}")
        #     try:
        #         avatar_session = tavus.AvatarSession(
        #             api_key=tavus_api_key,
        #             replica_id=tavus_replica_id,
        #             persona_id=tavus_persona_id,
        #         )
        #         await avatar_session.start(
        #             agent_session=session,
        #             room=ctx.room,
        #         )
        #         logger.info("✅ Tavus video avatar initialized successfully")
        #         logger.info("📹 Video feed should now be visible in the UI")
        #     except Exception as e:
        #         logger.warning(f"⚠️ Failed to initialize Tavus avatar: {e}")
        #         logger.info("ℹ️ Continuing in voice-only mode...")
        # else:
        #     logger.info("ℹ️ Tavus avatar not configured - running in voice-only mode")
        #     if not tavus_api_key:
        #         logger.info("   Missing: TAVUS_API_KEY")
        #     if not tavus_replica_id and not tavus_persona_id:
        #         logger.info("   Missing: TAVUS_REPLICA_ID or TAVUS_PERSONA_ID")
        # =======================================================================
        
        # Initialize Simli Avatar for video
        simli_api_key = os.getenv("SIMLI_API_KEY")
        simli_face_id = os.getenv("SIMLI_FACE_ID")
        
        if simli_api_key and simli_face_id:
            logger.info("🎭 Initializing Simli video avatar...")
            logger.info(f"   API Key: {'✅ Set' if simli_api_key else '❌ Missing'}")
            logger.info(f"   Face ID: {simli_face_id or 'Not set'}")
            try:
                simli_avatar = simli.AvatarSession(
                    simli_config=simli.SimliConfig(
                        api_key=simli_api_key,
                        face_id=simli_face_id,
                    ),
                )
                await simli_avatar.start(session, room=ctx.room)
                logger.info("✅ Simli video avatar initialized successfully")
                logger.info("📹 Video feed should now be visible in the UI")
            except Exception as e:
                logger.warning(f"⚠️ Failed to initialize Simli avatar: {e}")
                logger.info("ℹ️ Continuing in voice-only mode...")
        else:
            logger.info("ℹ️ Simli avatar not configured - running in voice-only mode")
            if not simli_api_key:
                logger.info("   Missing: SIMLI_API_KEY")
            if not simli_face_id:
                logger.info("   Missing: SIMLI_FACE_ID")
        
        # Transcript auto-save removed (legacy flow). Keep in-memory transcript only.
        
        # Audio-only mode - no video input from users
        # The session will only process audio tracks from citizens
        # Avatar video (Simli) is still sent to citizens for visual feedback
        
        # Add handler for tool results to detect transfer
        @session.on("agent_speech_committed")
        def on_agent_speech_committed(message: agents.llm.ChatMessage):
            """Log agent speech"""
            try:
                content = str(message.content)
                logger.info(f"📝 [ASSISTANT] {content[:100]}{'...' if len(content) > 100 else ''}")
                
                # Add to transcript with timestamp
                agent.transcript.append({
                    "role": "assistant",
                    "content": content,
                    "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
                })
            except Exception as e:
                logger.error(f"❌ Error in speech committed handler: {e}")
        
        # Add disconnect handler to save transcript and cleanup session
        @ctx.room.on("participant_disconnected")
        def on_participant_disconnected(participant: rtc.RemoteParticipant):
            """Save transcript and cleanup session when participant disconnects"""
            try:
                logger.info("="*60)
                logger.info(f"👋 Participant disconnected: {participant.identity}")
                logger.info("="*60)
                
                # Perform session cleanup
                asyncio.create_task(cleanup_session_on_disconnect(participant))
                
            except Exception as e:
                logger.error(f"❌ Error in disconnect handler: {e}", exc_info=True)
        
        async def cleanup_session_on_disconnect(participant):
            """Async cleanup when participant disconnects"""
            try:
                # Get the transcript
                transcript_text = agent.get_transcript()
                
                if transcript_text and len(transcript_text) > 10:
                    logger.info(f"💾 Saving transcript ({len(transcript_text)} chars)...")
                    logger.info("📝 Transcript preview:")
                    logger.info(transcript_text[:500] + "..." if len(transcript_text) > 500 else transcript_text)
                    
                    # Save transcript to backend using citizen_id
                    citizen_id = agent.citizen_id
                    logger.info(f"🆔 Citizen ID: {citizen_id}")
                    
                    # Call backend API to save transcript
                    try:
                        import aiohttp
                        backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
                        
                        logger.info(f"📞 Saving transcript for citizen_id: {citizen_id}")
                        
                        # Save to new transcripts collection with citizen details
                        async with aiohttp.ClientSession() as http_session:
                            save_url = f"{backend_url}/api/transcripts"
                            payload = {
                                "citizen_id": citizen_id,
                                "transcript": transcript_text,
                                "phone": citizen_phone,  # Include phone
                                "citizen_name": citizen_name  # Include name
                            }
                            
                            logger.info(f"📞 POST {save_url}")
                            logger.info(f"🆔 Citizen ID: {citizen_id}")
                            logger.info(f"👤 Citizen Name: {citizen_name}")
                            logger.info(f"📱 Phone: {citizen_phone}")
                            logger.info(f"📝 Transcript length: {len(transcript_text)} chars")
                            
                            async with http_session.post(
                                save_url,
                                json=payload,
                                timeout=aiohttp.ClientTimeout(total=10)
                            ) as response:
                                if response.status == 200:
                                    result = await response.json()
                                    logger.info("✅ Transcript saved successfully!")
                                    logger.info(f"📋 Transcript ID: {result.get('_id', 'N/A')}")
                                else:
                                    error_text = await response.text()
                                    logger.error(f"❌ Failed to save transcript: {response.status} - {error_text}")
                        
                    except Exception as e:
                        logger.error(f"❌ Error saving transcript: {e}", exc_info=True)
                else:
                    logger.info("ℹ️ No significant transcript to save")
                
                # Clean up LiveKit session
                try:
                    import aiohttp
                    backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
                    
                    # Notify backend to end the LiveKit session
                    async with aiohttp.ClientSession() as http_session:
                        cleanup_url = f"{backend_url}/api/livekit/end-call"
                        payload = {
                            "roomName": room_name,
                            "participant_identity": agent.agent_identity
                        }
                        
                        logger.info(f"🧹 Cleaning up LiveKit session: {room_name}")
                        async with http_session.post(
                            cleanup_url,
                            json=payload,
                            timeout=aiohttp.ClientTimeout(total=10)
                        ) as response:
                            if response.ok:
                                result = await response.json()
                                logger.info("✅ LiveKit session cleaned up successfully")
                            else:
                                logger.warning(f"⚠️ LiveKit cleanup response: {response.status}")
                            
                except Exception as e:
                    logger.error(f"❌ Error cleaning up LiveKit session: {e}")
                
                # Final cleanup
                logger.info("✅ Session cleanup completed")
                    
            except Exception as e:
                logger.error(f"❌ Error in session cleanup: {e}", exc_info=True)
        
        # Start the session
        logger.info("🚀 Starting agent session...")
        try:
            # Set agent identity BEFORE starting (we'll update it after)
            agent.agent_identity = agent_identity
            
            await session.start(
                room=ctx.room,
                agent=agent,
            )
            logger.info("✅ Agent session started successfully")
            
            # NOW get the actual agent identity from the local participant
            actual_agent_identity = ctx.room.local_participant.identity if ctx.room.local_participant else agent_identity
            agent.agent_identity = actual_agent_identity
            logger.info(f"✅ Agent identity confirmed: {actual_agent_identity}")
            
        except Exception as start_error:
            logger.error(f"❌ Failed to start agent session: {start_error}", exc_info=True)
            # Try to recover by reconnecting
            logger.info("🔄 Attempting to recover...")
            await asyncio.sleep(2)
            raise
        
        # Don't generate initial reply - let the agent respond to user input
        # The agent will automatically greet when user speaks
        logger.info("="*60)
        logger.info("✅ SCHEME SAARTHI AI AGENT IS READY AND RUNNING")
        logger.info("🎙️  Speak to start the conversation...")
        logger.info("="*60)
        
        logger.info("✅ Agent session running with transcript capture on disconnect")
        
    except asyncio.CancelledError:
        logger.info("🛑 Agent session cancelled gracefully")
        raise
    except Exception as e:
        logger.error(f"❌ Error in entrypoint: {e}", exc_info=True)
        raise
    finally:
        # Final cleanup
        try:
            logger.info("🧹 Cleaning up agent session...")
            if agent and hasattr(agent, 'transcript'):
                transcript_text = agent.get_transcript()
                if transcript_text:
                    logger.info(f"📊 Final transcript length: {len(transcript_text)} chars")
        except Exception as e:
            logger.error(f"⚠️ Error in cleanup: {e}")


if __name__ == "__main__":
    # Run the LiveKit agent worker
    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint
        )
    )
