const Transcript = require('../models/Transcript');

const saveTranscript = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('💾 SAVE TRANSCRIPT');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));
    
    const { citizen_id, transcript, phone, citizen_name } = req.body;
    
    if (!citizen_id || !transcript) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ error: 'citizen_id and transcript are required' });
    }
    
    console.log(`🆔 Citizen ID: ${citizen_id}`);
    console.log(`📝 Transcript length: ${transcript.length} chars`);
    console.log(`📝 Preview: ${transcript.substring(0, 200)}...`);
    
    // Create new transcript document instead of updating - to save ALL conversations
    const newTranscript = new Transcript({
      citizen_id,
      transcript,
      phone,
      citizen_name,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    const savedTranscript = await newTranscript.save();
    
    console.log('✅ New transcript saved successfully!');
    console.log('📋 Transcript ID:', savedTranscript._id);
    console.log('='.repeat(60));
    return res.json(savedTranscript);
  } catch (err) {
    console.error('❌ Error saving transcript:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getTranscripts = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('📝 GET ALL TRANSCRIPTS');
    console.log('='.repeat(60));
    
    const transcripts = await Transcript.find().sort({ created_at: -1 }).limit(100);
    console.log(`✅ Found ${transcripts.length} transcripts`);
    console.log('='.repeat(60));
    return res.json(transcripts);
  } catch (err) {
    console.error('❌ Error fetching transcripts:', err);
    return res.status(500).json({ error: err.message });
  }
};

// NEW: Get all transcripts for admin with full details
const getAllTranscriptsForAdmin = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('👑 ADMIN: GET ALL TRANSCRIPTS');
    console.log('='.repeat(60));
    
    // Get all transcripts sorted by most recent first
    const transcripts = await Transcript.find()
      .sort({ created_at: -1 })
      .select('citizen_id citizen_name phone transcript created_at updated_at')
      .lean();
    
    console.log(`✅ Found ${transcripts.length} transcripts for admin`);
    
    // Format the response with better structure
    const formattedTranscripts = transcripts.map(trans => ({
      _id: trans._id,
      citizen_name: trans.citizen_name || 'Unknown Citizen',
      phone: trans.phone || 'N/A',
      citizen_id: trans.citizen_id,
      transcript: trans.transcript,
      created_at: trans.created_at,
      time_ago: getTimeAgo(trans.created_at)
    }));
    
    console.log('📊 Sample transcript:', formattedTranscripts[0]);
    console.log('='.repeat(60));
    return res.json(formattedTranscripts);
  } catch (err) {
    console.error('❌ Error fetching admin transcripts:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Helper function to calculate time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
}

const getTranscriptByCitizenId=async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('🔍 GET TRANSCRIPT BY CITIZEN ID');
    console.log('Citizen ID:', req.params.citizen_id);
    console.log('='.repeat(60));
    
    const transcript=await Transcript.findOne({ citizen_id: req.params.citizen_id });
    
    if (!transcript) {
      console.log('❌ Transcript not found');
      return res.status(404).json({ message: 'Transcript not found' });
    }
    
    console.log('✅ Transcript found:', transcript._id);
    console.log('='.repeat(60));
    return res.json(transcript);
  } catch (err) {
    console.error('❌ Error fetching transcript:', err);
    return res.status(500).json({ error: err.message });
  }
};

const deleteTranscript=async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('🗑️ DELETE TRANSCRIPT');
    console.log('Citizen ID:', req.params.citizen_id);
    console.log('='.repeat(60));
    
    const transcript=await Transcript.findOneAndDelete({ citizen_id: req.params.citizen_id });
    
    if (!transcript) {
      console.log('❌ Transcript not found');
      return res.status(404).json({ message: 'Transcript not found' });
    }
    
    console.log('✅ Transcript deleted');
    console.log('='.repeat(60));
    return res.json({ message: 'Transcript deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting transcript:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports={
  saveTranscript,
  getTranscripts,
  getAllTranscriptsForAdmin,
  getTranscriptByCitizenId,
  deleteTranscript
};
