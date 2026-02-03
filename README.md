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

```bash
npm install
cp .env.example .env
# Configure your AWS credentials
npm run dev
```

## Features

- 🗣️ Vernacular voice interface
- 📚 MCP-powered scheme search
- ✅ Auto-verification with document OCR
- 🌐 Multi-language support (Hindi, Telugu, Tamil)
- 📱 WhatsApp integration ready
- 📞 SIP-based human customer care escalation
- 📄 SMS-based PDF document sharing

## Impact

Empowering 500M+ Indians with access to government benefits in their native language.
