const mongoose = require('mongoose');

const SchemeInquirySchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  citizen_name: { type: String, required: true },
  email: { type: String, required: false },
  
  // Inquiry Source & Type
  inquiry_type: { type: String, required: true }, // "voice_call", "web_form", "helpline", "outreach_campaign"
  source: { type: String, default: 'manual' }, // "manual", "ai_agent", "helpline", "sms_campaign"
  
  // Scheme Interest
  interested_schemes: [{ type: String }], // Array of scheme IDs
  primary_category: { type: String, required: false }, // Agriculture, Education, Health, etc.
  
  // Citizen Profile (for targeting)
  citizen_profile: {
    age: { type: Number, required: false },
    gender: { type: String, required: false },
    occupation: { type: String, required: false },
    annual_income: { type: Number, required: false },
    location: { type: String, required: false },
    caste_category: { type: String, required: false }
  },
  
  // Lead Scoring & Qualification
  eligibility_score: { type: Number, default: 0, min: 0, max: 100 }, // How well they match schemes
  urgency_score: { type: Number, default: 0, min: 0, max: 100 }, // Based on need/timeline
  qualification_status: { type: String, default: 'unqualified' }, // "unqualified", "qualified", "high_priority", "converted"
  
  // Engagement tracking
  engagement_score: { type: Number, default: 0 }, // Based on interactions
  interaction_count: { type: Number, default: 0 },
  last_interaction_date: { type: Date, required: false },
  
  // Campaign tracking
  campaign_id: { type: String, required: false },
  campaign_name: { type: String, required: false },
  
  // Status & Follow-up
  status: { type: String, default: 'open' }, // "open", "contacted", "documents_submitted", "applied", "closed"
  follow_up_date: { type: Date, default: null },
  follow_up_reason: { type: String, required: false },
  notes: { type: String, default: '' },
  
  // Application tracking
  applications_initiated: { type: Number, default: 0 },
  applications_submitted: { type: Number, default: 0 },
  applications_approved: { type: Number, default: 0 },
  
  // Communication history
  sms_sent_count: { type: Number, default: 0 },
  calls_made_count: { type: Number, default: 0 },
  last_sms_date: { type: Date, required: false },
  last_call_date: { type: Date, required: false },
  
  // Assignment
  assigned_to: { type: String, required: false }, // Agent/Officer name
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at timestamp before saving
SchemeInquirySchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Index for better query performance
SchemeInquirySchema.index({ eligibility_score: -1 });
SchemeInquirySchema.index({ urgency_score: -1 });
SchemeInquirySchema.index({ qualification_status: 1 });
SchemeInquirySchema.index({ status: 1 });

module.exports = mongoose.models.SchemeInquiry || mongoose.model('SchemeInquiry', SchemeInquirySchema);