const express = require('express');
const router = express.Router();
// Keeping old /api/warranties endpoint for backward compatibility
// Now points to Application (scheme applications) controller
const {
  checkEligibility: checkWarranty,
  getApplicationsByPhone: getWarrantiesByPhone,
  createApplication: createWarranty,
  getAllApplications: getAllWarranties,
  getPendingApplications: getExpiringWarranties,
  updateApplication: updateWarranty,
  deleteApplication: deleteWarranty
} = require('../controllers/ApplicationController');

// IMPORTANT: Specific routes must come BEFORE parameterized routes
router.get('/', getAllWarranties);
router.post('/', createWarranty);
router.post('/check', checkWarranty);
router.get('/expiring/:days', getExpiringWarranties);
router.get('/phone/:phone', getWarrantiesByPhone);
router.put('/:id', updateWarranty);
router.delete('/:id', deleteWarranty);

module.exports = router;