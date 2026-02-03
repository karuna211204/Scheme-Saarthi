# Scheme Saarthi - Requirements Document

## Project Overview

**Project Name:** Scheme Saarthi (AI-Powered Government Benefit Sahayak)  
**Version:** 1.0.0  
**Date:** February 2026  
**Team:** Scheme Saarthi Development Team

## Executive Summary

Scheme Saarthi is a voice-first, multimodal AI assistant designed to bridge the gap between rural Indian citizens and government benefits. The system addresses the critical problem of unclaimed government benefits worth millions of Crores by providing an accessible, multilingual interface for scheme discovery, eligibility verification, and application assistance.

## Technology Stack Overview

### **Core Architecture**

- **Backend Framework**: Node.js with Express.js for RESTful APIs
- **Real-time Communication**: Socket.io for WebSocket connections
- **Containerization**: Docker with Kubernetes orchestration
- **Cloud Platform**: Amazon Web Services (AWS) as primary infrastructure

### **AI & Machine Learning Services**

- **Large Language Model**: Amazon Bedrock with Claude 3.5 Sonnet
- **Knowledge Base**: Bedrock Knowledge Bases with RAG (Retrieval Augmented Generation)
- **Speech Processing**: Amazon Transcribe (STT) + Amazon Polly (TTS)
- **Document Analysis**: Amazon Textract for OCR and document parsing
- **Model Context Protocol**: MCP server for standardized AI tool integration

### **Voice & Communication**

- **Voice Interface**: LiveKit for real-time audio streaming
- **SIP Integration**: Node-SIP for human customer care escalation
- **SMS Services**: Twilio for SMS delivery and notifications
- **Multi-language Support**: Hindi, Telugu, Tamil, English with neural voices

### **Data & Storage**

- **Primary Database**: PostgreSQL (Amazon RDS) for structured data
- **Caching Layer**: Redis (ElastiCache) for session management and performance
- **File Storage**: Amazon S3 for documents, audio files, and generated PDFs
- **Search Engine**: ElasticSearch for fast scheme discovery

### **Security & Compliance**

- **Authentication**: JWT tokens with phone-based OTP verification
- **Encryption**: AES-256 (at rest) + TLS 1.3 (in transit)
- **Key Management**: AWS KMS for encryption key rotation
- **Compliance**: GDPR, Digital Personal Data Protection Act (India)

### **Monitoring & DevOps**

- **Monitoring**: AWS CloudWatch with custom metrics and alarms
- **Logging**: Structured logging with AWS CloudWatch Logs
- **Tracing**: AWS X-Ray for distributed tracing
- **CI/CD**: GitHub Actions with automated testing and deployment

### **Integration & APIs**

- **PDF Generation**: PDFKit for eligibility reports and documents
- **QR Code**: QRCode library for document verification
- **Government APIs**: Integration with official scheme databases
- **Third-party Services**: Twilio (SMS), SIP servers (voice calls)

## Problem Statement

### The Challenge: Billions in Unclaimed Benefits

India operates over **1,000+ government schemes** across central, state, and district levels, designed to support citizens through education, healthcare, agriculture, and social welfare. However, **₹50,000+ Crores worth of benefits remain unclaimed annually** due to systemic barriers that prevent citizens from accessing their rightful entitlements.

### Current Challenges

1. **Language Barrier**: Government documents are primarily in English or complex bureaucratic language
   - 75% of rural Indians are not comfortable with English
   - Official forms and eligibility criteria use technical jargon
   - No standardized multilingual interface across schemes

2. **Discovery Gap**: Citizens are unaware of schemes they're eligible for
   - Information scattered across 100+ government websites
   - No centralized discovery mechanism
   - Lack of personalized recommendations based on citizen profiles

3. **Verification Friction**: Complex document verification processes requiring middlemen
   - Citizens pay ₹500-2000 to agents for application assistance
   - Manual document verification takes 15-30 days
   - High rejection rates due to incomplete or incorrect documentation

4. **Accessibility Issues**: Limited digital literacy and smartphone penetration in rural areas
   - 40% of rural population has limited smartphone usage skills
   - Poor internet connectivity in remote areas
   - No voice-first interfaces for non-literate users

5. **Information Fragmentation**: Schemes scattered across multiple departments and portals
   - Agriculture schemes on different portals than education schemes
   - No unified citizen dashboard
   - Duplicate applications and conflicting eligibility criteria

### Impact Statistics

- **₹50,000+ Crores**: Annual unclaimed benefits across all schemes
- **500M+ Citizens**: Internet users who are not English-proficient
- **68% Rural Population**: Lacks awareness of eligible government schemes
- **30-40% Application Rejection Rate**: Due to documentation issues
- **15-30 Days**: Average processing time for scheme applications

### Target Impact

- **Primary Beneficiaries**: 500M+ Indians who are internet users but not English-proficient
- **Geographic Focus**: Rural and semi-urban areas across India (Tier 2, 3, 4 cities and villages)
- **Demographic Focus**:
  - **Farmers**: Agricultural subsidies, crop insurance, equipment loans
  - **Students**: Scholarships, education loans, skill development programs
  - **Low-income Families**: Ration subsidies, housing schemes, healthcare benefits
  - **Senior Citizens**: Pension schemes, healthcare benefits, social security
  - **Women**: Self-help group loans, entrepreneurship schemes, maternity benefits
  - **Differently-abled**: Disability benefits, assistive device schemes

### Success Metrics Target

- **Increase Scheme Awareness**: From 32% to 80% in target demographics
- **Reduce Application Time**: From 15-30 days to 3-5 days
- **Eliminate Middleman Dependency**: Reduce agent fees by 90%
- **Improve Application Success Rate**: From 60-70% to 95%
- **Enable Voice-First Access**: Support for 4 major Indian languages

## Functional Requirements

### 1. Voice Interface (FR-001 to FR-010)

**FR-001: Multilingual Voice Input**

- Support for Hindi, Telugu, Tamil, and English
- Real-time speech-to-text conversion
- Noise cancellation and audio enhancement
- Minimum 85% accuracy for Indian accents

**FR-002: Voice Output**

- Natural-sounding text-to-speech in native languages
- Neural voice synthesis using Amazon Polly
- Adjustable speech rate and volume
- Regional dialect support

**FR-003: Conversational AI**

- Context-aware conversation management
- Multi-turn dialogue support
- Intent recognition and slot filling
- Fallback to human agent when needed

**FR-004: Voice Commands**

- "Scheme search" voice commands
- "Document upload" voice instructions
- "Application status" queries
- Emergency escalation phrases

### 2. Scheme Discovery & Matching (FR-011 to FR-020)

**FR-011: Intelligent Scheme Search**

- RAG-based search across 1000+ government schemes
- Fuzzy matching for scheme names and descriptions
- Category-based filtering (education, agriculture, healthcare)
- Real-time search results within 3 seconds

**FR-012: Eligibility Assessment**

- Rule-based eligibility checking
- Profile-based automatic matching
- Confidence scoring for eligibility
- Multiple scheme comparison

**FR-013: Personalized Recommendations**

- User profile-based suggestions
- Location-specific scheme filtering
- Priority ranking based on benefit amount
- Deadline-aware recommendations

**FR-014: Scheme Information Management**

- Comprehensive scheme database
- Regular updates from official sources
- Version control for scheme changes
- Multi-language scheme descriptions

### 3. Document Verification (FR-021 to FR-030)

**FR-021: OCR Document Analysis**

- Aadhaar card data extraction
- Marksheet/certificate parsing
- Income certificate processing
- Bank document verification

**FR-022: Auto-Eligibility Verification**

- Real-time document validation
- Cross-reference with scheme criteria
- Confidence scoring for matches
- Error detection and correction suggestions

**FR-023: Document Security**

- Encrypted document storage
- PII data protection
- Automatic document deletion after processing
- Audit trail for document access

**FR-024: Supported Document Types**

- Identity: Aadhaar, Voter ID, Passport
- Education: Marksheets, Certificates, Degrees
- Income: Salary slips, Income certificates
- Property: Land records, Property documents

### 4. Human Escalation (FR-031 to FR-040)

**FR-031: SIP Integration**

- Automatic call routing to customer care
- Context transfer to human agents
- Call recording and transcription
- Queue management and wait time estimation

**FR-032: Escalation Triggers**

- Complex query detection
- User frustration indicators
- Multiple failed attempts
- Explicit human agent requests

**FR-033: Agent Dashboard**

- Real-time conversation context
- User profile and history
- Scheme eligibility status
- Document verification results

**FR-034: Call Management**

- Call initiation and termination
- Conference call capabilities
- Call transfer between agents
- Post-call feedback collection

### 5. SMS & PDF Services (FR-041 to FR-050)

**FR-041: PDF Generation**

- Eligibility report generation
- Multi-language PDF support
- QR code integration for verification
- Mobile-optimized formatting

**FR-042: SMS Integration**

- Twilio-based SMS delivery
- Multi-language SMS support
- Delivery confirmation tracking
- SMS-based status updates

**FR-043: Document Sharing**

- Secure PDF link generation
- Time-limited access URLs
- SMS delivery with download links
- Usage analytics and tracking

## Non-Functional Requirements

### 1. Performance (NFR-001 to NFR-010)

**NFR-001: Response Time**

- Voice processing: < 3 seconds
- Scheme search: < 2 seconds
- Document analysis: < 10 seconds
- PDF generation: < 5 seconds

**NFR-002: Scalability**

- Support 10,000 concurrent users
- Horizontal scaling capability
- Auto-scaling based on load
- Database partitioning support

**NFR-003: Availability**

- 99.9% uptime SLA
- Disaster recovery plan
- Multi-region deployment
- Health monitoring and alerting

### 2. Security (NFR-011 to NFR-020)

**NFR-011: Data Protection**

- End-to-end encryption for voice data
- PII data anonymization
- GDPR compliance for data handling
- Regular security audits

**NFR-012: Authentication**

- Phone number-based authentication
- OTP verification for sensitive operations
- Session management and timeout
- Role-based access control

**NFR-013: API Security**

- Rate limiting and throttling
- API key authentication
- Input validation and sanitization
- SQL injection prevention

### 3. Usability (NFR-021 to NFR-030)

**NFR-021: Accessibility**

- Voice-first interface design
- Screen reader compatibility
- High contrast mode support
- Large font size options

**NFR-022: Mobile Optimization**

- Responsive web design
- Progressive Web App (PWA)
- Offline capability for basic features
- Low bandwidth optimization

**NFR-023: User Experience**

- Intuitive voice commands
- Clear error messages
- Progress indicators
- Help and tutorial system

## Technical Requirements

### 1. Infrastructure (TR-001 to TR-010)

**TR-001: Cloud Platform**

- AWS as primary cloud provider
- Multi-AZ deployment
- CDN for static content delivery
- Load balancing and auto-scaling

**TR-002: Compute Resources**

- Node.js runtime environment
- Docker containerization
- Kubernetes orchestration
- Serverless functions for specific tasks

**TR-003: Storage Requirements**

- S3 for document and audio storage
- RDS for structured data
- ElastiCache for session management
- Backup and archival policies

### 2. AI/ML Services (TR-011 to TR-020)

**TR-011: Language Models**

- Amazon Bedrock with Claude 3.5 Sonnet
- Custom fine-tuning for Indian context
- Model versioning and rollback
- A/B testing for model performance

**TR-012: Voice Processing**

- Amazon Transcribe for STT
- Amazon Polly for TTS
- Custom acoustic models for Indian languages
- Real-time streaming support

**TR-013: Document Processing**

- Amazon Textract for OCR
- Custom document templates
- Machine learning for accuracy improvement
- Batch processing capabilities

### 3. Integration Requirements (TR-021 to TR-030)

**TR-021: MCP Server**

- Model Context Protocol implementation
- RESTful API design
- WebSocket support for real-time updates
- API versioning and backward compatibility

**TR-022: Third-party Integrations**

- Twilio for SMS services
- SIP server for voice calls
- Government API integrations
- Payment gateway integration (future)

**TR-023: Monitoring & Analytics**

- CloudWatch for system monitoring
- Custom metrics for business KPIs
- User behavior analytics
- Performance monitoring and alerting

## Compliance & Regulatory Requirements

### 1. Data Privacy (CR-001 to CR-010)

**CR-001: Indian Data Protection Laws**

- Compliance with Digital Personal Data Protection Act
- Data localization requirements
- Consent management framework
- Right to deletion implementation

**CR-002: Government Compliance**

- Aadhaar data handling guidelines
- eKYC compliance requirements
- Digital India initiative alignment
- Accessibility standards compliance

### 2. Security Standards (CR-011 to CR-020)

**CR-011: Encryption Standards**

- AES-256 encryption for data at rest
- TLS 1.3 for data in transit
- Key management using AWS KMS
- Regular security assessments

**CR-012: Audit Requirements**

- Comprehensive audit logging
- Tamper-proof log storage
- Regular compliance audits
- Incident response procedures

## Success Metrics & KPIs

### 1. User Adoption (KPI-001 to KPI-010)

**KPI-001: User Engagement**

- Monthly Active Users (MAU): Target 100K in Year 1
- Session Duration: Average 5+ minutes
- Return User Rate: 60%+
- Voice Interaction Success Rate: 90%+

**KPI-002: Geographic Reach**

- Coverage across 28 states
- Rural user percentage: 70%+
- Multi-language usage distribution
- State-wise adoption metrics

### 2. Business Impact (KPI-011 to KPI-020)

**KPI-011: Scheme Discovery**

- Schemes discovered per user: 3+
- Eligibility match accuracy: 95%+
- Application completion rate: 40%+
- Benefit amount facilitated: ₹100 Cr+ annually

**KPI-012: Operational Efficiency**

- Human escalation rate: <10%
- Document verification accuracy: 98%+
- Average resolution time: <5 minutes
- Customer satisfaction score: 4.5+/5

### 3. Technical Performance (KPI-021 to KPI-030)

**KPI-021: System Performance**

- API response time: <2 seconds (95th percentile)
- System uptime: 99.9%
- Error rate: <0.1%
- Voice recognition accuracy: 95%+

## Risk Assessment & Mitigation

### 1. Technical Risks (RISK-001 to RISK-010)

**RISK-001: AI Model Accuracy**

- Risk: Incorrect scheme recommendations
- Impact: High - User trust and adoption
- Mitigation: Continuous model training, human oversight
- Probability: Medium

**RISK-002: Scalability Challenges**

- Risk: System overload during peak usage
- Impact: High - Service unavailability
- Mitigation: Auto-scaling, load testing, CDN
- Probability: Low

### 2. Business Risks (RISK-011 to RISK-020)

**RISK-011: Regulatory Changes**

- Risk: Changes in government policies
- Impact: Medium - Feature modifications required
- Mitigation: Regular policy monitoring, flexible architecture
- Probability: High

**RISK-012: Competition**

- Risk: Similar solutions from competitors
- Impact: Medium - Market share loss
- Mitigation: Continuous innovation, user experience focus
- Probability: Medium

## Future Enhancements

### Phase 2 Features (6-12 months)

- WhatsApp integration
- Offline mobile app
- Blockchain-based document verification
- AI-powered application form filling

### Phase 3 Features (12-18 months)

- Video KYC integration
- Multi-modal biometric verification
- Predictive scheme recommendations
- Integration with DigiLocker

### Long-term Vision (18+ months)

- Pan-India government partnership
- International expansion (Bangladesh, Sri Lanka)
- Advanced AI agents for complex queries
- Comprehensive citizen services platform

## Appendices

### Appendix A: Supported Government Schemes

- Central Government Schemes (200+)
- State Government Schemes (800+)
- District-level Schemes (500+)
- Sector-wise categorization

### Appendix B: Technical Architecture Diagrams

- System architecture overview
- Data flow diagrams
- Security architecture
- Deployment architecture

### Appendix C: API Specifications

- RESTful API documentation
- WebSocket event specifications
- MCP server protocol details
- Third-party integration specs

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Next Review:** March 2026  
**Approved By:** Product Team, Engineering Team, Compliance Team
