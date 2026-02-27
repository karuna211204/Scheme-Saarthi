const express = require('express');
const router = express.Router();
const {
  exportCustomers,
  exportAppointments,
  exportWarranties,
  exportSalesLeads,
  exportTranscripts,
} = require('../controllers/ExportController');

router.get('/customers', exportCustomers);
router.get('/appointments', exportAppointments);
router.get('/warranties', exportWarranties);
router.get('/salesleads', exportSalesLeads);
router.get('/transcripts', exportTranscripts);

module.exports = router;
