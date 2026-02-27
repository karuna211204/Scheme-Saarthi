# 🇮🇳 Scheme Saarthi - AI-Powered Government Scheme Discovery Platform

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Admin Management](#admin-management)
- [RAG Knowledge Base](#rag-knowledge-base)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

**Scheme Saarthi** is an AI-powered, voice-first platform that bridges the gap between rural Indian citizens and government benefits. Our solution addresses the critical problem of ₹50,000+ Crores in unclaimed government benefits annually by providing multilingual voice interface, intelligent scheme discovery, and automated document verification.

### Problem Statement Addressed
- ✅ **Multilingual Voice Interface**: Citizens can speak in Hindi, Telugu, Tamil, or English - eliminating language barriers for 500M+ non-English-proficient Indians
- ✅ **Intelligent Scheme Discovery**: Amazon Bedrock (Claude 3.5 Sonnet) with RAG-based search across 1000+ government schemes
- ✅ **Automated Document Verification**: Amazon Textract OCR instantly reads Aadhaar cards, marksheets, certificates to verify eligibility
- ✅ **Human Escalation**: SIP-based seamless handoff to customer care agents when needed with full context transfer
- ✅ **SMS-based PDF Delivery**: Multi-language eligibility reports with QR codes sent via SMS for low-connectivity areas
- ✅ **Zero Middleman Cost**: Direct access to schemes without ₹500-2000 middleman fees
- ✅ **15-30 day to 3-5 day reduction**: Automated verification reduces application time drastically

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  - Citizen Portal (Profile, Documents, Applications)       │
│  - Admin Dashboard (Analytics, Scheme Management)          │
│  - LiveKit Voice Interface                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────────────────────┐
│                  BACKEND (Express + MongoDB)                │
│  - Applications, Schemes, Citizens, Documents, Transcripts  │
│  - Google OAuth, JWT Authentication, Role-Based Access      │
│  - LiveKit Room Management                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────┴──────────┬──────────────┬───────────────┐
         │                    │              │               │
┌────────▼────────┐  ┌────────▼────────┐  ┌─▼──────────┐  ┌─▼─────────┐
│  AI AGENT       │  │  RAG SERVER     │  │  TWILIO    │  │  AWS      │
│  (LiveKit)      │  │  (FastMCP)      │  │  (SMS)     │  │  Services │
│                 │  │                 │  │            │  │           │
│ - Gemini 2.5    │  │ - ChromaDB      │  │ - Eligib.  │  │ - Bedrock │
│ - MCP Tools     │  │ - 1000+ Schemes │  │   Reports  │  │ - Textract│
│ - Voice AI      │  │ - Embeddings    │  │ - QR Codes │  │ - Polly   │
│ - Multi-lang    │  │ - Multilingual  │  │            │  │ - Transcr.│
└─────────────────┘  └─────────────────┘  └────────────┘  └───────────┘
```

### Components

1. **Frontend (React + TailwindCSS)**
   - Customer-facing portal with device tracking and support history
   - Admin dashboard with CRM capabilities
   - Real-time LiveKit voice/video integration
   - Google OAuth authentication

2. **Backend (Express + MongoDB)**
   - RESTful API for all business logic
   - MongoDB collections: Appointments, Warranties, SalesLeads, Transcripts, Users
   - LiveKit server SDK for room management
   - JWT-based authentication with role-based access control

3. **AI Agent (LiveKit + Gemini)**
   - Google Gemini 2.5 Flash realtime voice model
   - MCP (Model Context Protocol) tools integration
   - Natural language processing for customer queries
   - Automated workflow execution (warranty checks, appointments, etc.)

4. **RAG Server (FastMCP + ChromaDB)**
   - 151 document chunks from service manuals
   - Google text-embedding-004 for semantic search
   - Appliance-specific filtering (washing machine, TV, AC, refrigerator)
   - Retrieval-Augmented Generation for accurate technical responses

5. **Integrations**
   - **Twilio**: SMS notifications
   - **n8n**: Google Calendar appointment automation
   - **LiveKit**: Voice/video infrastructure

---

## ✨ Key Features

### Customer Features
- 🎙️ **Voice AI Support**: Natural conversations with AI agent
- 📱 **Device Management**: Track warranties and service history
- 📅 **Appointment Booking**: Check availability and schedule service visits
- 🔔 **SMS/Email Notifications**: Automated confirmations
- 📊 **Support History**: View past interactions and transcripts

### Admin Features
- 📊 **Analytics Dashboard**: Lead stats, warranty expiry widgets
- 👥 **CRM**: Customer overview, profiles, appointment management
- 💼 **Sales Lead Management**: Qualification, scoring, enrichment
- 📞 **Live Room Monitoring**: Active voice calls tracking
- 📝 **Transcript Viewer**: Conversation analysis
- 👨‍💼 **Admin Management**: Role-based access control
- 📤 **Data Export**: CSV/XLSX export for all data

### AI Agent Capabilities
- ✅ Warranty status verification
- ✅ Appointment availability checking
- ✅ Appointment booking with conflict resolution
- ✅ Sales lead creation and qualification
- ✅ Service manual queries (RAG-powered)
- ✅ Error code troubleshooting
- ✅ Customer history retrieval
- ✅ Transfer to human agent
- ✅ SMS confirmation sending
- ✅ Email with calendar invite

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 19.2.0
- **Styling**: TailwindCSS 3.4.18
- **Routing**: React Router DOM 6.30.2
- **Authentication**: Google OAuth (@react-oauth/google)
- **Voice/Video**: LiveKit Client SDK 2.0.0
- **Icons**: React Icons 4.12.0
- **Notifications**: React Toastify 9.1.3

### Backend
- **Runtime**: Node.js
- **Framework**: Express 4.18.2
- **Database**: MongoDB + Mongoose 7.8.7
- **Authentication**: JWT (jsonwebtoken 9.0.3), Google Auth Library 10.5.0
- **Email**: Nodemailer 6.9.7
- **LiveKit**: LiveKit Server SDK 2.0.0
- **Dev Tools**: Nodemon 3.0.2

### AI & ML
- **AI Model**: Google Gemini 2.5 Flash (realtime native audio)
- **Voice SDK**: LiveKit Agents 1.2.2
- **MCP Framework**: FastMCP 2.10.6
- **RAG**: LangChain 0.3.14 + ChromaDB
- **Embeddings**: Google text-embedding-004
- **PDF Processing**: PyPDF 5.1.0

### Infrastructure
- **Voice Infrastructure**: LiveKit
- **SMS**: Twilio 9.6.5
- **Automation**: n8n webhooks
- **Database**: MongoDB
- **Vector Database**: ChromaDB

---

## 📁 Project Structure

```
gdg-hyd/
├── mern/
│   ├── frontend/                 # React application
│   │   ├── src/
│   │   │   ├── components/       # Reusable UI components
│   │   │   │   ├── Header.js     # Dynamic navigation (admin/customer)
│   │   │   │   ├── Footer.js
│   │   │   │   ├── VideoCall.js  # LiveKit integration
│   │   │   │   ├── LeadStatsWidget.js
│   │   │   │   └── WarrantyExpiringWidget.js
│   │   │   ├── pages/            # Route components
│   │   │   │   ├── Home.js       # Landing page
│   │   │   │   ├── Login.js      # Google OAuth
│   │   │   │   ├── Dashboard.js  # Admin dashboard
│   │   │   │   ├── CustomerOverview.js
│   │   │   │   ├── Appointments.js
│   │   │   │   ├── SalesLeads.js
│   │   │   │   ├── LiveKitRooms.js
│   │   │   │   ├── MyDevices.js  # Customer warranty view
│   │   │   │   └── TrackRepair.js
│   │   │   ├── context/
│   │   │   │   └── AuthContext.js # Auth state management
│   │   │   ├── App.js            # Router & protected routes
│   │   │   └── index.js
│   │   ├── public/
│   │   ├── package.json
│   │   └── tailwind.config.js
│   │
│   └── backend/                  # Express API
│       ├── controllers/          # Business logic
│       │   ├── AppointmentController.js
│       │   ├── WarrantyController.js
│       │   ├── SalesLeadController.js
│       │   ├── TranscriptController.js
│       │   ├── LivekitController.js
│       │   ├── AuthController.js
│       │   └── ExportController.js
│       ├── models/               # MongoDB schemas
│       │   ├── Appointment.js
│       │   ├── Warranty.js
│       │   ├── SalesLead.js
│       │   ├── Transcript.js
│       │   ├── Customer.js
│       │   └── User.js
│       ├── routes/               # API endpoints
│       │   ├── AppointmentRoutes.js
│       │   ├── WarrantyRoutes.js
│       │   ├── SalesLeadRoutes.js
│       │   ├── TranscriptRoutes.js
│       │   ├── LivekitRoutes.js
│       │   └── AuthRoutes.js
│       ├── middleware/
│       │   └── auth.js           # JWT verification
│       ├── scripts/              # Admin utilities
│       │   ├── listUsers.js
│       │   ├── makeAdmin.js
│       │   ├── removeAdmin.js
│       │   └── seedUserData.js
│       ├── index.js              # Server entry point
│       ├── package.json
│       └── ADMIN_GUIDE.md
│
├── ai-agent/                     # LiveKit AI Agent
│   ├── main.py                   # Agent entry point
│   ├── prompt.py                 # System instructions
│   ├── sales_prompt.py           # Sales-specific prompts
│   ├── config.py                 # Configuration settings
│   ├── mcp_server1.py            # MCP tools server (FastMCP)
│   ├── livekit_room_manager.py  # Room management utilities
│   ├── mcp_client/               # MCP client integration
│   │   ├── agent_tools.py        # Tool definitions
│   │   ├── server.py
│   │   └── util.py
│   ├── requirements.txt
│   └── n8n-workflow.json         # Calendar automation workflow
│
└── rag-server/                   # RAG Knowledge Base
    ├── mcp_rag_server.py         # FastMCP RAG server
    ├── db/
    │   └── chromadb_client.py    # ChromaDB connection
    ├── rag/
    │   ├── ingest_pdfs.py        # Document ingestion
    │   └── retriever.py          # Query handling
    ├── knowledge_base/           # PDF service manuals
    ├── requirements.txt
    └── test_rag.py
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+
- **MongoDB** (local or cloud instance)
- **Google Cloud Account** (for Gemini API)
- **LiveKit Account** (for voice/video)
- **Twilio Account** (for SMS)
- **n8n Instance** (optional, for calendar integration)

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd gdg-hyd
```

#### 2. Backend Setup
```bash
cd mern/backend
npm install

# Set up environment variables (see below)
# Create .env file

# Start the server
npm start
# Server runs on http://localhost:5000
```

#### 3. Frontend Setup
```bash
cd mern/frontend
npm install

# Start the development server
npm start
# App runs on http://localhost:3000
```

#### 4. AI Agent Setup
```bash
cd ai-agent
pip install -r requirements.txt

# Set up .env file (see below)

# Start the agent
python main.py
```

#### 5. RAG Server Setup
```bash
cd rag-server
pip install -r requirements.txt

# Ingest PDF manuals (one-time setup)
cd rag
python ingest_pdfs.py

# Start the RAG server
cd ..
python mcp_rag_server.py
# Server runs on http://localhost:8002
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/schemesaarthi

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_jwt_secret_key

# Gmail (for nodemailer)
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_app_specific_password

# LiveKit
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Port
PORT=5000
```

### AI Agent (.env)
```env
# Google AI
GOOGLE_API_KEY=your_google_api_key
GEMINI_MODEL=models/gemini-2.5-flash-native-audio-preview-09-2025

# LiveKit
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Backend API
BACKEND_URL=http://localhost:5000

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# n8n Webhook (Calendar)
N8N_WEBHOOK_URL=your_n8n_webhook_url

# MCP Servers
MCP_SERVER_PORT=8001
RAG_SERVER_PORT=8002
```

### RAG Server (.env)
```env
# Google AI
GOOGLE_API_KEY=your_google_api_key

# ChromaDB
CHROMADB_PATH=./chromadb_data

# Port
RAG_SERVER_PORT=8002
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST `/auth/google`
Login with Google OAuth token
```json
{
  "token": "google_oauth_token"
}
```

#### POST `/auth/make-admin/:email`
Promote user to admin (requires existing admin)

#### GET `/auth/user/:email`
Get user by email

---

### Appointment Endpoints

#### GET `/appointments`
Get all appointments (supports filtering)
```
Query params: ?status=scheduled&phone=+1234567890
```

#### POST `/appointments`
Create new appointment
```json
{
  "customer_id": "abc123",
  "customer_name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "appointment_date": "2025-12-25",
  "appointment_time": "14:00",
  "issue_description": "Refrigerator not cooling",
  "product_name": "Samsung RF28",
  "address": "123 Main St"
}
```

#### POST `/appointments/check-availability`
Check appointment slot availability
```json
{
  "date_str": "2025-12-25",
  "time_str": "14:00",
  "window_minutes": 60
}
```

#### POST `/appointments/book`
Book appointment (matches MCP tool payload)
```json
{
  "customer_name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "appointment_date": "2025-12-25",
  "appointment_time": "14:00",
  "customer_id": "abc123",
  "notes": "Prefers morning slot"
}
```

#### GET `/appointments/phone/:phone`
Get appointments by phone number

#### PUT `/appointments/:id`
Update appointment

#### DELETE `/appointments/:id`
Delete appointment

---

### Warranty Endpoints

#### POST `/warranties/check`
Check warranty status
```json
{
  "phone": "+1234567890",
  "invoice_id": "INV-2024-001"
}
```

#### GET `/warranties/expiring/:days`
Get warranties expiring in X days
```
Example: /warranties/expiring/7
```

#### GET `/warranties/phone/:phone`
Get all warranties for a phone number

#### POST `/warranties`
Create new warranty record
```json
{
  "phone": "+1234567890",
  "invoice_id": "INV-2024-001",
  "customer_name": "John Doe",
  "product_name": "Samsung Refrigerator RF28",
  "product_category": "Refrigerator",
  "purchase_date": "2024-01-15",
  "warranty_period_months": 12,
  "warranty_expiry": "2025-01-15",
  "store_location": "Guntur Main Branch"
}
```

---

### Sales Lead Endpoints

#### GET `/salesleads`
Get all sales leads (supports filtering)
```
Query params: ?status=open&lead_type=warranty_expiring
```

#### POST `/salesleads`
Create sales lead
```json
{
  "phone": "+1234567890",
  "customer_name": "John Doe",
  "email": "john@example.com",
  "lead_type": "warranty_expiring",
  "product_interest": "Extended warranty",
  "lead_score": 75,
  "qualification_status": "qualified",
  "notes": "Customer interested in AMC plan"
}
```

#### PUT `/salesleads/:id`
Update sales lead

#### DELETE `/salesleads/:id`
Delete sales lead

---

### LiveKit Endpoints

#### POST `/livekit/token`
Generate LiveKit access token
```json
{
  "room": "customer-support-123",
  "identity": "customer-456"
}
```

#### GET `/livekit/rooms`
List all active rooms

#### DELETE `/livekit/rooms/:roomName`
Delete a room

---

### Export Endpoints

#### GET `/export/appointments`
Export appointments as CSV/XLSX
```
Query params: ?format=csv or ?format=xlsx
```

#### GET `/export/warranties`
Export warranties

#### GET `/export/salesleads`
Export sales leads

---

## 👨‍💼 Admin Management

### Make User Admin
```powershell
cd mern/backend
node scripts/makeAdmin.js user@example.com
```

### List All Users
```powershell
node scripts/listUsers.js
```

### Remove Admin Role
```powershell
node scripts/removeAdmin.js user@example.com
```

### Verify Admin Status
User must logout and login again after role change to refresh JWT token.

---

## 🧠 RAG Knowledge Base

### Current Knowledge Base
- **Total Documents**: 151 chunks
- **Appliances Covered**: Washing Machine, Television, Air Conditioner, Refrigerator
- **Embedding Model**: Google text-embedding-004
- **Vector Store**: ChromaDB

### RAG MCP Tools

#### `search_service_manual(query, n_results)`
General service manual queries
```python
# Example
query = "washing machine not draining error code E4"
```

#### `search_error_code(error_code, appliance_type)`
Specific error code lookup
```python
# Example
error_code = "E4"
appliance_type = "washing machine"
```

#### `search_troubleshooting(issue, appliance_type, n_results)`
Troubleshooting guides
```python
# Example
issue = "refrigerator not cooling"
appliance_type = "refrigerator"
```

### Adding New Manuals
1. Place PDF files in `rag-server/knowledge_base/`
2. Run ingestion:
```bash
cd rag-server/rag
python ingest_pdfs.py
```

---

## 🌐 Deployment

### Backend Deployment (Railway/Render/Heroku)
1. Set environment variables in hosting platform
2. Ensure MongoDB connection string is configured
3. Deploy from GitHub repo

### Frontend Deployment (Vercel/Netlify)
1. Build command: `npm run build`
2. Output directory: `build`
3. Set `REACT_APP_BACKEND_URL` environment variable

### AI Agent Deployment (Cloud VM/Container)
1. Use Docker or Python environment
2. Ensure LiveKit and backend URLs are accessible
3. Run with process manager (PM2, supervisor, systemd)

### RAG Server Deployment
1. Ensure ChromaDB data directory is persistent
2. Run as separate service
3. Connect to MCP server via HTTP

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style
- **Frontend**: ESLint + Prettier
- **Backend**: StandardJS
- **Python**: PEP 8 + Black formatter

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📧 Contact

For questions or support, contact the development team.

---

## 🙏 Acknowledgments

- **Google Gemini**: AI model powering the voice agent
- **LiveKit**: Real-time voice/video infrastructure
- **LangChain**: RAG implementation framework
- **MongoDB**: Database solution
- **Twilio**: SMS integration
- **n8n**: Workflow automation

---

**Built with ❤️ for GDG Hyderabad Hackathon 2025**