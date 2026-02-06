# Scheme Saarthi - System Architecture

## 🏗️ **Architecture Overview**

Scheme Saarthi is built as a **modern, cloud-native, voice-first AI platform** designed to help millions of Indians access government benefits. Our architecture follows **microservices principles** with **AI-powered intelligence** at its core.

## 🎯 **Design Philosophy**

### **Core Principles:**

- **Voice-First**: Everything starts with natural speech
- **AI-Powered**: Intelligent matching and processing
- **Scalable**: Handle millions of users across India
- **Secure**: Enterprise-grade security for government data
- **Multilingual**: Native language support (Hindi, Telugu, Tamil, English)

### **Architecture Goals:**

- ⚡ **Fast Response**
: < 3 seconds for voice processing
- 🔄 **High Availability**: 99.9% uptime
- 📈 **Elastic Scaling**: Auto-scale based on demand
- 🔒 **Data Security**: End-to-end encryption
- 🌍 **Multi-Region**: Serve users across India

---

## **PICTORIAL REPRESENTATION**

<img width="3331" height="2086" alt="scheme_saarthi_architecture_enhanced" src="https://github.com/user-attachments/assets/6c4caa4f-d441-490e-a148-933ae9367d85" />

## 🏛️ **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                     👥 USER LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  📱 Web App    │  📞 Voice Calls  │  💬 WhatsApp  │  📲 Mobile  │
└─────────────────────────────────────────────────────────────────┘
                                ⬇️
┌─────────────────────────────────────────────────────────────────┐
│                   🌐 API GATEWAY LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  🔄 Load Balancer  │  🛡️ Security  │  🔐 Auth  │  📊 Analytics │
└─────────────────────────────────────────────────────────────────┘
                                ⬇️
┌─────────────────────────────────────────────────────────────────┐
│                  ⚙️ APPLICATION SERVICES                        │
├─────────────────────────────────────────────────────────────────┤
│ 🎤 Voice      │ 📄 Document   │ 🔍 Scheme     │ 👤 User       │
│ Service       │ Service       │ Service       │ Service       │
│               │               │               │               │
│ 📱 SMS        │ 📞 SIP        │ 🤖 MCP        │ 🔐 Auth       │
│ Service       │ Service       │ Server        │ Service       │
└─────────────────────────────────────────────────────────────────┘
                                ⬇️
┌─────────────────────────────────────────────────────────────────┐
│                    🧠 AI/ML LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│ 🤖 Bedrock    │ 🗣️ Transcribe │ 🔊 Polly     │ 👁️ Textract  │
│ (Claude 3.5)  │ (Speech→Text) │ (Text→Speech) │ (OCR)         │
└─────────────────────────────────────────────────────────────────┘
                                ⬇️
┌─────────────────────────────────────────────────────────────────┐
│                    💾 DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│ 🗄️ PostgreSQL │ ⚡ Redis      │ 📁 S3        │ 🔍 ElasticSearch │
│ (Main DB)     │ (Cache)       │ (Files)      │ (Search)         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 **Core Components Explained**

### 1. **🎤 Voice Processing Service**

**What it does:** Handles all voice interactions

**Key Features:**

- **Speech-to-Text**: Converts user's voice to text (Amazon Transcribe)
- **Text-to-Speech**: Converts AI responses back to voice (Amazon Polly)
- **Language Detection**: Automatically detects Hindi, Telugu, Tamil, English
- **Real-time Processing**: WebSocket-based streaming for instant responses

**Flow:**

```
User speaks → Audio captured → Transcribed to text → AI processes → Response converted to speech → User hears
```

### 2. **📄 Document Verification Service**

**What it does:** Reads and verifies user documents

**Key Features:**

- **OCR Processing**: Reads Aadhaar cards, marksheets, certificates (Amazon Textract)
- **Data Extraction**: Pulls out name, age, income, marks automatically
- **Eligibility Check**: Compares extracted data with scheme requirements
- **Confidence Scoring**: Tells how accurate the reading is (95%+ accuracy)

**Flow:**

```
User uploads photo → OCR reads document → Extracts key data → Validates against schemes → Shows eligibility
```

### 3. **🔍 Scheme Discovery Service**

**What it does:** Finds relevant government schemes

**Key Features:**

- **Intelligent Search**: Uses AI to understand what user needs
- **Eligibility Matching**: Automatically checks if user qualifies
- **Personalized Recommendations**: Suggests best schemes based on profile
- **Real-time Updates**: Syncs with latest government scheme data

**Flow:**

```
User query → AI understands intent → Searches 1000+ schemes → Matches eligibility → Returns relevant schemes
```

### 4. **🤖 MCP Server (AI Brain)**

**What it does:** Standardized AI tool integration

**Key Features:**

- **Knowledge Base Access**: Queries government scheme database
- **Context Management**: Remembers conversation history
- **Tool Coordination**: Manages different AI capabilities
- **Response Generation**: Creates natural, helpful responses

**Flow:**

```
User question → MCP processes → Calls appropriate tools → Combines results → Generates response
```

### 5. **📞 SIP Service (Human Escalation)**

**What it does:** Connects users to human agents when needed

**Key Features:**

- **Smart Escalation**: Detects when human help is needed
- **Context Transfer**: Passes conversation history to agent
- **Call Management**: Handles call routing and queuing
- **Seamless Handoff**: Smooth transition from AI to human

**Flow:**

```
Complex query detected → Initiates call → Transfers context → Connects to agent → Human assistance
```

### 6. **📱 SMS & PDF Service**

**What it does:** Delivers information via SMS

**Key Features:**

- **PDF Generation**: Creates eligibility reports with QR codes
- **Multi-language SMS**: Sends messages in user's language
- **Secure Delivery**: Time-limited links for document access
- **Delivery Tracking**: Confirms message delivery

**Flow:**

```
Eligibility confirmed → Generates PDF report → Uploads to secure storage → Sends SMS with link
```

---

## 🧠 **AI & Machine Learning Stack**

### **The AI Brain: Amazon Bedrock + Claude 3.5 Sonnet**

- **Purpose**: Understanding and generating human-like responses
- **Capabilities**:
  - Understands complex queries in multiple languages
  - Provides contextual, helpful responses
  - Learns from interactions to improve over time

### **Voice Processing: Transcribe + Polly**

- **Amazon Transcribe**: Converts speech to text with 95%+ accuracy for Indian accents
- **Amazon Polly**: Converts text to natural-sounding speech in local languages
- **Real-time Streaming**: Processes audio as user speaks

### **Document Intelligence: Amazon Textract**

- **OCR Capabilities**: Reads printed and handwritten text
- **Form Understanding**: Extracts data from structured documents
- **Table Processing**: Handles marksheets with grades and percentages

### **Knowledge Management: RAG (Retrieval Augmented Generation)**

- **Vector Database**: Stores government scheme information
- **Semantic Search**: Finds relevant schemes based on meaning, not just keywords
- **Context Awareness**: Understands user's specific situation

---

## 💾 **Data Architecture**

### **Primary Database: PostgreSQL**

```sql
📊 Core Tables:
├── users (user profiles, preferences)
├── conversations (chat history, context)
├── schemes (government scheme data)
├── documents (uploaded files, OCR results)
└── interactions (user-scheme matches)
```

### **Caching Layer: Redis**

```
⚡ Cache Strategy:
├── Session data (user conversations)
├── Scheme search results (fast retrieval)
├── User profiles (quick access)
└── Rate limiting (API protection)
```

### **File Storage: Amazon S3**

```
📁 Storage Structure:
├── audio/ (voice recordings)
├── documents/ (uploaded files)
├── pdfs/ (generated reports)
└── knowledge-base/ (scheme documents)
```

### **Search Engine: ElasticSearch**

```
🔍 Search Capabilities:
├── Full-text search across schemes
├── Faceted search (by category, state)
├── Auto-complete suggestions
└── Analytics and insights
```

---

## 🔒 **Security Architecture**

### **Authentication & Authorization**

```
🔐 Security Layers:
├── Phone OTP (primary authentication)
├── JWT tokens (session management)
├── Role-based access (citizen/agent/admin)
└── API key authentication (service-to-service)
```

### **Data Protection**

```
🛡️ Encryption:
├── AES-256 (data at rest)
├── TLS 1.3 (data in transit)
├── AWS KMS (key management)
└── PII anonymization (privacy protection)
```

### **Network Security**

```
🌐 Infrastructure:
├── VPC with private subnets
├── WAF (web application firewall)
├── DDoS protection
└── Security groups (least privilege)
```

---

## 🚀 **Deployment Architecture**

### **Container Orchestration: Kubernetes**

```yaml
🐳 Deployment Strategy:
├── Microservices in containers
├── Auto-scaling based on load
├── Rolling updates (zero downtime)
└── Health checks and monitoring
```

### **Multi-Environment Setup**

```
🌍 Environments:
├── Development (single region, minimal resources)
├── Staging (production-like, testing)
└── Production (multi-AZ, full monitoring)
```

### **CI/CD Pipeline: GitHub Actions**

```
🔄 Deployment Flow:
├── Code commit → Automated tests
├── Build Docker images → Push to registry
├── Deploy to staging → Integration tests
└── Deploy to production → Health checks
```

---

## 📊 **Monitoring & Observability**

### **Metrics & Monitoring**

```
📈 Key Metrics:
├── Response time (< 3 seconds target)
├── Error rate (< 0.1% target)
├── Voice accuracy (95%+ target)
└── User satisfaction (4.5+/5 target)
```

### **Logging Strategy**

```
📝 Log Levels:
├── ERROR (system failures, exceptions)
├── WARN (performance issues, deprecations)
├── INFO (business events, user actions)
└── DEBUG (detailed execution flow)
```

### **Alerting System**

```
🚨 Alert Triggers:
├── High error rate (> 5%)
├── Slow response time (> 3 seconds)
├── Low voice accuracy (< 90%)
└── System resource exhaustion
```

---

## 🔄 **Data Flow Examples**

### **Voice Interaction Flow**

```
1. 👤 User speaks: "मुझे scholarship चाहिए"
2. 🎤 Voice Service: Transcribes to text
3. 🤖 MCP Server: Understands intent
4. 🔍 Scheme Service: Searches relevant schemes
5. 🧠 AI: Generates response
6. 🔊 Voice Service: Converts to speech
7. 👤 User hears: "आपके लिए 3 scholarship schemes हैं"
```

### **Document Verification Flow**

```
1. 👤 User uploads Aadhaar photo
2. 📄 Document Service: OCR processing
3. 👁️ Textract: Extracts name, age, income
4. 🔍 Scheme Service: Checks eligibility
5. ✅ Response: "You qualify for PM-KISAN scheme"
6. 📱 SMS Service: Sends PDF guide
```

### **Human Escalation Flow**

```
1. 🤖 AI detects complex query
2. 📞 SIP Service: Initiates call
3. 👨‍💼 Routes to available agent
4. 📋 Transfers conversation context
5. 🤝 Human agent takes over
6. 📝 Records interaction for learning
```

---

## 🌟 **Scalability & Performance**

### **Horizontal Scaling**

- **Stateless Services**: Each service can run multiple instances
- **Load Balancing**: Distributes traffic across instances
- **Auto-scaling**: Automatically adds/removes instances based on load
- **Database Sharding**: Splits data across multiple databases

### **Performance Optimization**

- **Caching**: Redis for frequently accessed data
- **CDN**: CloudFront for static content delivery
- **Connection Pooling**: Efficient database connections
- **Async Processing**: Non-blocking operations

### **Capacity Planning**

```
📊 Target Capacity:
├── 10,000 concurrent users
├── 1M+ daily active users
├── 100M+ scheme searches per month
└── 99.9% uptime SLA
```

---

## 🔮 **Future Architecture Evolution**

### **Phase 2 Enhancements**

- **Edge Computing**: Deploy services closer to users
- **Blockchain Integration**: Immutable document verification
- **Advanced AI**: Multi-modal understanding (voice + image + text)
- **Real-time Analytics**: Live dashboards for government insights

### **Phase 3 Scaling**

- **Global Expansion**: Multi-country deployment
- **Federated Learning**: Privacy-preserving AI improvements
- **Quantum-Ready Security**: Future-proof encryption
- **IoT Integration**: Voice assistants in rural kiosks

---

## 🎯 **Architecture Benefits**

### **For Users:**

- ⚡ **Fast**: Sub-3-second responses
- 🗣️ **Natural**: Voice-first interaction
- 🌍 **Accessible**: Works in local languages
- 📱 **Mobile-friendly**: Optimized for smartphones

### **For Government:**

- 📊 **Insights**: Real-time usage analytics
- 💰 **Cost-effective**: Reduced manual processing
- 🔒 **Secure**: Enterprise-grade security
- 📈 **Scalable**: Handles millions of citizens

### **For Developers:**

- 🔧 **Modular**: Independent service development
- 🚀 **CI/CD**: Automated deployment pipeline
- 📝 **Observable**: Comprehensive monitoring
- 🛠️ **Maintainable**: Clean, documented codebase

---

## 📚 **Technology Choices Explained**

### **Why Node.js?**

- **JavaScript Everywhere**: Same language for frontend and backend
- **High Performance**: Excellent for I/O intensive operations
- **Rich Ecosystem**: Vast library of packages
- **Real-time Support**: Built-in WebSocket capabilities

### **Why AWS?**

- **AI Services**: Best-in-class ML/AI offerings
- **Reliability**: 99.99% uptime SLA
- **Global Reach**: Data centers across India
- **Security**: Government-grade compliance

### **Why Microservices?**

- **Scalability**: Scale individual components
- **Reliability**: Failure isolation
- **Development Speed**: Independent team development
- **Technology Flexibility**: Use best tool for each job

### **Why Voice-First?**

- **Accessibility**: Works for non-literate users
- **Natural**: How humans prefer to communicate
- **Speed**: Faster than typing
- **Inclusive**: Bridges digital divide

---

This architecture is designed to serve **millions of Indians** with **government benefits** through **intelligent, voice-first AI** while maintaining **enterprise-grade security** and **99.9% reliability**. 🇮🇳✨
