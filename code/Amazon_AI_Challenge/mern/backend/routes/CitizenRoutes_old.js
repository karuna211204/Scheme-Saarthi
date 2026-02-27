const express = require('express');
const router = express.Router();
// Keeping old imports for backward compatibility - these point to Customer model
// which is actually the Citizen model now
const {
  getCitizenByPhone: getCustomerByPhone,
  createCitizen: createCustomer,
  updateCitizen: updateCustomer,
  getAllCitizens: getAllCustomers,
  deleteCitizen: deleteCustomer
} = require('../controllers/CitizenController');

// IMPORTANT: GET / must come BEFORE GET /:phone to avoid route conflicts
// Keeping old /api/customers endpoint for backward compatibility
router.get('/', getAllCustomers);
router.get('/:phone', getCustomerByPhone);
router.post('/', createCustomer);
router.put('/:phone', updateCustomer);
router.delete('/:phone', deleteCustomer);

module.exports = router;
