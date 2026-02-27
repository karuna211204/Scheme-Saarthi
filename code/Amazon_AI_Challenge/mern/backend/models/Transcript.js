const mongoose=require('mongoose');

const TranscriptSchema=new mongoose.Schema({
  customer_id: { type: String, required: true, index: true }, // Removed unique constraint to allow multiple conversations
  transcript: { type: String, required: true },
  phone: { type: String, required: false },
  customer_name: { type: String, required: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

TranscriptSchema.pre('save', function(next) {
  this.updated_at=Date.now();
  next();
});

module.exports=mongoose.models.Transcript || mongoose.model('Transcript', TranscriptSchema);