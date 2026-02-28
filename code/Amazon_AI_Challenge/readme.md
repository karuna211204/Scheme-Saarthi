# 🇮🇳 Scheme Saarthi - Complete Implementation Guide

**AI-Powered Universal Citizen Gateway for Government Welfare Schemes**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

SchemeSaarthi is a voice-first, multimodal AI platform that bridges the gap between 500M+ rural Indians and ₹50,000+ Crores of unclaimed government benefits. The system provides:

- **Multilingual Voice Interface**: Natural conversation in Hindi, Telugu, Tamil, English
- **Intelligent Scheme Discovery**: AI-powered matching using RAG (Retrieval Augmented Generation)
- **Smart Document Processing**: OCR-based verification of Aadhaar, income certificates, etc.
- **End-to-End Application Support**: From eligibility check to application submission

### Problem Statement Addressed

1. **Language Barrier**: 75% of rural Indians not comfortable with English
2. **Discovery Gap**: Information scattered across 100+ government websites  
3. **Verification Friction**: Citizens pay ₹500-2000 to agents for help
4. **Digital Divide**: 40% of rural population lacks smartphone literacy

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LAYER                               │
│  📱 Web Portal  │  📞 Voice Calls  │  💬 SMS  │  📧 Email  │
└─────────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────────┐
│                APPLICATION LAYER                            │
│                                                             │
│  🤖 AI Agent (Python)          📊 MERN Backend (Node.js)   │
│  - Gemini 2.5 Flash           - Express REST API          │
│  - LiveKit Voice              - MongoDB Database           │
│  - Native Audio I/O           - JWT Authentication         │
│  - MCP Client                 - Document Upload            │
│                                                             │
│  🔍 RAG Server (Python)        ⚙️ MCP Server (Python)      │
│  - ChromaDB Vector DB         - Business Logic Tools       │
│  - Google Embeddings          - Scheme Matching           │
│  - Semantic Search            - Consultation Booking       │
│  - PDF Knowledge Base         - Application Tracking       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required Software
- Node.js 18+
- Python 3.9+
- MongoDB 4.4+ (or MongoDB Atlas)

# Required API Keys
- Google API Key (Gemini AI)
- Twilio Account (SMS/Voice)
- LiveKit Cloud Account
```

### Installation

#### 1. Backend (Node.js)
```bash
cd mern/backend
npm install
```

#### 2. AI Agent (Python)
```bash
cd ../../ai-agent
pip install -r requirements.txt
```

#### 3. RAG Server (Python)
```bash
cd ../rag-server
pip install -r requirements.txt
```

### Seed Database

```bash
cd mern/backend

# Seed government schemes (10 major schemes)
node seedGovernmentSchemes.js

# Seed sample documents (20+ document types)
node seedGovernmentDocuments.js
```

### Start Services

Open 4 separate terminals:

**Terminal 1: Backend API**
```bash
cd mern/backend
npm start
# Runs on: http://localhost:5000
```

**Terminal 2: RAG Server**
```bash
cd rag-server
python mcp_rag_server.py
# Runs on: http://localhost:8002
```

**Terminal 3: MCP Server**
```bash
cd ai-agent
python mcp_server1.py
# Runs on: http://localhost:8001
```

**Terminal 4: AI Agent**
```bash
cd ai-agent
python main.py
# Connects to LiveKit
```

### Verify Installation

```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/schemes
```

---

## 📁 Project Structure

```
Amazon_AI_Challenge/
├── ai-agent/                          # Voice AI Agent
│   ├── main.py                        # Entry point
│   ├── scheme_prompt.py               # AI instructions
│   ├── mcp_server1.py                 # MCP server with tools
│   └── mcp_client/                    # MCP client library
│
├── mern/
│   ├── backend/                       # Node.js REST API
│   │   ├── controllers/               # Business logic
│   │   ├── models/                    # MongoDB schemas
│   │   ├── routes/                    # API endpoints
│   │   ├── seedGovernmentSchemes.js
│   │   └── seedGovernmentDocuments.js
│   └── frontend/                      # React web portal
│
└── rag-server/                        # RAG Knowledge Base
    ├── mcp_rag_server.py
    ├── db/chromadb_client.py
    └── rag/retriever.py
```

---

## ✨ Features

### 1. Multilingual Voice Interface
- Languages: Hindi, Telugu, Tamil, English
- Technology: Gemini 2.5 Flash with native audio
- Real-time voice-to-voice conversation

### 2. Scheme Discovery
- 10+ Major Government Schemes:
  - PM-KISAN (Farmer income)
  - PMAY-G (Rural housing)
  - Ujjwala (LPG connections)
  - Ayushman Bharat (Healthcare)
  - And more...

### 3. Document Processing
- Aadhaar Card, Income Certificate, Caste Certificate
- Land Records, Bank Passbook, Education Marksheets
- Ration Card, Domicile Certificate, Disability Certificate
- OCR using Google Vision API / Tesseract

### 4. Eligibility Assessment
- Rule-based automatic checking
- Age, Income, Caste, Education criteria
- Land ownership, Disability status
- Geographic eligibility

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Core Endpoints

#### Schemes
```bash
GET    /schemes              # List all schemes
GET    /schemes/:id          # Get specific scheme
POST   /schemes/search       # Search schemes
POST   /schemes/match        # Match to user profile
```

#### Citizens
```bash
GET    /citizens             # List citizens
GET    /citizens/:id         # Get citizen profile
POST   /citizens             # Create new citizen
PUT    /citizens/:id         # Update citizen
```

#### Applications
```bash
GET    /applications         # List applications
POST   /applications         # Submit application
PUT    /applications/:id/status  # Update status
POST   /applications/check-eligibility  # Check eligibility
```

#### Consultations
```bash
POST   /consultations/check-availability  # Check slots
POST   /consultations/book                # Book consultation
GET    /consultations/:id                 # Get details
```

---

## 🧪 Testing

```bash
# Health check
curl http://localhost:5000/health

# List schemes
curl http://localhost:5000/api/schemes

# Search schemes
curl -X POST http://localhost:5000/api/schemes/search \
  -H "Content-Type: application/json" \
  -d '{"query": "farmer schemes"}'
```

---

## 🔧 Troubleshooting

### MongoDB Connection Failed
Check MONGODB_URI in `.env`. For MongoDB Atlas, whitelist your IP.

### Google API Key Invalid
Generate new key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Twilio SMS Not Sending
Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.

### Port Already in Use
```bash
# Windows
netstat -ano | find str :5000
taskkill /PID <PID> /F
```

---

## 📝 Environment Variables

Key variables needed in `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/schemesaarthi

# Google AI
GOOGLE_API_KEY=your_google_api_key
GEMINI_MODEL=models/gemini-2.5-flash-native-audio-preview-09-2025

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# LiveKit
LIVEKIT_URL=wss://your-livekit-server.cloud
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
```

---

<p align="center">
  <strong>Made with ❤️ for Bharat 🇮🇳</strong><br>
  <strong>Empowering 500M+ Citizens to Access Their Rightful Benefits</strong>
</p>
