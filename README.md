# Scheme Saarthi - AI-Powered Government Benefit Sahayak

**Tagline:** Bridging the gap between rural citizens and government benefits using Multimodal Agentic AI.

## The Problem

India has thousands of government schemes meant to help students, farmers, and low-income families. However, millions of Crores in benefits go unclaimed every year due to:

- **Language Barrier**: Official documents in English or complex bureaucratic language
- **Discovery Gap**: Citizens don't know what they're eligible for
- **Verification Friction**: Complex document verification requiring middlemen

## The Solution

Scheme Saarthi is a voice-first AI Agent acting as a personalized "Caseworker" for every citizen:

1. **Voice Discovery**: Users speak in their native language (Telugu/Hindi)
2. **Intelligent Matching**: AI searches thousands of scheme rules using RAG
3. **Visual Verification**: AI reads uploaded documents to confirm eligibility instantly

## Architecture

- **Input**: Voice via Web Client (LiveKit) or WhatsApp
- **Brain**: Node.js Backend + Amazon Bedrock (Claude 3.5 Sonnet)
- **Knowledge**: MCP Server + Bedrock Knowledge Bases
- **Vision**: Amazon Textract for document analysis
- **Voice**: Amazon Transcribe + Polly for multilingual support

## Quick Start

### Backend Setup
```bash
cd code/Amazon_AI_Challenge/mern/backend
npm install
cp .env.example .env
# Configure MongoDB and AWS credentials
npm start
```

### Frontend Setup
```bash
cd code/Amazon_AI_Challenge/mern/frontend
npm install
npm start
```

### AI Agent Setup
```bash
cd code/Amazon_AI_Challenge/ai-agent
pip install -r requirements.txt
python main.py
```

## Features

- 🗣️ Vernacular voice interface (Hindi, Telugu, Tamil)
- 📚 MCP-powered scheme search with RAG
- ✅ Auto-verification with document OCR (Amazon Textract)
- 🌐 Multi-language support with Amazon Transcribe & Polly
- 📱 WhatsApp integration ready
- 📞 SIP/LiveKit-based voice consultations
- 📄 SMS-based PDF document sharing
- 👥 Citizen portal for application tracking
- 📊 Admin dashboard for consultation management
- 🔍 Scheme inquiry and eligibility checking

## Tech Stack

- **Frontend**: React 19.2.0, TailwindCSS 3.4.18, React Router 6.30.2
- **Backend**: Node.js/Express, MongoDB, JWT Authentication
- **AI Models**: Amazon Bedrock (Claude 3.5 Sonnet), Google Gemini
- **Voice**: LiveKit, Twilio SIP, Amazon Transcribe/Polly
- **Knowledge Base**: ChromaDB RAG, MCP (Model Context Protocol)
- **Document Processing**: Amazon Textract
- **Deployment**: PM2, Docker

## Impact

Empowering 500M+ Indians with access to government benefits in their native language.
