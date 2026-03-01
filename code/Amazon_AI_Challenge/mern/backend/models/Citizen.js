const mongoose = require('mongoose');

const CitizenSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: false },
  address: { type: String, required: false },
  
  // Demographic information for scheme eligibility
  age: { type: Number, required: false },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: false },
  
  // Location details
  state: { type: String, required: false },
  district: { type: String, required: false },
  village_city: { type: String, required: false },
  pincode: { type: String, required: false },
  
  // Occupation and income
  occupation: { type: String, required: false }, // farmer, student, unemployed, daily_wage, etc.
  annual_income: { type: Number, required: false },
  income_category: { type: String, enum: ['BPL', 'APL', 'EWS', 'Middle', 'Upper'], required: false },
  
  // Category details
  caste_category: { type: String, enum: ['SC', 'ST', 'OBC', 'General', 'Not Specified'], default: 'Not Specified' },
  
  // Education
  education_level: { type: String, required: false }, // primary, secondary, graduate, etc.
  
  // Family details
  family_size: { type: Number, required: false },
  marital_status: { type: String, enum: ['Single', 'Married', 'Widowed', 'Divorced'], required: false },
  
  // Document information
  aadhaar_verified: { type: Boolean, default: false },
  aadhaar_number: { type: String, required: false }, // Last 4 digits only for security
  pan_verified: { type: Boolean, default: false },
  
  // Language preference
  preferences: {
    language: { type: String, enum: ['hindi', 'telugu', 'tamil', 'english'], default: 'hindi' },
    contact_method: { type: String, default: 'phone' } // 'phone', 'sms', 'email'
  },
  
  registration_date: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at timestamp before saving
CitizenSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.models.Citizen || mongoose.model('Citizen', CitizenSchema);
