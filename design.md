"# Scheme Saarthi - System Design Document

## Document Information

**Project:** Scheme Saarthi - AI-Powered Government Benefit Sahayak  
**Version:** 1.0.0  
**Date:** February 2026  
**Authors:** Next_gen_coders(Abhiram Gattamneni,Karuna sree Gorrepati,Kranthi Uppada)

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [High-Level Architecture](#high-level-architecture)
4. [Component Design](#component-design)
5. [Data Architecture](#data-architecture)
6. [API Design](#api-design)
7. [Security Architecture](#security-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Monitoring & Observability](#monitoring--observability)
10. [Performance Considerations](#performance-considerations)

## System Overview

### Vision Statement

Scheme Saarthi is designed as a scalable, multilingual, voice-first AI platform that democratizes access to government benefits for rural Indian citizens through intelligent automation and human-AI collaboration.

### Design Goals

- **Accessibility First**: Voice-driven interface for low digital literacy users
- **Scalability**: Support millions of users across India
- **Reliability**: 99.9% uptime with graceful degradation
- **Security**: Enterprise-grade security for sensitive government data
- **Modularity**: Microservices architecture for independent scaling
- **Extensibility**: Plugin architecture for new schemes and features

### Key Design Decisions

1. **Voice-First Architecture**: Primary interaction through speech
2. **MCP Integration**: Standardized AI tool protocol for modularity
3. **AWS Native**: Leverage managed services for faster development
4. **Event-Driven**: Asynchronous processing for better performance
5. **Multi-Tenant**: Single deployment serving multiple states/regions

## Architecture Principles

### 1. Microservices Architecture

- **Service Decomposition**: Each business capability as independent service
- **Database per Service**: Avoid shared databases between services
- **API Gateway**: Centralized routing and cross-cutting concerns
- **Service Mesh**: Inter-service communication and observability

### 2. Event-Driven Design

- **Asynchronous Processing**: Non-blocking operations for better UX
- **Event Sourcing**: Audit trail for all user interactions
- **CQRS Pattern**: Separate read/write models for optimization
- **Saga Pattern**: Distributed transaction management

### 3. Cloud-Native Principles

- **Containerization**: Docker containers for consistent deployment
- **Orchestration**: Kubernetes for container management
- **Auto-Scaling**: Dynamic resource allocation based on demand
- **Managed Services**: Leverage AWS managed services where possible

### 4. Security by Design

- **Zero Trust**: Never trust, always verify
- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimal required permissions
- **Data Encryption**: Encryption at rest and in transit

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  Web App  │  Mobile App  │  WhatsApp  │  Voice Calls (SIP)     │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  Load Balancer  │  Rate Limiting  │  Authentication  │  Routing │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                   Application Services                           │
├─────────────────────────────────────────────────────────────────┤
│ Voice Service │ Document Service │ Scheme Service │ User Service │
│ SMS Service   │ SIP Service      │ MCP Server     │ Auth Service │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      AI/ML Layer                                │
├─────────────────────────────────────────────────────────────────┤
│ Amazon Bedrock │ Transcribe │ Polly │ Textract │ Comprehend    │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer                                  │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  S3  │  Knowledge Base  │  ElasticSearch │
└─────────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. Voice Processing Service

**Purpose**: Handle voice input/output and real-time communication

**Components**:

- **Speech-to-Text Engine**: Amazon Transcribe integration
- **Text-to-Speech Engine**: Amazon Polly integration
- **Audio Processing**: Noise reduction, format conversion
- **WebSocket Manager**: Real-time audio streaming
- **Language Detection**: Automatic language identification

**Key Classes**:

```javascript
class VoiceService {
  async transcribeAudio(audioBuffer, language)
  async synthesizeSpeech(text, language, voice)
  async detectLanguage(audioBuffer)
  async processRealTimeAudio(stream)
}

class AudioProcessor {
  async enhanceAudio(audioBuffer)
  async convertFormat(audioBuffer, targetFormat)
  async extractFeatures(audioBuffer)
}
```

**Data Flow**:

1. Client sends audio stream via WebSocket
2. Audio enhancement and format conversion
3. Language detection and transcription
4. AI processing and response generation
5. Text-to-speech synthesis
6. Audio response streaming back to client

### 2. Document Verification Service

**Purpose**: OCR processing and document validation

**Components**:

- **OCR Engine**: Amazon Textract integration
- **Document Parser**: Extract structured data from documents
- **Validation Engine**: Verify document authenticity
- **Template Manager**: Handle different document formats
- **Confidence Scorer**: Assess extraction accuracy

**Key Classes**:

```javascript
class DocumentService {
  async analyzeDocument(documentBuffer, documentType)
  async extractStructuredData(ocrResult)
  async validateDocument(extractedData, documentType)
  async calculateConfidenceScore(ocrResult)
}

class DocumentParser {
  async parseAadhaar(ocrResult)
  async parseMarksheet(ocrResult)
  async parseIncomeDocument(ocrResult)
}
```

**Supported Document Types**:

- **Identity Documents**: Aadhaar, Voter ID, Passport, Driving License
- **Educational Documents**: Marksheets, Certificates, Degrees
- **Financial Documents**: Income certificates, Bank statements
- **Property Documents**: Land records, Property papers

### 3. Scheme Discovery Service

**Purpose**: Intelligent scheme matching and recommendation

**Components**:

- **Search Engine**: ElasticSearch-based scheme search
- **Matching Algorithm**: Rule-based eligibility assessment
- **Recommendation Engine**: ML-based personalized suggestions
- **Cache Manager**: Redis-based caching for performance
- **Update Manager**: Sync with government data sources

**Key Classes**:

```javascript
class SchemeService {
  async searchSchemes(query, userProfile, filters)
  async checkEligibility(userProfile, schemeId)
  async getRecommendations(userProfile, context)
  async getSchemeDetails(schemeId, language)
}

class EligibilityEngine {
  async evaluateRules(userProfile, schemeRules)
  async calculateEligibilityScore(userProfile, scheme)
  async identifyMissingRequirements(userProfile, scheme)
}
```

**Scheme Data Model**:

```javascript
{
  id: "scheme_001",
  name: {
    en: "PM-KISAN Samman Nidhi",
    hi: "पीएम-किसान सम्मान निधि",
    te: "పిఎం-కిసాన్ సమ్మాన్ నిధి"
  },
  category: "agriculture",
  eligibility: {
    age: { min: 18, max: null },
    income: { max: 200000 },
    landOwnership: true,
    category: ["general", "obc", "sc", "st"]
  },
  benefits: {
    amount: 6000,
    frequency: "annual",
    installments: 3
  },
  documents: ["aadhaar", "bank_account", "land_records"],
  applicationProcess: {...},
  deadlines: {...}
}
```

### 4. MCP Server Integration

**Purpose**: Standardized AI tool protocol for scheme knowledge

**Components**:

- **MCP Protocol Handler**: Implement MCP specification
- **Tool Registry**: Register available tools and capabilities
- **Knowledge Base Interface**: Query Bedrock Knowledge Bases
- **Context Manager**: Maintain conversation context
- **Response Formatter**: Format responses for different clients

**MCP Tools**:

```javascript
const mcpTools = [
  {
    name: "search_schemes",
    description: "Search government schemes based on query",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        userProfile: { type: "object" },
        language: { type: "string" }
      }
    }
  },
  {
    name: "check_eligibility",
    description: "Check user eligibility for schemes",
    inputSchema: {...}
  }
];
```

### 5. Human Escalation Service (SIP Integration)

**Purpose**: Seamless handoff to human customer care agents

**Components**:

- **SIP Client**: Node-SIP integration for voice calls
- **Call Router**: Intelligent routing to available agents
- **Context Transfer**: Pass conversation history to agents
- **Queue Manager**: Handle call queuing and wait times
- **Recording Manager**: Call recording and transcription

**Key Classes**:

```javascript
class SIPService {
  async initiateCall(userPhone, context)
  async routeToAgent(callId, agentSkills)
  async transferContext(callId, conversationHistory)
  async endCall(callId)
}

class CallManager {
  async createCall(userPhone, customerCareNumber)
  async monitorCallStatus(callId)
  async handleCallEvents(event)
}
```

**Escalation Triggers**:

- User explicitly requests human agent
- AI confidence score below threshold (< 0.7)
- Complex multi-scheme queries
- Document verification failures
- User frustration indicators (repeated queries)

### 6. SMS & PDF Service

**Purpose**: Document generation and SMS-based sharing

**Components**:

- **PDF Generator**: PDFKit-based document creation
- **Template Engine**: Customizable PDF templates
- **SMS Gateway**: Twilio integration for message delivery
- **URL Shortener**: Generate short links for PDF access
- **Delivery Tracker**: Track SMS delivery status

**Key Classes**:

```javascript
class SMSService {
  async sendEligibilityPDF(userPhone, eligibilityData, language)
  async sendStatusUpdate(userPhone, applicationData, language)
  async generatePDF(data, template, language)
  async uploadToS3(pdfBuffer, metadata)
}

class PDFGenerator {
  async createEligibilityReport(data, language)
  async createApplicationGuide(schemeData, language)
  async addQRCode(pdf, data)
}
```

## Data Architecture

### 1. Database Design

**Primary Database**: PostgreSQL (Amazon RDS)

**Core Tables**:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    preferred_language VARCHAR(5) DEFAULT 'hi',
    profile JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100),
    messages JSONB[],
    context JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Schemes table
CREATE TABLE schemes (
    id VARCHAR(50) PRIMARY KEY,
    name JSONB NOT NULL, -- Multi-language names
    category VARCHAR(50),
    eligibility_rules JSONB,
    benefits JSONB,
    documents JSONB,
    application_process JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User scheme interactions
CREATE TABLE user_scheme_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    scheme_id VARCHAR(50) REFERENCES schemes(id),
    interaction_type VARCHAR(20), -- 'viewed', 'eligible', 'applied'
    eligibility_score DECIMAL(3,2),
    interaction_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    document_type VARCHAR(50),
    s3_key VARCHAR(500),
    extracted_data JSONB,
    confidence_score DECIMAL(3,2),
    verification_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Caching Strategy

**Redis Clusters**:

- **Session Cache**: User sessions and conversation context
- **Scheme Cache**: Frequently accessed scheme data
- **Search Cache**: Search results and recommendations
- **Rate Limiting**: API rate limiting counters

**Cache Keys**:

```
session:{session_id} -> conversation context
user:{user_id}:profile -> user profile data
scheme:{scheme_id} -> scheme details
search:{query_hash} -> search results
eligibility:{user_id}:{scheme_id} -> eligibility results
```

### 3. File Storage (Amazon S3)

**Bucket Structure**:

```
scheme-saarthi-production/
├── audio/
│   ├── input/{user_id}/{timestamp}.wav
│   └── output/{user_id}/{timestamp}.mp3
├── documents/
│   ├── uploaded/{user_id}/{document_id}.{ext}
│   └── processed/{user_id}/{document_id}.json
├── pdfs/
│   ├── eligibility/{user_id}/{timestamp}.pdf
│   └── guides/{scheme_id}/{language}.pdf
└── knowledge-base/
    ├── schemes/{category}/{scheme_id}.pdf
    └── updates/{timestamp}/
```

### 4. Knowledge Base (Amazon Bedrock)

**Data Sources**:

- Government scheme PDFs (1000+ documents)
- Official circulars and notifications
- FAQ documents and user guides
- State-specific scheme variations

**Vector Store Structure**:

- Document chunking: 500-1000 tokens per chunk
- Metadata: scheme_id, category, state, language, last_updated
- Embedding model: Amazon Titan Embeddings
- Retrieval: Semantic search + keyword matching

## API Design

### 1. RESTful API Endpoints

**Base URL**: `https://api.schemesaarthi.gov.in/v1`

**Authentication**: Bearer token (JWT) or API key

**Core Endpoints**:

```yaml
# Voice Processing
POST /voice/process
  - Process voice input and return AI response
  - Body: multipart/form-data (audio file)
  - Response: { text, audio_url, confidence, language }

POST /voice/synthesize
  - Convert text to speech
  - Body: { text, language, voice_id }
  - Response: { audio_url, duration }

# Document Processing
POST /documents/analyze
  - Analyze uploaded document
  - Body: multipart/form-data (document file)
  - Response: { extracted_data, confidence, document_type }

POST /documents/verify
  - Verify document against scheme requirements
  - Body: { document_data, scheme_id }
  - Response: { eligible, confidence, missing_requirements }

# Scheme Discovery
GET /schemes/search?q={query}&state={state}&category={category}
  - Search schemes by query
  - Response: { schemes[], total, facets }

GET /schemes/{scheme_id}
  - Get detailed scheme information
  - Response: { scheme_details, eligibility_rules, application_process }

POST /schemes/check-eligibility
  - Check eligibility for multiple schemes
  - Body: { user_profile, scheme_ids[] }
  - Response: { eligibility_results[] }

# User Management
POST /users/register
  - Register new user
  - Body: { phone_number, preferred_language }
  - Response: { user_id, verification_code }

GET /users/{user_id}/profile
  - Get user profile
  - Response: { profile, preferences, interaction_history }

# SMS & PDF Services
POST /pdf/generate
  - Generate eligibility PDF
  - Body: { user_id, eligibility_data, template }
  - Response: { pdf_url, expiry_time }

POST /sms/send
  - Send SMS with PDF link
  - Body: { phone_number, message, pdf_url }
  - Response: { message_id, status }

# Human Escalation
POST /escalation/initiate
  - Escalate to human agent
  - Body: { user_id, conversation_context, reason }
  - Response: { call_id, estimated_wait_time }

GET /escalation/{call_id}/status
  - Get escalation status
  - Response: { status, agent_info, wait_time }
```

### 2. WebSocket API

**Connection**: `wss://api.schemesaarthi.gov.in/ws`

**Events**:

```javascript
// Client to Server
{
  type: "voice_input",
  data: {
    audio_chunk: "base64_encoded_audio",
    language: "hi",
    session_id: "session_123"
  }
}

{
  type: "text_input",
  data: {
    message: "मुझे scholarship चाहिए",
    session_id: "session_123"
  }
}

// Server to Client
{
  type: "voice_response",
  data: {
    text: "आपके लिए 3 scholarship schemes मिली हैं",
    audio_url: "https://...",
    confidence: 0.95
  }
}

{
  type: "scheme_suggestions",
  data: {
    schemes: [...],
    eligibility_scores: [...]
  }
}

{
  type: "escalation_initiated",
  data: {
    call_id: "call_123",
    estimated_wait: "2-3 minutes"
  }
}
```

### 3. MCP Server Protocol

**Transport**: stdio, WebSocket, or HTTP

**Capabilities**:

```json
{
  "capabilities": {
    "tools": {
      "listChanged": true
    },
    "resources": {
      "subscribe": true,
      "listChanged": true
    }
  }
}
```

**Tool Definitions**:

```json
{
  "tools": [
    {
      "name": "search_schemes",
      "description": "Search government schemes",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": { "type": "string" },
          "user_profile": { "type": "object" },
          "filters": { "type": "object" }
        },
        "required": ["query"]
      }
    }
  ]
}
```

## Security Architecture

### 1. Authentication & Authorization

**Multi-Factor Authentication**:

- Primary: Phone number + OTP
- Secondary: Biometric (future)
- Session management: JWT tokens with refresh

**Role-Based Access Control (RBAC)**:

```yaml
Roles:
  - citizen: Basic scheme search and application
  - agent: Customer care agent access
  - admin: System administration
  - auditor: Read-only access for compliance

Permissions:
  - scheme:read, scheme:search
  - document:upload, document:verify
  - user:profile:read, user:profile:update
  - escalation:initiate, escalation:handle
  - system:monitor, system:configure
```

### 2. Data Protection

**Encryption**:

- **At Rest**: AES-256 encryption for all stored data
- **In Transit**: TLS 1.3 for all API communications
- **Key Management**: AWS KMS for encryption key rotation

**PII Data Handling**:

- Data minimization: Collect only necessary information
- Anonymization: Remove PII from analytics data
- Retention policies: Auto-delete after specified periods
- Access logging: Audit all PII data access

**Sensitive Data Classification**:

```yaml
Public: Scheme information, general content
Internal: User preferences, interaction logs
Confidential: Phone numbers, document metadata
Restricted: Document content, Aadhaar data, income info
```

### 3. API Security

**Rate Limiting**:

```yaml
Tiers:
  - Anonymous: 100 requests/hour
  - Authenticated: 1000 requests/hour
  - Premium: 10000 requests/hour

Endpoints:
  - /voice/process: 60 requests/hour per user
  - /documents/analyze: 20 requests/hour per user
  - /schemes/search: 200 requests/hour per user
```

**Input Validation**:

- Schema validation for all API inputs
- File type and size validation for uploads
- SQL injection prevention
- XSS protection for text inputs

### 4. Infrastructure Security

**Network Security**:

- VPC with private subnets for application servers
- WAF for web application firewall
- DDoS protection via CloudFlare
- Security groups with least privilege access

**Container Security**:

- Base images from trusted registries
- Regular vulnerability scanning
- Runtime security monitoring
- Secrets management via AWS Secrets Manager

## Deployment Architecture

### 1. Multi-Environment Setup

**Environments**:

```yaml
Development:
  - Single AZ deployment
  - Minimal resources
  - Mock external services
  - Debug logging enabled

Staging:
  - Production-like setup
  - Subset of production data
  - Integration testing
  - Performance testing

Production:
  - Multi-AZ deployment
  - Auto-scaling enabled
  - Full monitoring
  - Disaster recovery
```

### 2. Kubernetes Deployment

**Cluster Configuration**:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: scheme-saarthi

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: voice-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: voice-service
  template:
    metadata:
      labels:
        app: voice-service
    spec:
      containers:
        - name: voice-service
          image: scheme-saarthi/voice-service:latest
          ports:
            - containerPort: 3000
          env:
            - name: AWS_REGION
              value: "ap-south-1"
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
```

### 3. Auto-Scaling Configuration

**Horizontal Pod Autoscaler**:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: voice-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: voice-service
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 4. CI/CD Pipeline

**GitHub Actions Workflow**:

```yaml
name: Deploy Scheme Saarthi
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t scheme-saarthi:${{ github.sha }} .
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
          docker push $ECR_REGISTRY/scheme-saarthi:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EKS
        run: |
          kubectl set image deployment/voice-service voice-service=$ECR_REGISTRY/scheme-saarthi:${{ github.sha }}
          kubectl rollout status deployment/voice-service
```

## Monitoring & Observability

### 1. Metrics & KPIs

**Application Metrics**:

```yaml
Business Metrics:
  - active_users_daily
  - schemes_searched_per_user
  - eligibility_checks_completed
  - documents_verified_successfully
  - human_escalation_rate
  - user_satisfaction_score

Technical Metrics:
  - api_response_time_p95
  - error_rate_percentage
  - voice_processing_latency
  - document_ocr_accuracy
  - cache_hit_ratio
  - database_connection_pool_usage
```

**Custom CloudWatch Metrics**:

```javascript
// Example metric publishing
const cloudwatch = new AWS.CloudWatch();

await cloudwatch
  .putMetricData({
    Namespace: "SchemeSaarthi/Application",
    MetricData: [
      {
        MetricName: "VoiceProcessingLatency",
        Value: processingTime,
        Unit: "Milliseconds",
        Dimensions: [
          {
            Name: "Language",
            Value: language,
          },
        ],
      },
    ],
  })
  .promise();
```

### 2. Logging Strategy

**Structured Logging**:

```javascript
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  defaultMeta: {
    service: "voice-service",
    version: process.env.APP_VERSION,
  },
  transports: [
    new winston.transports.CloudWatchLogs({
      logGroupName: "/aws/ecs/scheme-saarthi",
      logStreamName: "voice-service",
    }),
  ],
});

// Usage
logger.info("Voice processing started", {
  userId: user.id,
  sessionId: session.id,
  language: language,
  audioLength: audioBuffer.length,
});
```

**Log Levels & Categories**:

```yaml
ERROR: System errors, exceptions, failed operations
WARN: Performance issues, deprecated API usage
INFO: Business events, user actions, system state changes
DEBUG: Detailed execution flow, variable values
TRACE: Fine-grained debugging information
```

### 3. Distributed Tracing

**AWS X-Ray Integration**:

```javascript
const AWSXRay = require("aws-xray-sdk-core");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));

// Trace voice processing pipeline
app.use(AWSXRay.express.openSegment("SchemeSaarthi"));

router.post("/voice/process", async (req, res) => {
  const segment = AWSXRay.getSegment();

  const subsegment = segment.addNewSubsegment("transcribe-audio");
  try {
    const transcription = await voiceService.transcribeAudio(audioBuffer);
    subsegment.close();

    // Continue with AI processing...
  } catch (error) {
    subsegment.addError(error);
    subsegment.close();
  }
});

app.use(AWSXRay.express.closeSegment());
```

### 4. Alerting & Notifications

**CloudWatch Alarms**:

```yaml
High Error Rate:
  Metric: ErrorRate
  Threshold: > 5%
  Period: 5 minutes
  Action: SNS notification to on-call team

High Response Time:
  Metric: ResponseTime
  Threshold: > 3 seconds (P95)
  Period: 10 minutes
  Action: Auto-scaling trigger + notification

Low Voice Recognition Accuracy:
  Metric: VoiceAccuracy
  Threshold: < 90%
  Period: 15 minutes
  Action: Escalate to ML team

Database Connection Issues:
  Metric: DatabaseConnections
  Threshold: > 80% of pool
  Period: 5 minutes
  Action: Scale database + notification
```

## Performance Considerations

### 1. Scalability Patterns

**Horizontal Scaling**:

- Stateless application design
- Load balancing across multiple instances
- Database read replicas for read-heavy workloads
- CDN for static content delivery

**Vertical Scaling**:

- Auto-scaling based on CPU/memory metrics
- Burstable instance types for variable workloads
- Memory optimization for AI model inference
- CPU optimization for audio processing

### 2. Caching Strategy

**Multi-Level Caching**:

```yaml
L1 - Application Cache:
  - In-memory caching for frequently accessed data
  - LRU eviction policy
  - 100MB cache size per instance

L2 - Redis Cache:
  - Distributed caching across instances
  - Session data and search results
  - 1-hour TTL for most data

L3 - CDN Cache:
  - Static assets and generated PDFs
  - Edge locations for global distribution
  - 24-hour TTL for scheme documents
```

### 3. Database Optimization

**Query Optimization**:

```sql
-- Indexes for common queries
CREATE INDEX idx_schemes_category_state ON schemes(category, state);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_conversations_user_created ON conversations(user_id, created_at);

-- Partitioning for large tables
CREATE TABLE conversations_2026_02 PARTITION OF conversations
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

**Connection Pooling**:

```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: 5432,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 4. AI Model Optimization

**Model Inference Optimization**:

- Batch processing for multiple requests
- Model caching to avoid repeated loading
- Quantization for faster inference
- GPU acceleration for compute-intensive tasks

**Bedrock Optimization**:

```javascript
// Optimize Bedrock calls with caching
const bedrockCache = new Map();

async function invokeBedrockWithCache(prompt, modelId) {
  const cacheKey = `${modelId}:${hashPrompt(prompt)}`;

  if (bedrockCache.has(cacheKey)) {
    return bedrockCache.get(cacheKey);
  }

  const response = await bedrock.invokeModel({
    modelId,
    body: JSON.stringify({ prompt }),
  });

  bedrockCache.set(cacheKey, response);
  return response;
}
```
