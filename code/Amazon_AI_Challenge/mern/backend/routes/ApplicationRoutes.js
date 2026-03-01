const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/ApplicationController');
const { authenticate } = require('../middleware/auth');

// Public routes (for voice agent and SMS)
router.post('/check-eligibility', ApplicationController.checkEligibility);
router.get('/phone/:phone', ApplicationController.getApplicationsByPhone);

// Protected routes (admin only)
router.get('/', authenticate, ApplicationController.getAllApplications);
router.get('/pending/:days', authenticate, ApplicationController.getPendingApplications);
router.post('/', ApplicationController.createApplication);
router.put('/:id', authenticate, ApplicationController.updateApplication);
router.delete('/:id', authenticate, ApplicationController.deleteApplication);

module.exports = router;
