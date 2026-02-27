const express=require('express');
const router=express.Router();
const {
  saveTranscript,
  getTranscripts,
  getAllTranscriptsForAdmin,
  getTranscriptByCustomerId,
  deleteTranscript
}=require('../controllers/TranscriptController');

// IMPORTANT: Specific routes BEFORE parameterized routes
router.get('/admin/all', getAllTranscriptsForAdmin); // NEW: Admin endpoint
router.get('/', getTranscripts);
router.post('/', saveTranscript);
router.get('/:customer_id', getTranscriptByCustomerId);
router.delete('/:customer_id', deleteTranscript);

module.exports=router;
