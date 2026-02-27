const express = require('express');
const router = express.Router();
const {
  createSchemeInquiry,
  getSchemeInquiries,
  getSchemeInquiriesByPhone,
  updateSchemeInquiry,
  getHighPriorityInquiries,
  updateFollowUpOutcome,
  getInquiriesStats
} = require('../controllers/SchemeInquiryController');

// IMPORTANT: Specific routes must come BEFORE parameterized routes
router.get('/stats', getInquiriesStats);
router.get('/high-priority', getHighPriorityInquiries);
router.get('/', getSchemeInquiries);
router.post('/', createSchemeInquiry);
router.get('/phone/:phone', getSchemeInquiriesByPhone);
router.put('/:id', updateSchemeInquiry);
router.delete('/:id', require('../controllers/SchemeInquiryController').deleteSchemeInquiry);
router.post('/:id/follow-up', updateFollowUpOutcome);

module.exports = router;
