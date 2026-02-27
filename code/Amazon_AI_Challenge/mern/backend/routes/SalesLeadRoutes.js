const express = require('express');
const router = express.Router();
// Keeping old /api/salesleads endpoint for backward compatibility
// Now points to SchemeInquiry controller
const {
  createSchemeInquiry: createSalesLead,
  getSchemeInquiries: getSalesLeads,
  getSchemeInquiriesByPhone: getSalesLeadsByPhone,
  updateSchemeInquiry: updateSalesLead,
  getHighPriorityInquiries: getHighPriorityLeads,
  updateFollowUpOutcome: updateCallOutcome,
  getInquiriesStats: getLeadsStats,
  deleteSchemeInquiry: deleteSalesLead
} = require('../controllers/SchemeInquiryController');

// IMPORTANT: Specific routes must come BEFORE parameterized routes
router.get('/stats', getLeadsStats);
router.get('/high-priority', getHighPriorityLeads);
router.get('/', getSalesLeads);
router.post('/', createSalesLead);
router.get('/phone/:phone', getSalesLeadsByPhone);
router.put('/:id', updateSalesLead);
router.delete('/:id', deleteSalesLead);
router.post('/:id/call-outcome', updateCallOutcome);

module.exports = router;
