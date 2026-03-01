const express = require('express');
const router = express.Router();
const CitizenController = require('../controllers/CitizenController');
const { authenticate } = require('../middleware/auth');

// Public routes (for voice agent and citizen self-service)
router.get('/phone/:phone', CitizenController.getCitizenByPhone);
router.post('/', CitizenController.createCitizen);
router.put('/phone/:phone', CitizenController.updateCitizen);

// Protected routes (admin only)
router.get('/', authenticate, CitizenController.getAllCitizens);
router.delete('/phone/:phone', authenticate, CitizenController.deleteCitizen);

module.exports = router;
