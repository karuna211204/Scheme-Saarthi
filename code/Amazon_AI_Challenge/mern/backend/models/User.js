const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Original Google Auth fields
  google_id: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  picture: { type: String, required: false },
  phone: { type: String, required: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  
  // Enhanced Profile Fields
  // Basic Information
  dateOfBirth: { type: Date, required: false },
  age: { type: Number, required: false },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'], 
    required: false 
  },
  
  // Aadhaar Details (OCR extracted)
  aadhaarNumber: { 
    type: String, 
    required: false,
    validate: {
      validator: function(v) {
        // Aadhaar validation: 12 digits, no spaces
        return !v || /^\d{12}$/.test(v.replace(/\s/g, ''));
      },
      message: 'Aadhaar number must be 12 digits'
    }
  },
  fatherName: { type: String, required: false },
  
  // Address Information
  address: { type: String, required: false },
  pincode: { 
    type: String, 
    required: false,
    validate: {
      validator: function(v) {
        // Indian pincode validation: 6 digits
        return !v || /^\d{6}$/.test(v);
      },
      message: 'Pincode must be 6 digits'
    }
  },
  district: { type: String, required: false },
  state: { type: String, required: false },
  
  // Economic Information
  annualIncome: { 
    type: Number, 
    required: false,
    min: [0, 'Annual income cannot be negative']
  },
  occupation: { 
    type: String, 
    enum: ['Farmer', 'Labor', 'Business', 'Service', 'Student', 'Unemployed', 'Retired', 'Other'], 
    required: false 
  },
  employmentType: { 
    type: String, 
    enum: ['Government', 'Private', 'Self-Employed', 'Unemployed', 'Student'], 
    required: false 
  },
  
  // Family Information
  familySize: { 
    type: Number, 
    required: false,
    min: [1, 'Family size must be at least 1']
  },
  dependents: { 
    type: Number, 
    required: false,
    min: [0, 'Dependents cannot be negative']
  },
  
  // Category Information
  category: { 
    type: String, 
    enum: ['General', 'OBC', 'SC', 'ST'], 
    required: false 
  },
  disability: { 
    type: String, 
    enum: ['None', 'Physical', 'Visual', 'Hearing', 'Mental', 'Multiple'], 
    default: 'None'
  },
  
  // Financial Information
  bankAccountNumber: { type: String, required: false },
  ifscCode: { 
    type: String, 
    required: false,
    validate: {
      validator: function(v) {
        // IFSC code validation: 11 characters
        return !v || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
      },
      message: 'Invalid IFSC code format'
    }
  },
  panNumber: { 
    type: String, 
    required: false,
    validate: {
      validator: function(v) {
        // PAN validation: AAAAA9999A format
        return !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
      },
      message: 'Invalid PAN number format'
    }
  },
  
  // Additional Information
  educationLevel: { 
    type: String, 
    enum: [
      'No Formal Education', 'Primary', 'Secondary', 'Higher Secondary', 
      'Graduate', 'Post Graduate', 'Professional', 'Other'
    ], 
    required: false 
  },
  landOwnership: { 
    type: String, 
    enum: ['Landless', 'Marginal (< 1 hectare)', 'Small (1-2 hectares)', 'Medium (2-10 hectares)', 'Large (> 10 hectares)'], 
    required: false 
  },
  hasRationCard: { type: Boolean, default: false },
  rationCardNumber: { type: String, required: false },
  
  // Profile Status
  profileCompleteness: { 
    type: Number, 
    default: 0,
    min: [0, 'Profile completion cannot be negative'],
    max: [100, 'Profile completion cannot exceed 100%']
  },
  
  // Verification Status
  verificationStatus: {
    aadhaar: { type: Boolean, default: false },
    mobile: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    bank: { type: Boolean, default: false },
    income: { type: Boolean, default: false }
  },
  
  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  last_login: { type: Date, default: Date.now },
  lastProfileUpdate: { type: Date, required: false },
  lastOcrUpdate: { type: Date, required: false }
});

// Indexes for performance
UserSchema.index({ phone: 1 });
UserSchema.index({ aadhaarNumber: 1 });
UserSchema.index({ category: 1, annualIncome: 1 });
UserSchema.index({ occupation: 1 });
UserSchema.index({ profileCompleteness: 1 });

// Pre-save middleware
UserSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  
  // Calculate age from date of birth
  if (this.dateOfBirth && !this.age) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  }
  
  // Calculate profile completeness
  const requiredFields = [
    'name', 'phone', 'dateOfBirth', 'gender', 'aadhaarNumber',
    'address', 'pincode', 'annualIncome', 'occupation', 'category'
  ];
  const filledFields = requiredFields.filter(field => this[field] && this[field] !== '');
  this.profileCompleteness = Math.round((filledFields.length / requiredFields.length) * 100);
  
  next();
});

// Virtual for display name
UserSchema.virtual('displayName').get(function() {
  return this.name || 'Unknown User';
});

// Virtual for age calculation
UserSchema.virtual('calculatedAge').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return this.age;
});

// Method to check if profile is complete enough for scheme eligibility
UserSchema.methods.canAccessSchemes = function() {
  return this.profileCompleteness >= 50;
};

// Method to get missing required fields
UserSchema.methods.getMissingFields = function() {
  const requiredFields = [
    { field: 'name', label: 'Full Name' },
    { field: 'phone', label: 'Mobile Number' },
    { field: 'dateOfBirth', label: 'Date of Birth' },
    { field: 'gender', label: 'Gender' },
    { field: 'aadhaarNumber', label: 'Aadhaar Number' },
    { field: 'address', label: 'Address' },
    { field: 'pincode', label: 'Pincode' },
    { field: 'annualIncome', label: 'Annual Income' },
    { field: 'occupation', label: 'Occupation' },
    { field: 'category', label: 'Category' }
  ];
  
  return requiredFields.filter(item => !this[item.field] || this[item.field] === '');
};

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);