const Application = require('../models/Application');

const checkEligibility = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('🔍 CHECK SCHEME ELIGIBILITY');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));

    const { phone, scheme_id } = req.body;
    if (!phone) {
      console.log('❌ Missing phone number');
      return res.status(400).json({ message: 'Phone required' });
    }

    const query = { phone };
    if (scheme_id) {
      query.scheme_id = scheme_id;
      console.log('🔎 Searching with phone AND scheme_id');
    } else {
      console.log('🔎 Searching with phone only');
    }

    const applications = await Application.find(query);
    console.log(`📊 Found ${applications.length} applications`);

    if (!applications || applications.length === 0) {
      console.log('❌ No applications found');
      return res.status(404).json({
        eligible: false,
        message: 'No application history found for this phone'
      });
    }

    const applicationDetails = applications.map(app => {
      return {
        application_id: app.application_id,
        scheme_name: app.scheme_name,
        scheme_category: app.scheme_category,
        status: app.status,
        application_date: app.application_date,
        eligibility_verified: app.eligibility_verified,
        benefit_amount: app.benefit_amount
      };
    });

    const response = {
      eligible: true,
      count: applications.length,
      applications: applicationDetails
    };
    console.log('📤 Response:', response);
    console.log('='.repeat(60));
    return res.json(response);
  } catch (err) {
    console.error('❌ Error checking eligibility:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getApplicationsByPhone = async (req, res) => {
  try {
    const applications = await Application.find({ phone: req.params.phone });
    return res.json(applications);
  } catch (err) {
    console.error('Error fetching applications by phone:', err);
    return res.status(500).json({ error: err.message });
  }
};

const createApplication = async (req, res) => {
  try {
    const application = new Application(req.body);
    await application.save();
    return res.status(201).json({ message: 'Application created successfully', application });
  } catch (err) {
    console.error('Error creating application:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ created_at: -1 });
    return res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getPendingApplications = async (req, res) => {
  try {
    const daysThreshold = parseInt(req.params.days) || 7;
    
    const applications = await Application.find({
      status: { $in: ['submitted', 'under_review', 'documents_pending'] }
    }).sort({ application_date: 1 });

    return res.json(applications);
  } catch (err) {
    console.error('Error fetching pending applications:', err);
    return res.status(500).json({ error: err.message });
  }
};

const updateApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    return res.json({ message: 'Application updated successfully', application });
  } catch (err) {
    console.error('Error updating application:', err);
    return res.status(500).json({ error: err.message });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    return res.json({ message: 'Application deleted successfully', application });
  } catch (err) {
    console.error('Error deleting application:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  checkEligibility,
  getApplicationsByPhone,
  createApplication,
  getAllApplications,
  getPendingApplications,
  updateApplication,
  deleteApplication,
};
