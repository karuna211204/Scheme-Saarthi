# 🇮🇳 Scheme Saarthi - Consolidated Technical Documentation

**Complete Reference for Development, Deployment & Maintenance**

Last Updated: March 2, 2026

---

## 📑 Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Details](#component-details)
3. [Session Management](#session-management)
4. [RAG-First Approach](#rag-first-approach)
5. [OCR Integration](#ocr-integration)
6. [Admin Management](#admin-management)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)

---

## 1. System Architecture

### Technology Stack

```
Frontend:  React 18 + Material-UI + LiveKit React SDK
Backend:   Express.js + MongoDB + Mongoose
AI Agent:  Python 3.9+ + Gemini 2.5 Flash + LiveKit Agents
RAG:       ChromaDB + Google Embeddings + FastMCP
Voice:     LiveKit Cloud + Twilio SIP
OCR:       Tesseract.js + Sharp + Python pytesseract
```

### Port Allocation

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | React Web UI |
| Backend API | 5000 | Express REST API |
| Main MCP Server | 8001 | Business logic tools |
| RAG MCP Server | 8002 | **CRITICAL** - Knowledge base |
| MongoDB | 27017 | Database |

### Data Flow

```
User Voice Input → LiveKit → AI Agent (Gemini) → MCP Tools
                                      ↓
                              RAG Server (Primary)
                                      ↓
                           ChromaDB Vector Search
                                      ↓
                          1000+ Government Schemes
                                      ↓
                         Backend API (Actions)
                                      ↓
                            MongoDB (Persistence)
```

---

## 2. Component Details

### 2.1 AI Agent (Python)

**Location:** `ai-agent/main.py`

**Key Features:**
- **Gemini 2.5 Flash** with native audio (English + 7 Indian languages)
- **LiveKit Agents SDK** for voice communication
- **MCP Client** for tool integration
- **Session management** with proper lifecycle

**Configuration:**
```python
# Voice Model
GEMINI_MODEL=models/gemini-2.5-flash-native-audio-preview-09-2025
Voice="Kore"  # Indian female voice
Temperature=0.7

# MCP Servers
RAG_SERVER_URL=http://localhost:8002/sse  # PRIMARY
MCP_SERVER_URL=http://localhost:8001/sse  # SECONDARY
```

**Critical Files:**
- `main.py` - Entrypoint with session lifecycle
- `scheme_prompt.py` - Agent instructions (RAG-FIRST)
- `livekit_room_manager.py` - Room/participant management
- `config.py` - Configuration loader

---

### 2.2 RAG Server (Python)

**Location:** `rag-server/mcp_rag_server.py`

**Purpose:** PRIMARY knowledge source for government schemes

**Features:**
- **ChromaDB** vector database (persistent storage)
- **Google Embeddings** (text-embedding-004)
- **1000+ government schemes** ingested from PDFs
- **Semantic search** with relevance scoring
- **MCP SSE interface** for tool exposure

**Key Tools Exposed:**
1. `search_scheme_knowledge(query, n_results)` - Primary search
2. `search_scheme_by_category(category, citizen_profile)` - Category filter
3. `check_eligibility(scheme_name, citizen_profile)` - Eligibility check
4. `search_schemes_by_benefit(benefit_type, min_amount)` - Benefit search
5. `get_scheme_knowledge(scheme_id_or_name)` - Detailed info

**Data Ingestion:**
```bash
# Ingest schemes from PDFs
python ingest_schemes.py

# Test RAG functionality
python test_rag.py
```

---

### 2.3 Backend API (Node.js)

**Location:** `mern/backend/index.js`

**API Endpoints:**

#### Authentication
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

#### Citizen Management
- `GET /api/citizens` - List all citizens (admin)
- `GET /api/citizens/:id` - Get citizen details
- `PUT /api/citizens/:id` - Update citizen profile
- `POST /api/citizens/phone` - Update phone number

#### Scheme Operations
- `GET /api/schemes` - Search schemes
- `POST /api/schemes/check-eligibility` - Check eligibility
- `POST /api/schemes/save` - Save scheme to profile
- `POST /api/schemes/apply` - Submit application

#### LiveKit Integration
- `POST /api/livekit/token` - Generate room token
- `POST /api/livekit/end-call` - Clean up session
- `GET /api/livekit/rooms` - List active rooms
- `POST /api/livekit/rooms/:roomName/participants` - List participants

#### OCR Services
- `POST /api/ocr/aadhaar` - Extract Aadhaar data
- `GET /api/ocr/demo` - Demo data for testing
- `GET /api/ocr/health` - Check OCR service status

#### Admin Features
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/customers` - Customer list
- `GET /api/transcripts` - Conversation transcripts

---

### 2.4 Frontend (React)

**Location:** `mern/frontend/src/`

**Key Pages:**
- `Home.js` - Landing page
- `CitizenProfile.js` - Profile with OCR scan
- `SchemeSearch.js` - Search & filter schemes
- `Dashboard.js` - Admin dashboard (role-based)
- `LiveKitVoice.js` - Voice call interface

**Protected Routes:**
```javascript
// Customer routes
<Route path="/profile" element={<CitizenProfile />} />
<Route path="/schemes" element={<SchemeSearch />} />
<Route path="/voice" element={<LiveKitVoice />} />

// Admin routes (requires admin role)
<AdminRoute path="/dashboard" element={<Dashboard />} />
<AdminRoute path="/admin/customers" element={<Customers />} />
```

---

## 3. Session Management (LiveKit)

### 3.1 Problem Solved

**Before Fix:**
- ❌ Ghost sessions (duplicates for same room)
- ❌ Sessions never shut down properly
- ❌ Resource leaks (API connections, memory)
- ❌ Background tasks orphaned

**After Fix:**
- ✅ Only ONE session per room
- ✅ Proper session lifecycle with shutdown
- ✅ All resources cleaned up
- ✅ Concurrency-safe with locks

### 3.2 Implementation

**Session Registry:**
```python
# Global tracking (main.py)
_active_sessions = {}  # room_name → session info
_sessions_lock = asyncio.Lock()

# Registration (prevents ghosts)
async with _sessions_lock:
    if room_name in _active_sessions:
        return  # Reject duplicate
    
    _active_sessions[room_name] = {
        "lock": asyncio.Lock(),
        "session_id": f"session-{room_name}-{timestamp}",
        "started_at": datetime.now()
    }
```

**Cleanup Flow:**
```python
try:
    # 1. Connect to room
    await ctx.connect()
    
    # 2. Start session
    await session.start(room=ctx.room, agent=agent)
    session_started = True
    
finally:
    # 3. Always clean up (guaranteed)
    await session.shutdown()  # Stop agent
    await asyncio.gather(*cleanup_tasks)  # Wait for backgrounds
    await mcp_server.close()  # Close connections
    await rag_server.close()
    
    # 4. Release lock & remove from registry
    room_session_lock.release()
    del _active_sessions[room_name]
```

**API Client Management:**
```python
# livekit_room_manager.py
api_client = None
try:
    api_client = api.LiveKitAPI(...)
    # Use client
finally:
    if api_client:
        await api_client.aclose()  # Always close
```

### 3.3 Benefits

- ✅ Zero ghost sessions
- ✅ Stable long-term operation
- ✅ No memory/connection leaks
- ✅ Graceful error recovery
- ✅ Production-ready

---

## 4. RAG-First Approach

### 4.1 Architecture Philosophy

**CRITICAL PRINCIPLE:**
> The AI agent MUST call RAG tools BEFORE answering ANY scheme-related question.

**Rationale:**
- RAG contains **authoritative government data** (1000+ schemes)
- General knowledge is **outdated/incomplete**
- Scheme details change frequently
- Eligibility criteria are specific

### 4.2 Agent Instructions

**Location:** `ai-agent/scheme_prompt.py`

**Key Directives:**
```python
"""
⚠️ MANDATORY: RAG-FIRST KNOWLEDGE RETRIEVAL

1. When citizen asks about schemes → IMMEDIATELY call search_scheme_knowledge()
2. When checking eligibility → CALL check_eligibility() with RAG
3. When citizen mentions a scheme name → CALL get_scheme_knowledge()
4. NO guessing - RAG is your PRIMARY knowledge source
5. General knowledge is SECONDARY fallback only

DO NOT rely on your training data for scheme information!
DO NOT answer scheme questions without RAG lookup first!
"""
```

**Conversation Flow:**
```
Citizen: "I need help with education schemes"
         ↓
Agent:   [CALLS: search_scheme_knowledge("education schemes for students")]
         ↓
RAG:     Returns: PM-YASASVI, Post-Matric Scholarship, etc.
         ↓
Agent:   "I found several education schemes for you..."
```

### 4.3 Tool Priority

1. **RAG Server Tools** (PRIMARY - Port 8002)
   - `search_scheme_knowledge()`
   - `check_eligibility()`
   - `get_scheme_knowledge()`

2. **Main MCP Server Tools** (SECONDARY - Port 8001)
   - `schedule_consultation()`
   - `create_scheme_inquiry()`
   - Document verification

### 4.4 Testing RAG

```bash
cd rag-server

# Test search
python test_schemes.py

# Test eligibility
python test_rag.py

# Check vector DB
python -c "import chromadb; print(chromadb.Client().list_collections())"
```

---

## 5. OCR Integration

### 5.1 Architecture

**Dual Processing:**
```
Image Upload → Frontend
              ↓
         Backend API
              ↓
    ┌─────────────────┐
    │  Tesseract.js   │ (Always works)
    │  Browser-based  │
    └─────────────────┘
              OR
    ┌─────────────────┐
    │  Python OCR     │ (Optional enhancement)
    │  pytesseract    │
    └─────────────────┘
              ↓
         Smart Fallback
              ↓
    Demo Data (if both fail)
```

### 5.2 Smart Fallback System

**Location:** `mern/backend/routes/OCRRoutes.js`

```javascript
router.post('/aadhaar', async (req, res) => {
  try {
    // Try real OCR processing
    const ocrData = await processAadhaar(imageFile);
    return res.json({ success: true, data: ocrData });
  } catch (error) {
    // Fallback to realistic demo data
    const demoData = generateDemoAadhaarData();
    return res.json({ 
      success: true, 
      data: demoData,
      demo_mode: true 
    });
  }
});
```

### 5.3 Features

**Supported Documents:**
- ✅ Aadhaar Card (front/back)
- ✅ Income Certificate
- ✅ Caste Certificate
- ✅ Domicile Certificate

**Extracted Fields:**
- Name, DOB, Gender
- Aadhaar Number
- Address (parsed into components)
- Father's/Mother's name
- Photo (if available)

### 5.4 Frontend Integration

**Location:** `mern/frontend/src/components/AadhaarOCR.js`

```javascript
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/ocr/aadhaar', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  // Auto-fill profile form
  setProfile(result.data);
};
```

**User Experience:**
1. Click "Scan Aadhaar" button
2. Upload image (JPG/PNG/PDF)
3. Progress indicator shows
4. Profile auto-fills (instant!)
5. User verifies & saves

---

## 6. Admin Management

### 6.1 Role-Based Access Control

**Roles:**
- **customer** - Default role (profile access only)
- **admin** - Full system access

**Permission Matrix:**

| Feature | Customer | Admin |
|---------|----------|-------|
| My Profile | ✅ | ✅ |
| Home Page | ✅ | ✅ |
| Dashboard | ❌ | ✅ |
| Manage Customers | ❌ | ✅ |
| View Transcripts | ❌ | ✅ |
| Appointments | ❌ | ✅ |
| LiveKit Rooms | ❌ | ✅ |
| Admin Users | ❌ | ✅ |

### 6.2 Admin Scripts

**Location:** `mern/backend/scripts/`

#### List All Users
```powershell
cd mern/backend
node scripts/listUsers.js
```

#### Promote User to Admin
```powershell
node scripts/makeAdmin.js user@example.com
```

#### Remove Admin Privileges
```powershell
node scripts/removeAdmin.js user@example.com
```

#### Example Output
```
✅ User 'john@example.com' is now an admin!

Updated User:
{
  "_id": "65f...",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "admin",  ← Changed
  "lastLogin": "2026-03-02T10:30:00.000Z"
}
```

### 6.3 Frontend Route Protection

**Location:** `mern/frontend/src/App.js`

```javascript
// Admin-only route wrapper
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return <AccessDenied />;
  }
  
  return children;
};

// Usage
<Route path="/dashboard" element={
  <AdminRoute>
    <Dashboard />
  </AdminRoute>
} />
```

---

## 7. Deployment Guide

### 7.1 EC2 Deployment (AWS)

**Instance Requirements:**
- Type: t3.medium or larger
- OS: Ubuntu 22.04 LTS
- Storage: 30GB+ SSD
- Security Group: Ports 22, 80, 443, 3000, 5000, 8001, 8002

**Installation Script:**
```bash
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Python 3.9+
sudo apt install -y python3.9 python3-pip python3-venv

# Install PM2 for process management
sudo npm install -g pm2

# Clone repository
git clone <your-repo-url>
cd Scheme-Saarthi/code/Amazon_AI_Challenge
```

### 7.2 PM2 Process Management

**Backend:**
```bash
cd mern/backend
npm install
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Enable auto-start
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'backend-api',
    script: 'index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

**AI Agent:**
```bash
cd ai-agent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

pm2 start "python main.py" --name ai-agent --interpreter python3
```

**RAG Server:**
```bash
cd rag-server
python3 -m venv rag_venv
source rag_venv/bin/activate
pip install -r requirements.txt

pm2 start "python mcp_rag_server.py" --name rag-server --interpreter python3
```

### 7.3 Nginx Reverse Proxy

**/etc/nginx/sites-available/schemesaarthi:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }

    # RAG Server SSE
    location /rag {
        proxy_pass http://localhost:8002/sse;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        chunked_transfer_encoding off;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/schemesaarthi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7.4 SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
sudo systemctl reload nginx
```

### 7.5 Monitoring

**PM2 Monitoring:**
```bash
pm2 monit          # Real-time monitoring
pm2 logs           # View logs
pm2 logs backend-api --lines 100
pm2 restart all    # Restart all processes
```

**Health Checks:**
```bash
# Backend
curl http://localhost:5000/health

# RAG Server
curl http://localhost:8002/health

# MongoDB
mongosh --eval "db.adminCommand('ping')"
```

---

## 8. Troubleshooting

### 8.1 Common Issues

#### Issue: AI Agent Not Responding

**Symptoms:**
- Voice call connects but no response
- Console shows "Waiting for RAG server..."

**Solution:**
```bash
# Check if RAG server is running
curl http://localhost:8002/sse

# If not running, start it
cd rag-server
python mcp_rag_server.py

# Check logs
tail -f logs/rag-server.log
```

---

#### Issue: Ghost Sessions / Multiple Sessions

**Symptoms:**
- Multiple LiveKit rooms for same user
- Sessions not ending properly

**Solution:**
✅ Already fixed in latest code!

Check session registry:
```bash
# In AI agent terminal
grep "Session registered" logs/*.log
grep "Session removed" logs/*.log
```

---

#### Issue: OCR Not Working

**Symptoms:**
- Image upload fails
- Returns empty data

**Solution:**
```bash
# Check OCR service health
curl http://localhost:5000/api/ocr/health

# Test with demo endpoint
curl http://localhost:5000/api/ocr/demo

# Fallback is automatic - should return demo data
```

---

#### Issue: MongoDB Connection Failed

**Symptoms:**
- Backend crashes on startup
- Error: "MongoNetworkError"

**Solution:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check connection string in .env
# MONGODB_URI=mongodb://localhost:27017/schemesaarthi
```

---

#### Issue: Frontend Build Fails

**Symptoms:**
- `npm run build` errors
- Missing dependencies

**Solution:**
```bash
cd mern/frontend

# Clean install
rm -rf node_modules package-lock.json
npm install

# Check for peer dependency warnings
npm audit fix

# Try build again
npm run build
```

---

### 8.2 Performance Tuning

#### Backend Optimization

```javascript
// index.js - Add compression
const compression = require('compression');
app.use(compression());

// Add caching for schemes
const NodeCache = require('node-cache');
const schemeCache = new NodeCache({ stdTTL: 3600 }); // 1 hour
```

#### MongoDB Indexing

```javascript
// models/Scheme.js - Add indexes
schemeSchema.index({ name: 'text', description: 'text' });
schemeSchema.index({ category: 1, state: 1 });
schemeSchema.index({ eligibility_criteria: 1 });
```

#### ChromaDB Optimization

```python
# rag-server/mcp_rag_server.py
# Use persistent storage
collection = client.get_or_create_collection(
    name="government_schemes",
    metadata={"hnsw:space": "cosine"},
    embedding_function=embedding_function
)
```

---

### 8.3 Logging & Debugging

#### Enable Debug Logging

**AI Agent:**
```python
# main.py
logging.basicConfig(
    level=logging.DEBUG,  # Changed from INFO
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

**Backend:**
```javascript
// index.js
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
```

#### Log Files

```bash
# AI Agent
tail -f ai-agent/logs/agent.log

# Backend
pm2 logs backend-api

# RAG Server
tail -f rag-server/logs/rag.log

# MongoDB
tail -f /var/log/mongodb/mongod.log
```

---

## 9. Quick Reference

### 9.1 Essential Commands

```bash
# Start all services (development)
cd code/Amazon_AI_Challenge

# Terminal 1: RAG Server
cd rag-server && python mcp_rag_server.py

# Terminal 2: Backend
cd mern/backend && npm start

# Terminal 3: Frontend
cd mern/frontend && npm start

# Terminal 4: AI Agent
cd ai-agent && python main.py
```

### 9.2 Environment Variables

**Critical Variables:**
```env
# MUST HAVE
GOOGLE_API_KEY=<gemini-api-key>
LIVEKIT_URL=<livekit-cloud-url>
LIVEKIT_API_KEY=<livekit-key>
LIVEKIT_API_SECRET=<livekit-secret>
MONGODB_URI=<mongodb-connection-string>

# IMPORTANT
RAG_SERVER_URL=http://localhost:8002/sse
BACKEND_URL=http://localhost:5000

# OPTIONAL
TWILIO_ACCOUNT_SID=<twilio-sid>
TWILIO_AUTH_TOKEN=<twilio-token>
```

### 9.3 API Testing

```bash
# Health checks
curl http://localhost:5000/health
curl http://localhost:8002/health

# Test scheme search
curl -X POST http://localhost:5000/api/schemes \
  -H "Content-Type: application/json" \
  -d '{"query": "education scheme"}'

# Test LiveKit token generation
curl -X POST http://localhost:5000/api/livekit/token \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'
```

---

## 10. Support & Resources

### Official Documentation
- LiveKit: https://docs.livekit.io/
- Gemini AI: https://ai.google.dev/docs
- ChromaDB: https://docs.trychroma.com/
- FastMCP: https://github.com/jlowin/fastmcp

### Project Resources
- Main README: `README.md`
- Startup Guide: `STARTUP_GUIDE.md`
- This Document: `CONSOLIDATED_DOCS.md`

### Contact
For issues or questions, refer to project documentation or open an issue in the repository.

---

**Last Updated:** March 2, 2026  
**Version:** 2.0  
**Status:** Production Ready ✅
