const Citizen = require('../models/Citizen');

const getCitizenByPhone = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('👤 GET CITIZEN BY PHONE');
    console.log('Phone:', req.params.phone);
    console.log('='.repeat(60));

    const citizen = await Citizen.findOne({ phone: req.params.phone });
    if (!citizen) {
      console.log('❌ Citizen not found');
      return res.status(404).json({ message: 'Citizen not found' });
    }
    console.log('✅ Citizen found:', citizen.name);
    return res.json(citizen);
  } catch (err) {
    console.error('❌ Error fetching citizen:', err);
    return res.status(500).json({ error: err.message });
  }
};

const createCitizen = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('➕ CREATE CITIZEN');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));

    const citizen = new Citizen(req.body);
    await citizen.save();

    console.log('✅ Citizen created:', citizen._id);
    return res.status(201).json({ message: 'Citizen created successfully', citizen });
  } catch (err) {
    console.error('❌ Error creating citizen:', err);
    return res.status(500).json({ error: err.message });
  }
};

const updateCitizen = async (req, res) => {
  try {
    const citizen = await Citizen.findOneAndUpdate(
      { phone: req.params.phone },
      req.body,
      { new: true }
    );
    if (!citizen) return res.status(404).json({ message: 'Citizen not found' });
    return res.json(citizen);
  } catch (err) {
    console.error('Error updating citizen:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getAllCitizens = async (req, res) => {
  try {
    const citizens = await Citizen.find().sort({ created_at: -1 });
    return res.json(citizens);
  } catch (err) {
    console.error('Error fetching citizens:', err);
    return res.status(500).json({ error: err.message });
  }
};

const deleteCitizen = async (req, res) => {
  try {
    const citizen = await Citizen.findOneAndDelete({ phone: req.params.phone });
    if (!citizen) return res.status(404).json({ message: 'Citizen not found' });
    return res.json({ message: 'Citizen deleted successfully', citizen });
  } catch (err) {
    console.error('Error deleting citizen:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCitizenByPhone,
  createCitizen,
  updateCitizen,
  getAllCitizens,
  deleteCitizen,
};
