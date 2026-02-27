const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  scheme_id: { type: String, required: true, unique: true, index: true },
  scheme_name: { type: String, required: true },
  scheme_name_hindi: { type: String, required: false },
  scheme_name_regional: { type: String, required: false }, // Telugu/Tamil
  
  // Scheme details
  ministry_department: { type: String, required: true },
  scheme_type: { type: String, required: true }, // Central/State/District
  category: { type: String, required: true }, // Agriculture, Education, Health, Housing, etc.
  
  // Description
  description: { type: String, required: true },
  description_hindi: { type: String, required: false },
  description_regional: { type: String, required: false },
  
  // Benefits
  benefit_amount: { type: Number, required: false }, // In rupees
  benefit_type: { type: String, required: false }, // Cash, Subsidy, In-kind, etc.
  benefit_description: { type: String, required: true },
  
  // Eligibility criteria
  eligibility: {
    min_age: { type: Number, required: false },
    max_age: { type: Number, required: false },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'All'], default: 'All' },
    income_limit: { type: Number, required: false }, // Maximum annual income
    caste_category: [{ type: String }], // ['SC', 'ST', 'OBC', 'General', 'All']
    occupation: [{ type: String }], // ['farmer', 'student', 'unemployed', etc.]
    location: [{ type: String }], // States/Districts where applicable
    education_level: { type: String, required: false },
    other_criteria: { type: String, required: false }
  },
  
  // Required documents
  required_documents: [{ type: String }], // ['Aadhaar', 'Income Certificate', etc.]
  
  // Application details
  application_process: { type: String, required: true },
  application_url: { type: String, required: false },
  helpline_number: { type: String, required: false },
  
  // Timeline
  application_deadline: { type: Date, required: false },
  processing_time_days: { type: Number, default: 30 },
  
  // Status
  is_active: { type: Boolean, default: true },
  last_updated: { type: Date, default: Date.now },
  
  // Metadata
  tags: [{ type: String }], // For search and categorization
  popularity_score: { type: Number, default: 0 }, // Based on applications
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at timestamp before saving
SchemeSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Indexes for efficient querying
SchemeSchema.index({ category: 1 });
SchemeSchema.index({ scheme_type: 1 });
SchemeSchema.index({ is_active: 1 });
SchemeSchema.index({ tags: 1 });

module.exports = mongoose.models.Scheme || mongoose.model('Scheme', SchemeSchema);
