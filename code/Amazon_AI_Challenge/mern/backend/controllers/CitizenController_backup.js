const Customer = require('../models/Customer')

const getCustomerByPhone = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('👤 GET CUSTOMER BY PHONE');
    console.log('Phone:', req.params.phone);
    console.log('='.repeat(60));

    const customer = await Customer.findOne({ phone: req.params.phone });
    if (!customer) {
      console.log('❌ Customer not found');
      return res.status(404).json({ message: 'Customer not found' });
    }
    console.log('✅ Customer found:', customer.name);
    return res.json(customer);
  } catch (err) {
    console.error('❌ Error fetching customer:', err);
    return res.status(500).json({ error: err.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('➕ CREATE CUSTOMER');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));

    const customer = new Customer(req.body);
    await customer.save();

    console.log('✅ Customer created:', customer._id);
    return res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (err) {
    console.error('❌ Error creating customer:', err);
    return res.status(500).json({ error: err.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { phone: req.params.phone },
      req.body,
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    return res.json(customer);
  } catch (err) {
    console.error('Error updating customer:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ created_at: -1 });
    return res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    return res.status(500).json({ error: err.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ phone: req.params.phone });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    return res.json({ message: 'Customer deleted successfully', customer });
  } catch (err) {
    console.error('Error deleting customer:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  getAllCustomers,
  deleteCustomer,
};
