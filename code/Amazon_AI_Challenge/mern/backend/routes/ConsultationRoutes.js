const express = require('express');
const router = express.Router();
const {
  createConsultation,
  getConsultations,
  getConsultationById,
  getConsultationsByPhone,
  updateConsultation,
  checkAvailability,
  bookConsultation,
  sendEmail,
  saveTranscript,
  saveTranscriptByCustomerId
} = require('../controllers/ConsultationController');

// IMPORTANT: Specific routes must come BEFORE parameterized routes
router.get('/', getConsultations);
router.post('/', createConsultation);
router.post('/check-availability', checkAvailability);
router.post('/book', bookConsultation);
router.post('/send-email', sendEmail);
router.post('/transcript/customer', saveTranscriptByCustomerId);
router.get('/phone/:phone', getConsultationsByPhone);
router.get('/:id', getConsultationById);
router.put('/:id', updateConsultation);
router.put('/:id/transcript', saveTranscript);
router.delete('/:id', require('../controllers/ConsultationController').deleteConsultation);

module.exports = router;