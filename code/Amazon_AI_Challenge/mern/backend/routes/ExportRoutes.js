const express = require('express');
const router = express.Router();
const {
  exportCitizens,
  exportConsultations,
  exportApplications,
  exportSchemeInquiries,
  exportTranscripts,
} = require('../controllers/ExportController');

router.get('/citizens', exportCitizens);
router.get('/consultations', exportConsultations);
router.get('/applications', exportApplications);
router.get('/scheme-inquiries', exportSchemeInquiries);
router.get('/transcripts', exportTranscripts);

module.exports = router;
