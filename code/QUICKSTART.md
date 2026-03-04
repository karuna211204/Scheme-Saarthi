# 🚀 Scheme Saarthi - Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Python 3.10+ installed
- MongoDB running locally or MongoDB Atlas URI
- Git installed

---

## ⚡ Quick Start (5 minutes)

### Step 1: Install Backend Dependencies
```bash
cd code/Amazon_AI_Challenge/mern/backend
npm install
```

### Step 2: Configure Environment
Create `.env` file in `mern/backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/schemesaarthi

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Gmail (for notifications)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Twilio SMS (optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# LiveKit (for voice calls)
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

### Step 3: Seed Government Schemes
```bash
node seedSchemes.js
```

Expected output:
```
✅ 10 schemes inserted successfully!
```

### Step 4: Start Backend Server
```bash
node index.js
```

Expected output:
```
🚀 Server is running on port 5000
✅ MongoDB connected successfully
```

### Step 5: Test Backend APIs
Open new terminal:
```powershell
cd code
.\test-backend.ps1
```

You should see successful responses for all 9 tests!

---

## 🎤 Start AI Voice Agent (RAG-FIRST Architecture)

### ⚠️ CRITICAL: RAG Server Must Be Running FIRST

The AI agent uses a **RAG-FIRST approach** where the RAG server (government schemes knowledge base with 1000+ schemes) is the PRIMARY source of information. The agent MUST query RAG before answering any scheme-related questions.

### Architecture:
```
Citizen Question → AI Agent → RAG Server (1000+ schemes) → Answer
                              ↓
                        Main MCP Server (Applications, etc.)
```

### Step 1: Start RAG Server (REQUIRED)
```bash
cd code/Amazon_AI_Challenge/rag-server
pip install -r requirements.txt

# Configure RAG Server
# Create .env file with:
GOOGLE_API_KEY=your_gemini_api_key
RAG_EMBEDDING_MODEL=text-embedding-004
RAG_EMBED_BACKEND=google
RAG_SERVER_PORT=8002

# Start RAG server (MUST run on port 8002)
python mcp_rag_server.py
```

Expected output:
```
🚀 Starting Scheme Saarthi RAG MCP Server...
📚 Scheme knowledge base ready: 1000+ documents
🌐 Starting SSE server on 0.0.0.0:8002
```

### Step 2: Install AI Agent Dependencies
```bash
cd code/Amazon_AI_Challenge/ai-agent
pip install -r requirements.txt
```

### Step 3: Configure AI Agent
Create `.env` file in `ai-agent/`:
```env
# Backend API
BACKEND_URL=http://localhost:5000

# Google Gemini
GOOGLE_API_KEY=your_gemini_api_key

# LiveKit
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# MCP Servers - RAG Server is CRITICAL for RAG-FIRST approach
MCP_SERVER_URL=http://localhost:8001/sse
RAG_SERVER_URL=http://localhost:8002/sse  # ⚠️ MUST BE RUNNING

# Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 3: Start MCP Server
```bash
python mcp_server1.py
```

Expected output:
```
🚀 Starting Scheme Saarthi AI MCP Server...
🌐 Starting SSE server on 0.0.0.0:8001
```

### Step 4: Start RAG Server (Optional)
```bash
cd ../rag-server
pip install -r requirements.txt
python mcp_rag_server.py
```

### Step 5: Start AI Agent
```bash
cd ../ai-agent
python main.py dev
```

Expected output:
```
🎙️ Scheme Saarthi AI Agent Started
📞 Listening for voice calls...
```

---

## 🧪 Test the System

### Test 1: Health Checks
```bash
# Backend
curl http://localhost:5000/health

# MCP Server
curl http://localhost:8001/health
```

### Test 2: Search Schemes
```bash
curl http://localhost:5000/api/schemes
```

### Test 3: Create Test Citizen
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/citizens" -Method Post -Body (@{
    phone = "+919876543210"
    name = "Test Citizen"
    age = 45
    occupation = "farmer"
    annual_income = 100000
    state = "Andhra Pradesh"
} | ConvertTo-Json) -ContentType "application/json"
```

### Test 4: Check Eligibility
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/applications/check-eligibility" -Method Post -Body (@{
    phone = "+919876543210"
} | ConvertTo-Json) -ContentType "application/json"
```

---

## 📱 Make a Test Voice Call

1. Get LiveKit room URL from your LiveKit dashboard
2. Join the room with a SIP client or web browser
3. Speak in Hindi: "Namaste, main ek scheme ke baare mein jaanna chahta hoon"
4. AI agent will respond in Hindi and search for schemes!

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
mongosh

# Check port 5000 is free
netstat -ano | findstr :5000

# Check .env file exists
ls .env
```

### Schemes not loading
```bash
# Re-run seed script
node seedSchemes.js

# Check MongoDB
mongosh schemesaarthi
db.schemes.find().count()
```

### MCP Server connection fails
```bash
# Check backend is running
curl http://localhost:5000/health

# Check port 8001 is free
netstat -ano | findstr :8001

# Check Python dependencies
pip list | grep fastmcp
```

### AI Agent won't start
```bash
# Check Gemini API key
echo $env:GOOGLE_API_KEY

# Check LiveKit credentials
echo $env:LIVEKIT_URL

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

---

## 📊 API Endpoints Reference

### Schemes
- `GET /api/schemes` - List all schemes
- `POST /api/schemes/search` - Search with filters
- `GET /api/schemes/:id` - Get scheme details

### Citizens
- `GET /api/citizens/phone/:phone` - Get citizen
- `POST /api/citizens` - Create citizen
- `PUT /api/citizens/phone/:phone` - Update citizen

### Applications
- `POST /api/applications/check-eligibility` - Check eligibility
- `POST /api/applications` - Create application
- `GET /api/applications/phone/:phone` - Get applications

### Consultations
- `POST /api/appointments/book` - Book consultation
- `POST /api/appointments/check-availability` - Check slots
- `GET /api/appointments/phone/:phone` - Get consultations

### Inquiries
- `POST /api/scheme-inquiries` - Create inquiry
- `GET /api/scheme-inquiries/stats` - Get statistics
- `GET /api/scheme-inquiries/phone/:phone` - Get inquiries

---

## 🎯 Testing Scenarios

### Scenario 1: Farmer Seeking PM-KISAN
1. Create citizen with occupation="farmer"
2. Check eligibility
3. Should see PM-KISAN scheme (₹6,000/year)
4. Create application
5. Book consultation for document help

### Scenario 2: Student Seeking Scholarship
1. Create citizen with occupation="student", caste="SC"
2. Check eligibility
3. Should see NSP-SC scholarship
4. Create application
5. Track application status

### Scenario 3: Senior Citizen Seeking Pension
1. Create citizen with age=70
2. Check eligibility
3. Should see Old Age Pension scheme
4. Create application with Aadhaar
5. Get application ID and QR code

---

## 🔧 Development Tips

### Watch Backend Logs
```bash
cd mern/backend
node index.js | grep "✅\|❌\|🔍\|📋"
```

### Watch MCP Server Logs
```bash
cd ai-agent
python mcp_server1.py | grep "🔗\|✅\|❌"
```

### Test Single API Endpoint
```powershell
# PowerShell
Invoke-RestMethod http://localhost:5000/api/schemes | ConvertTo-Json -Depth 10

# Or use curl
curl http://localhost:5000/api/schemes | jq .
```

### Debug Database
```bash
mongosh schemesaarthi

# List all schemes
db.schemes.find().pretty()

# Count citizens
db.citizens.find().count()

# Find applications
db.applications.find().pretty()
```

---

## 📚 Documentation

- [BACKEND_COMPLETE.md](BACKEND_COMPLETE.md) - Complete backend documentation
- [PHASE2_COMPLETE.md](PHASE2_COMPLETE.md) - Phase 2 transformation summary
- [TRANSFORMATION_SUMMARY.md](TRANSFORMATION_SUMMARY.md) - Overall transformation guide
- [README.md](readme.md) - Project overview

---

## 🆘 Need Help?

1. Check logs in terminal for error messages
2. Verify all environment variables are set
3. Ensure MongoDB is running
4. Check port availability (5000, 8001, 8002)
5. Review [BACKEND_COMPLETE.md](BACKEND_COMPLETE.md) for detailed API reference

---

## ✅ System Status

Run this to check all services:

```powershell
# Check Backend
Write-Host "Backend:" -ForegroundColor Yellow
try { Invoke-RestMethod http://localhost:5000/health | Select-Object status, server } catch { "❌ Not running" }

# Check MCP Server
Write-Host "`nMCP Server:" -ForegroundColor Yellow
try { Invoke-RestMethod http://localhost:8001/health | Select-Object status, server } catch { "❌ Not running" }

# Check MongoDB
Write-Host "`nMongoDB:" -ForegroundColor Yellow
mongosh --eval "db.version()" --quiet 2>$null
if ($?) { "✅ Running" } else { "❌ Not running" }

# Check Schemes Count
Write-Host "`nSchemes in DB:" -ForegroundColor Yellow
mongosh schemesaarthi --eval "db.schemes.countDocuments()" --quiet 2>$null
```

---

## 🚀 You're Ready!

If all checks pass, you're ready to demo Scheme Saarthi! 

The system can now:
- ✅ Speak Hindi/Telugu/Tamil
- ✅ Search 1000+ government schemes
- ✅ Check eligibility based on citizen profile
- ✅ Create scheme applications
- ✅ Send SMS with scheme details
- ✅ Book consultations with advisors
- ✅ Track application status

**Help 500M+ rural Indians discover ₹50,000+ Crores in unclaimed benefits!** 🇮🇳
