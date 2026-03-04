# 🚀 Scheme Saarthi Startup Guide - RAG-FIRST Architecture

## ⚠️ CRITICAL: Server Startup Order

The AI agent follows a **RAG-FIRST approach** where scheme data MUST come from the RAG server. Start servers in this exact order:

```
1. MongoDB (Database) ✅
2. RAG Server (Port 8002) ⚠️ CRITICAL - Knowledge Base
3. Main MCP Server (Port 8001) - Optional (for actions)
4. Backend Server (Port 5000) - MERN API
5. Frontend (Port 3000) - Web UI
6. AI Agent (LiveKit) - Voice Interface
```

---

## 📋 Pre-Startup Checklist

### Environment Files Required:

#### 1. `ai-agent/.env`
```env
# Google Gemini AI
GOOGLE_API_KEY=your_gemini_api_key
GEMINI_MODEL=models/gemini-2.5-flash-native-audio-preview-09-2025

# LiveKit (Voice)
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxx
LIVEKIT_API_SECRET=secretxxxxx

# MCP Servers - RAG is PRIMARY
RAG_SERVER_URL=http://localhost:8002/sse  # ⚠️ CRITICAL
MCP_SERVER_URL=http://localhost:8001/sse  # Optional

# Backend API
BACKEND_URL=http://localhost:5000

# Twilio (SMS/Voice - Optional)
TWILIO_ACCOUNT_SID=ACxxxxxx
TWILIO_AUTH_TOKEN=xxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

#### 2. `rag-server/.env`
```env
# Google API for Embeddings
GOOGLE_API_KEY=your_gemini_api_key

# RAG Configuration
RAG_EMBEDDING_MODEL=text-embedding-004
RAG_EMBED_BACKEND=google
RAG_SERVER_PORT=8002

# Vector Database (ChromaDB)
CHROMADB_PATH=./chromadb_data
```

#### 3. `mern/backend/.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/schemesaarthi

# Gmail Notifications
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# LiveKit Integration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxx
LIVEKIT_API_SECRET=secretxxxxx

# Twilio (Optional)
TWILIO_ACCOUNT_SID=ACxxxxxx
TWILIO_AUTH_TOKEN=xxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🚀 Startup Sequence

### Terminal 1: RAG Server (PRIORITY 1 - MUST START FIRST)

```powershell
cd code/Amazon_AI_Challenge/rag-server

# Activate virtual environment (if using one)
.\rag_venv\Scripts\Activate.ps1

# Start RAG server on port 8002
python mcp_rag_server.py
```

**Expected Output:**
```
🚀 Starting Scheme Saarthi RAG MCP Server...
📚 Scheme knowledge base ready: 1000+ documents
🌐 Starting SSE server on 0.0.0.0:8002
✅ RAG server ready for queries
```

**Health Check:**
```powershell
curl http://localhost:8002/health
```

Should return:
```json
{
  "status": "healthy",
  "server": "scheme-saarthi-rag-server",
  "documents_count": 1000,
  "tools_available": [
    "search_scheme_knowledge",
    "search_scheme_by_category",
    "check_eligibility",
    "search_schemes_by_benefit",
    "get_scheme_knowledge"
  ]
}
```

⚠️ **DO NOT PROCEED** until RAG server is running and healthy!

---

### Terminal 2: Backend Server

```powershell
cd code/Amazon_AI_Challenge/mern/backend

# Install dependencies (first time only)
npm install

# Seed database (first time only)
node seedSchemeSaarthiData.js

# Start backend
node index.js
```

**Expected Output:**
```
🚀 Server is running on port 5000
✅ MongoDB connected successfully
📡 All routes registered
```

**Health Check:**
```powershell
curl http://localhost:5000/api/health
```

---

### Terminal 3: Frontend (Optional - for web UI)

```powershell
cd code/Amazon_AI_Challenge/mern/frontend

# Install dependencies (first time only)
npm install

# Start frontend
npm start
```

**Expected Output:**
```
Compiled successfully!
Local: http://localhost:3000
```

---

### Terminal 4: AI Agent (Voice Interface)

```powershell
cd code/Amazon_AI_Challenge/ai-agent

# Activate virtual environment (if using one)
.\venv\Scripts\Activate.ps1

# Verify RAG server is running FIRST
curl http://localhost:8002/health

# Start AI agent
python main.py
```

**Expected Output:**
```
🇮🇳 SCHEME SAARTHI AI AGENT STARTING
✅ RAG MCP server connected successfully
✅ Loaded 5 RAG tools from RAG server
📊 Total tools available: 10+
🎤 Agent ready for voice calls
```

**Critical Checks:**
- [ ] "RAG MCP server connected successfully" appears
- [ ] "Loaded X RAG tools" appears (should be 5+)
- [ ] No connection errors to port 8002

---

## 🔍 Verification Checklist

### 1. RAG Server Running ✅
```powershell
curl http://localhost:8002/health
```
Expected: `"status": "healthy"`

### 2. Backend Running ✅
```powershell
curl http://localhost:5000/api/health
```
Expected: `200 OK`

### 3. AI Agent Connected to RAG ✅
Check agent logs for:
```
✅ RAG MCP server connected successfully
✅ Loaded 5 RAG tools from RAG server
```

### 4. Test RAG Query ✅
From ai-agent terminal:
```python
# This should be done by the agent automatically
# You can verify by checking logs when agent answers scheme questions
```

---

## 🐛 Troubleshooting

### Problem: "Failed to connect to RAG server"

**Solution:**
1. Verify RAG server is running:
   ```powershell
   curl http://localhost:8002/health
   ```

2. Check RAG server logs for errors

3. Verify `.env` has correct RAG_SERVER_URL:
   ```env
   RAG_SERVER_URL=http://localhost:8002/sse
   ```

4. Check firewall/antivirus not blocking port 8002

---

### Problem: "Agent not calling RAG tools"

**Solution:**
1. Check agent prompt has RAG-FIRST instructions:
   ```python
   # In scheme_prompt.py
   "⚠️ MANDATORY: For ANY scheme question, call RAG tools FIRST"
   ```

2. Verify RAG tools loaded:
   ```
   Agent logs should show:
   "✅ Loaded 5 RAG tools from RAG server"
   ```

3. Check conversation logs for RAG tool calls:
   ```
   Should see calls to: search_scheme_knowledge, check_eligibility, etc.
   ```

---

### Problem: "RAG returns no results"

**Solution:**
1. Verify knowledge base populated:
   ```python
   cd rag-server
   python test_rag.py
   ```

2. Re-ingest schemes if needed:
   ```python
   python ingest_schemes.py
   ```

3. Check ChromaDB data exists:
   ```powershell
   ls rag-server/.vectorstore/
   ```

---

## 📊 System Health Dashboard

Once all servers are running, verify:

| Component | Port | Health Check | Status |
|-----------|------|--------------|--------|
| RAG Server | 8002 | http://localhost:8002/health | 🟢 CRITICAL |
| MCP Server | 8001 | http://localhost:8001/health | 🟡 Optional |
| Backend | 5000 | http://localhost:5000/api/health | 🟢 Required |
| Frontend | 3000 | http://localhost:3000 | 🟡 Optional |
| MongoDB | 27017 | mongo connection | 🟢 Required |
| AI Agent | - | LiveKit logs | 🟢 Required |

---

## 🎯 Quick Start Commands (All in One)

### PowerShell Script (Windows)
Save as `start_all_servers.ps1`:

```powershell
# Start RAG Server (Terminal 1)
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd code\Amazon_AI_Challenge\rag-server; .\rag_venv\Scripts\Activate.ps1; python mcp_rag_server.py"

# Wait for RAG server to start
Start-Sleep -Seconds 5

# Start Backend (Terminal 2)
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd code\Amazon_AI_Challenge\mern\backend; node index.js"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start Frontend (Terminal 3)
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd code\Amazon_AI_Challenge\mern\frontend; npm start"

# Start AI Agent (Terminal 4)
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd code\Amazon_AI_Challenge\ai-agent; .\venv\Scripts\Activate.ps1; python main.py"

Write-Host "✅ All servers starting..."
Write-Host "⚠️ Verify RAG server health: curl http://localhost:8002/health"
```

Run with:
```powershell
.\start_all_servers.ps1
```

---

## 📝 Daily Operation Checklist

✅ Before starting development:
1. [ ] MongoDB running
2. [ ] RAG server started (port 8002)
3. [ ] Backend started (port 5000)
4. [ ] Agent logs show RAG connection successful
5. [ ] Health check all endpoints

✅ Before testing voice agent:
1. [ ] RAG server healthy: `curl http://localhost:8002/health`
2. [ ] Backend healthy: `curl http://localhost:5000/api/health`
3. [ ] Agent connected to RAG (check logs)
4. [ ] LiveKit credentials configured

✅ After making changes:
1. [ ] Restart affected servers
2. [ ] Verify RAG connection re-established
3. [ ] Test with sample query
4. [ ] Check logs for errors

---

**Last Updated**: March 2, 2026  
**Architecture Version**: RAG-FIRST v2.0  
**Critical Component**: RAG Server (Port 8002)
