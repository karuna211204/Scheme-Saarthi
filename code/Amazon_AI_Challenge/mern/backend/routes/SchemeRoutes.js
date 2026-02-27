const express = require('express');
const router = express.Router();
const SchemeController = require('../controllers/SchemeController');
const { protect } = require('../middleware/auth');

// Public routes (for voice agent and citizen access)
router.get('/', SchemeController.getAllSchemes);
router.get('/category/:category', SchemeController.getSchemesByCategory);
router.get('/:scheme_id', SchemeController.getSchemeById);
router.post('/search', SchemeController.searchSchemes);

// Protected routes (admin only - scheme management)
router.post('/', protect, SchemeController.createScheme);
router.put('/:scheme_id', protect, SchemeController.updateScheme);
router.delete('/:scheme_id', protect, SchemeController.deleteScheme);

module.exports = router;
