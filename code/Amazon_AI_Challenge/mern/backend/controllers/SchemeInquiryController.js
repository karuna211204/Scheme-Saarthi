const mongoose = require('mongoose');
const SchemeInquiry = mongoose.models.SchemeInquiry || require('../models/SalesLead');

const createSchemeInquiry = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('📋 CREATE SCHEME INQUIRY');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));
    
    const inquiry = new SchemeInquiry(req.body);
    await inquiry.save();
    
    console.log('✅ Scheme inquiry created:', inquiry._id);
    console.log('   Citizen:', inquiry.customer_name);
    console.log('   Interested Schemes:', inquiry.product_interest);
    console.log('   Eligibility Score:', inquiry.lead_score);
    console.log('   Status:', inquiry.qualification_status);
    
    return res.status(201).json({ 
      message: 'Scheme inquiry created successfully', 
      inquiry,
      eligibility_info: {
        eligibility_score: inquiry.lead_score,
        icp_match_score: inquiry.icp_match_score,
        qualification_status: inquiry.qualification_status
      }
    });
  } catch (err) {
    console.error('❌ Error creating scheme inquiry:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getSchemeInquiries = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const inquiries = await SchemeInquiry.find(filter).sort({ created_at: -1 });
    return res.json(inquiries);
  } catch (err) {
    console.error('Error fetching scheme inquiries:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getSchemeInquiriesByPhone = async (req, res) => {
  try {
    const inquiries = await SchemeInquiry.find({ phone: req.params.phone });
    return res.json(inquiries);
  } catch (err) {
    console.error('Error fetching scheme inquiries by phone:', err);
    return res.status(500).json({ error: err.message });
  }
};

const updateSchemeInquiry = async (req, res) => {
  try {
    const inquiry = await SchemeInquiry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    return res.json(inquiry);
  } catch (err) {
    console.error('Error updating scheme inquiry:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Get high-priority inquiries for outbound follow-up
const getHighPriorityInquiries = async (req, res) => {
  try {
    const inquiries = await SchemeInquiry.find({
      qualification_status: { $in: ['high_priority', 'qualified'] },
      status: { $in: ['open', 'contacted'] }
    })
    .sort({ lead_score: -1 })
    .limit(50);
    
    return res.json({ success: true, inquiries, count: inquiries.length });
  } catch (err) {
    console.error('Error fetching high-priority inquiries:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Update follow-up outcome
const updateFollowUpOutcome = async (req, res) => {
  try {
    const { outcome, notes } = req.body;
    
    const inquiry = await SchemeInquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    
    // Update follow-up details
    inquiry.call_outcome = outcome;
    inquiry.last_call_date = new Date();
    inquiry.call_count = (inquiry.call_count || 0) + 1;
    if (notes) inquiry.notes = notes;
    
    // Update status based on outcome
    if (outcome === 'interested') {
      inquiry.status = 'qualified';
      inquiry.qualification_status = 'qualified';
    } else if (outcome === 'not_interested') {
      inquiry.status = 'closed';
      inquiry.qualification_status = 'disqualified';
    } else if (outcome === 'answered') {
      inquiry.status = 'contacted';
    } else if (outcome === 'application_started') {
      inquiry.status = 'converted';
      inquiry.qualification_status = 'qualified';
    }
    
    await inquiry.save();
    
    return res.json({ success: true, inquiry, message: 'Follow-up outcome updated' });
  } catch (err) {
    console.error('Error updating follow-up outcome:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Get inquiries statistics
const getInquiriesStats = async (req, res) => {
  try {
    const total = await SchemeInquiry.countDocuments();
    const qualified = await SchemeInquiry.countDocuments({ qualification_status: { $in: ['qualified', 'high_priority'] } });
    const highPriority = await SchemeInquiry.countDocuments({ qualification_status: 'high_priority' });
    const open = await SchemeInquiry.countDocuments({ status: 'open' });
    const contacted = await SchemeInquiry.countDocuments({ status: 'contacted' });
    const converted = await SchemeInquiry.countDocuments({ status: 'converted' });
    
    const avgEligibilityScore = await SchemeInquiry.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$lead_score' } } }
    ]);
    
    const avgICPScore = await SchemeInquiry.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$icp_match_score' } } }
    ]);
    
    return res.json({
      success: true,
      stats: {
        total,
        qualified,
        highPriority,
        open,
        contacted,
        converted,
        avgEligibilityScore: Math.round(avgEligibilityScore[0]?.avgScore || 0),
        avgICPScore: Math.round(avgICPScore[0]?.avgScore || 0),
        conversionRate: total > 0 ? ((converted / total) * 100).toFixed(2) : 0
      }
    });
  } catch (err) {
    console.error('Error fetching inquiries stats:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Delete a scheme inquiry
const deleteSchemeInquiry = async (req, res) => {
  try {
    const inquiry = await SchemeInquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    return res.json({ success: true, message: 'Scheme inquiry deleted successfully', inquiry });
  } catch (err) {
    console.error('Error deleting scheme inquiry:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSchemeInquiry,
  getSchemeInquiries,
  getSchemeInquiriesByPhone,
  updateSchemeInquiry,
  deleteSchemeInquiry,
  getHighPriorityInquiries,
  updateFollowUpOutcome,
  getInquiriesStats
};
