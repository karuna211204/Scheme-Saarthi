# Scheme Saarthi - AWS Architecture Diagram

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SCHEME SAARTHI ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE LAYER                              │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│  Rural Citizens │  Urban Users    │   Mobile App    │      Web App            │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CLOUDFRONT CDN                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LOAD BALANCER                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CORE MICROSERVICES (ECS)                             │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│ Voice Processing│Document Process │Scheme Management│   Communication         │
├─────────────────┼─────────────────┼─────────────────┼─────────────────────────┤
│ • Voice Service │• Document Svc   │• Scheme Service │• SMS Service            │
│ • Audio Proc    │• OCR Processor  │• Eligibility    │• PDF Generator          │
│                 │                 │  Engine         │• SIP Service            │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────────┘
                    │                 │                 │
                    ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AI/ML SERVICES LAYER                                │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│ Amazon Bedrock  │Amazon Transcribe│ Amazon Polly    │ Amazon Textract         │
│ Claude 3.5      │ Speech-to-Text  │ Text-to-Speech  │ OCR Processing          │
│ Sonnet          │                 │                 │                         │
├─────────────────┴─────────────────┴─────────────────┼─────────────────────────┤
│                Amazon Comprehend                    │                         │
│              Language Detection                     │                         │
└─────────────────────────────────────────────────────┴─────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DATA STORAGE LAYER                                  │
├─────────────────────────────────────┬───────────────────────────────────────────┤
│            DATABASES                │              FILE STORAGE                │
├─────────────────────────────────────┼───────────────────────────────────────────┤
│ • PostgreSQL Primary                │ • S3 Documents                            │
│ • PostgreSQL Replica               │ • S3 Audio Files                          │
│ • Redis Cluster                     │ • S3 PDF Files                            │
│                                     │ • S3 Knowledge Base                       │
└─────────────────────────────────────┴───────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL INTEGRATIONS                                 │
├─────────────────┬─────────────────┬─────────────────────────────────────────────┤
│   Twilio SMS    │   SIP Provider  │         Government APIs                     │
│                 │                 │                                             │
└─────────────────┴─────────────────┴─────────────────────────────────────────────┘
```

## Data Flow

### 1. Voice Input Flow

```
User Voice Input → CloudFront → ALB → API Gateway → Voice Service
                                                        ↓
Amazon Transcribe ← Voice Service → Audio Processor
        ↓
    Text Output → Scheme Service → Amazon Bedrock → Knowledge Base (S3)
                                        ↓
                              Eligibility Results
                                        ↓
Amazon Polly ← Response Service ← Eligibility Engine
        ↓
    Voice Response → User
```

### 2. Document Verification Flow

```
Document Upload → CloudFront → ALB → API Gateway → Document Service
                                                        ↓
                                              OCR Processor
                                                        ↓
                                            Amazon Textract
                                                        ↓
                                          Extracted Data → Eligibility Engine
                                                        ↓
                                            Verification Result
                                                        ↓
                                              PDF Generator → S3 PDFs
                                                        ↓
                                              SMS Service → Twilio → User
```

### 3. Scheme Discovery Flow

```
User Query → Voice/Text Processing → Scheme Service
                                          ↓
                                  Amazon Bedrock
                                          ↓
                              S3 Knowledge Base (Scheme PDFs)
                                          ↓
                                  Matching Schemes
                                          ↓
                              Eligibility Verification
                                          ↓
                                Response to User
```

## AWS Services Used

### Compute Services

- **Amazon ECS**: Container orchestration for microservices
- **AWS Lambda**: Serverless functions for event processing
- **Amazon EC2**: Virtual servers for additional compute needs

### AI/ML Services

- **Amazon Bedrock**: Claude 3.5 Sonnet for intelligent conversations
- **Amazon Transcribe**: Speech-to-text conversion
- **Amazon Polly**: Text-to-speech synthesis
- **Amazon Textract**: Document OCR and data extraction
- **Amazon Comprehend**: Language detection and NLP

### Storage Services

- **Amazon S3**: Object storage for documents, audio, PDFs, and knowledge base
- **Amazon RDS**: PostgreSQL for relational data
- **Amazon ElastiCache**: Redis for caching and session management

### Networking & Content Delivery

- **Amazon CloudFront**: Global CDN for fast content delivery
- **Application Load Balancer**: Traffic distribution
- **Amazon API Gateway**: API management and routing

### Security & Monitoring

- **AWS IAM**: Identity and access management
- **AWS KMS**: Key management for encryption
- **Amazon CloudWatch**: Monitoring and logging

### Integration Services

- **Amazon SQS**: Message queuing
- **Amazon SNS**: Notifications
- **AWS EventBridge**: Event routing

## Key Features

### 1. Multi-Language Support

- Voice input in Telugu, Hindi, Tamil
- Real-time language detection
- Native language responses

### 2. Document Intelligence

- Automatic document type detection
- Data extraction from Aadhaar, marksheets, income certificates
- Real-time eligibility verification

### 3. Scheme Discovery

- AI-powered scheme matching
- Natural language query processing
- Comprehensive government scheme database

### 4. Communication Channels

- Voice-first interface
- SMS-based PDF delivery
- SIP integration for human escalation
- Web and mobile app support

### 5. Scalability & Reliability

- Microservices architecture
- Auto-scaling capabilities
- Multi-AZ deployment
- Disaster recovery

## Security Considerations

- End-to-end encryption for sensitive data
- PII data protection and compliance
- Secure API authentication
- Regular security audits
- GDPR and data privacy compliance

## Cost Optimization

- Serverless architecture where applicable
- Auto-scaling based on demand
- S3 lifecycle policies for data archival
- Reserved instances for predictable workloads
- CloudWatch cost monitoring

---

**Note**: This architecture is designed to handle millions of users across India, providing government benefit discovery and verification services in multiple Indian languages with high availability and security.
