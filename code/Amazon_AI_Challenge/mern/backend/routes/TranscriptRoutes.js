const express=require('express');
const router=express.Router();
const {
  saveTranscript,
  getTranscripts,
  getAllTranscriptsForAdmin,
  getTranscriptByCitizenId,
  deleteTranscript
}=require('../controllers/TranscriptController');

// IMPORTANT: Specific routes BEFORE parameterized routes
router.get('/admin/all', getAllTranscriptsForAdmin); // Admin endpoint
router.get('/', getTranscripts);
router.post('/', saveTranscript);
router.get('/:citizen_id', getTranscriptByCitizenId);
router.delete('/:citizen_id', deleteTranscript);

module.exports=router;
