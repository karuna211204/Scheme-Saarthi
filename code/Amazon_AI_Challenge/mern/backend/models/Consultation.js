const mongoose = require('mongoose');

const ConsultationRequestSchema = new mongoose.Schema({
  citizen_id: { type: String, required: false, index: true }, // Session ID for tracking
  phone: { type: String, required: true, index: true },
  citizen_name: { type: String, required: true },
  email: { type: String, required: false },
  
  // Consultation details
  consultation_date: { type: String, required: true }, // YYYY-MM-DD
  consultation_time: { type: String, required: true }, // HH:MM
  consultation_type: { type: String, default: 'general' }, // "general", "document_help", "application_support", "grievance"
  
  // Citizen query
  query_category: { type: String, required: false }, // Agriculture, Education, Health, etc.
  query_description: { type: String, default: '' },
  preferred_language: { type: String, default: 'hindi' }, // hindi, telugu, tamil, english
  
  // Location
  address: { type: String, required: false },
  district: { type: String, required: false },
  
  // Status
  status: { type: String, default: 'scheduled' }, // "scheduled", "confirmed", "completed", "cancelled"
  
  // Agent assignment
  assigned_agent: { type: String, required: false },
  
  notes: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at timestamp before saving
ConsultationRequestSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.models.ConsultationRequest || mongoose.model('ConsultationRequest', ConsultationRequestSchema);
