const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  application_id: { type: String, required: true, unique: true, index: true },
  citizen_name: { type: String, required: true },
  
  // Scheme details
  scheme_id: { type: String, required: true },
  scheme_name: { type: String, required: true },
  scheme_category: { type: String, required: true }, // Agriculture, Education, Health, etc.
  
  // Application status
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'under_review', 'documents_pending', 'approved', 'rejected', 'disbursed'],
    default: 'draft'
  },
  
  // Dates
  application_date: { type: Date, default: Date.now },
  submission_date: { type: Date, required: false },
  approval_date: { type: Date, required: false },
  disbursement_date: { type: Date, required: false },
  
  // Citizen profile at time of application
  citizen_profile: {
    age: { type: Number, required: false },
    gender: { type: String, required: false },
    occupation: { type: String, required: false },
    annual_income: { type: Number, required: false },
    caste_category: { type: String, required: false },
    location: { type: String, required: false }
  },
  
  // Documents
  documents_submitted: [{
    document_type: { type: String, required: true }, // 'Aadhaar', 'Income Certificate', etc.
    document_url: { type: String, required: false },
    verified: { type: Boolean, default: false },
    verification_date: { type: Date, required: false }
  }],
  
  // Verification
  eligibility_verified: { type: Boolean, default: false },
  verification_notes: { type: String, required: false },
  
  // Benefit details
  benefit_amount: { type: Number, required: false },
  disbursement_method: { type: String, required: false }, // 'Bank Transfer', 'Cheque', 'In-kind'
  bank_account: { type: String, required: false }, // Last 4 digits only
  
  // Tracking
  reference_number: { type: String, required: false },
  qr_code_url: { type: String, required: false },
  
  // Communication
  sms_sent: { type: Boolean, default: false },
  email_sent: { type: Boolean, default: false },
  last_notification_date: { type: Date, required: false },
  
  // Notes and history
  notes: { type: String, default: '' },
  status_history: [{
    status: { type: String, required: true },
    changed_at: { type: Date, default: Date.now },
    changed_by: { type: String, required: false },
    comment: { type: String, required: false }
  }],
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at timestamp before saving
ApplicationSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Add compound index for phone + application_id queries
ApplicationSchema.index({ phone: 1, application_id: 1 });
ApplicationSchema.index({ scheme_id: 1 });
ApplicationSchema.index({ status: 1 });

module.exports = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);