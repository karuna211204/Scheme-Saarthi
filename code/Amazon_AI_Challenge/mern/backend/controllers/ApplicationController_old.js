const Warranty = require('../models/Warranty')

const checkWarranty = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('🔍 CHECK WARRANTY');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));

    const { phone, invoice_id } = req.body;
    if (!phone) {
      console.log('❌ Missing phone number');
      return res.status(400).json({ message: 'Phone required' });
    }

    const query = { phone };
    if (invoice_id) {
      query.invoice_id = invoice_id;
      console.log('🔎 Searching with phone AND invoice_id');
    } else {
      console.log('🔎 Searching with phone only');
    }

    const warranties = await Warranty.find(query);
    console.log(`📊 Found ${warranties.length} warranties`);

    if (!warranties || warranties.length === 0) {
      console.log('❌ No warranties found');
      return res.status(404).json({
        valid: false,
        message: 'No warranty found for this phone'
      });
    }

    const now = new Date();
    const warrantyDetails = warranties.map(warranty => {
      const expiry = new Date(warranty.warranty_expiry);
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      const isValid = daysLeft > 0;

      console.log(`   📋 ${warranty.product_name}: ${isValid ? 'VALID' : 'EXPIRED'} (${daysLeft} days)`);

      return {
        invoice_id: warranty.invoice_id,
        product_name: warranty.product_name,
        product_category: warranty.product_category,
        purchase_date: warranty.purchase_date,
        warranty_expiry: warranty.warranty_expiry,
        days_left: Math.max(0, daysLeft),
        valid: isValid,
        amc_enrolled: warranty.amc_enrolled,
        amc_expiry: warranty.amc_expiry
      };
    });

    const hasValidWarranty = warrantyDetails.some(w => w.valid);
    console.log(`✅ Result: ${hasValidWarranty ? 'HAS VALID WARRANTY' : 'ALL EXPIRED'}`);

    const response = {
      valid: hasValidWarranty,
      count: warranties.length,
      warranties: warrantyDetails
    };
    console.log('📤 Response:', response);
    console.log('='.repeat(60));
    return res.json(response);
  } catch (err) {
    console.error('❌ Error checking warranty:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getWarrantiesByPhone = async (req, res) => {
  try {
    const warranties = await Warranty.find({ phone: req.params.phone });
    return res.json(warranties);
  } catch (err) {
    console.error('Error fetching warranties by phone:', err);
    return res.status(500).json({ error: err.message });
  }
};

const createWarranty = async (req, res) => {
  try {
    const warranty = new Warranty(req.body);
    await warranty.save();
    return res.status(201).json({ message: 'Warranty created successfully', warranty });
  } catch (err) {
    console.error('Error creating warranty:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getAllWarranties = async (req, res) => {
  try {
    const warranties = await Warranty.find().sort({ created_at: -1 });
    return res.json(warranties);
  } catch (err) {
    console.error('Error fetching warranties:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getExpiringWarranties = async (req, res) => {
  try {
    const daysThreshold = parseInt(req.params.days) || 7;
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysThreshold);

    const warranties = await Warranty.find({
      warranty_expiry: {
        $gte: today,
        $lte: futureDate
      },
      amc_enrolled: false
    }).sort({ warranty_expiry: 1 });

    const results = warranties.map(w => {
      const daysLeft = Math.ceil((new Date(w.warranty_expiry) - today) / (1000 * 60 * 60 * 24));
      return {
        ...w.toObject(),
        days_left: daysLeft
      };
    });

    return res.json(results);
  } catch (err) {
    console.error('Error fetching expiring warranties:', err);
    return res.status(500).json({ error: err.message });
  }
};

const updateWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!warranty) return res.status(404).json({ message: 'Warranty not found' });
    return res.json({ message: 'Warranty updated successfully', warranty });
  } catch (err) {
    console.error('Error updating warranty:', err);
    return res.status(500).json({ error: err.message });
  }
};

const deleteWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findByIdAndDelete(req.params.id);
    if (!warranty) return res.status(404).json({ message: 'Warranty not found' });
    return res.json({ message: 'Warranty deleted successfully', warranty });
  } catch (err) {
    console.error('Error deleting warranty:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  checkWarranty,
  getWarrantiesByPhone,
  createWarranty,
  getAllWarranties,
  getExpiringWarranties,
  updateWarranty,
  deleteWarranty,
};