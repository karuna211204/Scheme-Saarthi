const mongoose=require('mongoose');

const UserSchema=new mongoose.Schema({
  google_id: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  picture: { type: String, required: false },
  phone: { type: String, required: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  last_login: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
  this.updated_at=Date.now();
  next();
});

module.exports=mongoose.models.User || mongoose.model('User', UserSchema);