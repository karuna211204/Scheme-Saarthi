const Scheme = require('../models/Scheme');

const getAllSchemes = async (req, res) => {
  try {
    const { category, is_active } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (is_active !== undefined) filter.is_active = is_active === 'true';
    
    const schemes = await Scheme.find(filter).sort({ popularity_score: -1, scheme_name: 1 });
    return res.json(schemes);
  } catch (err) {
    console.error('Error fetching schemes:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findOne({ scheme_id: req.params.scheme_id });
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    return res.json(scheme);
  } catch (err) {
    console.error('Error fetching scheme:', err);
    return res.status(500).json({ error: err.message });
  }
};

const searchSchemes = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('🔍 SEARCH SCHEMES');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));

    const { 
      category, 
      min_age, 
      max_age, 
      gender, 
      income_limit, 
      caste_category, 
      occupation,
      location,
      tags 
    } = req.body;

    const filter = { is_active: true };

    if (category) filter.category = category;
    if (tags && tags.length > 0) filter.tags = { $in: tags };

    const schemes = await Scheme.find(filter);

    // Filter based on eligibility criteria
    const eligibleSchemes = schemes.filter(scheme => {
      let eligible = true;

      if (min_age && scheme.eligibility.min_age && min_age < scheme.eligibility.min_age) eligible = false;
      if (max_age && scheme.eligibility.max_age && max_age > scheme.eligibility.max_age) eligible = false;
      if (gender && scheme.eligibility.gender !== 'All' && scheme.eligibility.gender !== gender) eligible = false;
      if (income_limit && scheme.eligibility.income_limit && income_limit > scheme.eligibility.income_limit) eligible = false;
      
      if (caste_category && scheme.eligibility.caste_category && scheme.eligibility.caste_category.length > 0) {
        if (!scheme.eligibility.caste_category.includes('All') && !scheme.eligibility.caste_category.includes(caste_category)) {
          eligible = false;
        }
      }

      if (occupation && scheme.eligibility.occupation && scheme.eligibility.occupation.length > 0) {
        if (!scheme.eligibility.occupation.includes('All') && !scheme.eligibility.occupation.includes(occupation)) {
          eligible = false;
        }
      }

      if (location && scheme.eligibility.location && scheme.eligibility.location.length > 0) {
        if (!scheme.eligibility.location.includes('All States') && !scheme.eligibility.location.some(loc => loc.includes(location))) {
          eligible = false;
        }
      }

      return eligible;
    });

    console.log(`✅ Found ${eligibleSchemes.length} eligible schemes out of ${schemes.length} total`);
    console.log('='.repeat(60));

    return res.json({
      count: eligibleSchemes.length,
      schemes: eligibleSchemes
    });
  } catch (err) {
    console.error('❌ Error searching schemes:', err);
    return res.status(500).json({ error: err.message });
  }
};

const createScheme = async (req, res) => {
  try {
    const scheme = new Scheme(req.body);
    await scheme.save();
    return res.status(201).json({ message: 'Scheme created successfully', scheme });
  } catch (err) {
    console.error('Error creating scheme:', err);
    return res.status(500).json({ error: err.message });
  }
};

const updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findOneAndUpdate(
      { scheme_id: req.params.scheme_id },
      req.body,
      { new: true }
    );
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    return res.json({ message: 'Scheme updated successfully', scheme });
  } catch (err) {
    console.error('Error updating scheme:', err);
    return res.status(500).json({ error: err.message });
  }
};

const deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findOneAndDelete({ scheme_id: req.params.scheme_id });
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    return res.json({ message: 'Scheme deleted successfully', scheme });
  } catch (err) {
    console.error('Error deleting scheme:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getSchemesByCategory = async (req, res) => {
  try {
    const schemes = await Scheme.find({ 
      category: req.params.category,
      is_active: true 
    }).sort({ popularity_score: -1 });
    return res.json(schemes);
  } catch (err) {
    console.error('Error fetching schemes by category:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllSchemes,
  getSchemeById,
  searchSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
  getSchemesByCategory,
};
