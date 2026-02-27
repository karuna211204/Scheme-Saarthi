const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/ApplicationController');
const { protect } = require('../middleware/auth');

// Public routes (for voice agent and SMS)
router.post('/check-eligibility', ApplicationController.checkEligibility);
router.get('/phone/:phone', ApplicationController.getApplicationsByPhone);

// Protected routes (admin only)
router.get('/', protect, ApplicationController.getAllApplications);
router.get('/pending/:days', protect, ApplicationController.getPendingApplications);
router.post('/', ApplicationController.createApplication);
router.put('/:id', protect, ApplicationController.updateApplication);
router.delete('/:id', protect, ApplicationController.deleteApplication);

module.exports = router;
