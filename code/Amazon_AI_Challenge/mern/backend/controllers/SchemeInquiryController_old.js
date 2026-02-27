const mongoose = require('mongoose');
const SalesLead = mongoose.models.SalesLead || require('../models/SalesLead');
const { qualifyAndEnrichLead } = require('../services/leadQualification');

const createSalesLead = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('💼 CREATE SALES LEAD (with Qualification)');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));
    
    // Step 1: Qualify and enrich the lead automatically
    const qualificationResult = await qualifyAndEnrichLead(req.body);
    
    // Step 2: Create lead with qualification data
    const leadData = {
      ...req.body,
      ...qualificationResult
    };
    
    const lead = new SalesLead(leadData);
    await lead.save();
    
    console.log('✅ Sales lead created and qualified:', lead._id);
    console.log('   Customer:', lead.customer_name);
    console.log('   Product Interest:', lead.product_interest);
    console.log('   Lead Score:', lead.lead_score);
    console.log('   ICP Match:', lead.icp_match_score);
    console.log('   Status:', lead.qualification_status);
    
    return res.status(201).json({ 
      message: 'Sales lead created and qualified successfully', 
      lead,
      qualification: {
        lead_score: lead.lead_score,
        icp_match_score: lead.icp_match_score,
        qualification_status: lead.qualification_status
      }
    });
  } catch (err) {
    console.error('❌ Error creating sales lead:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getSalesLeads = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const leads = await SalesLead.find(filter).sort({ created_at: -1 });
    return res.json(leads);
  } catch (err) {
    console.error('Error fetching sales leads:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getSalesLeadsByPhone = async (req, res) => {
  try {
    const leads = await SalesLead.find({ phone: req.params.phone });
    return res.json(leads);
  } catch (err) {
    console.error('Error fetching sales leads by phone:', err);
    return res.status(500).json({ error: err.message });
  }
};

const updateSalesLead = async (req, res) => {
  try {
    const lead = await SalesLead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    return res.json(lead);
  } catch (err) {
    console.error('Error updating sales lead:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Get high-priority leads for outbound calling
const getHighPriorityLeads = async (req, res) => {
  try {
    const leads = await SalesLead.find({
      qualification_status: { $in: ['high_priority', 'qualified'] },
      status: { $in: ['open', 'contacted'] }
    })
    .sort({ lead_score: -1 })
    .limit(50);
    
    return res.json({ success: true, leads, count: leads.length });
  } catch (err) {
    console.error('Error fetching high-priority leads:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Update call outcome
const updateCallOutcome = async (req, res) => {
  try {
    const { outcome, notes } = req.body;
    
    const lead = await SalesLead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    // Update call details
    lead.call_outcome = outcome;
    lead.last_call_date = new Date();
    lead.call_count = (lead.call_count || 0) + 1;
    if (notes) lead.notes = notes;
    
    // Update status based on outcome
    if (outcome === 'interested') {
      lead.status = 'qualified';
      lead.qualification_status = 'qualified';
    } else if (outcome === 'not_interested') {
      lead.status = 'closed';
      lead.qualification_status = 'disqualified';
    } else if (outcome === 'answered') {
      lead.status = 'contacted';
    }
    
    await lead.save();
    
    return res.json({ success: true, lead, message: 'Call outcome updated' });
  } catch (err) {
    console.error('Error updating call outcome:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Get leads statistics
const getLeadsStats = async (req, res) => {
  try {
    const total = await SalesLead.countDocuments();
    const qualified = await SalesLead.countDocuments({ qualification_status: { $in: ['qualified', 'high_priority'] } });
    const highPriority = await SalesLead.countDocuments({ qualification_status: 'high_priority' });
    const open = await SalesLead.countDocuments({ status: 'open' });
    const contacted = await SalesLead.countDocuments({ status: 'contacted' });
    const converted = await SalesLead.countDocuments({ status: 'converted' });
    
    const avgLeadScore = await SalesLead.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$lead_score' } } }
    ]);
    
    const avgICPScore = await SalesLead.aggregate([
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
        avgLeadScore: Math.round(avgLeadScore[0]?.avgScore || 0),
        avgICPScore: Math.round(avgICPScore[0]?.avgScore || 0),
        conversionRate: total > 0 ? ((converted / total) * 100).toFixed(2) : 0
      }
    });
  } catch (err) {
    console.error('Error fetching leads stats:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Re-qualify a lead
const requalifyLead = async (req, res) => {
  try {
    const lead = await SalesLead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    const qualificationResult = await qualifyAndEnrichLead(lead.toObject());
    Object.assign(lead, qualificationResult);
    await lead.save();
    
    console.log(`✅ Re-qualified lead ${lead._id}: Score=${lead.lead_score}, ICP=${lead.icp_match_score}`);
    
    return res.json({ success: true, lead, message: 'Lead re-qualified successfully' });
  } catch (err) {
    console.error('Error requalifying lead:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Delete a sales lead
const deleteSalesLead = async (req, res) => {
  try {
    const lead = await SalesLead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    return res.json({ success: true, message: 'Sales lead deleted successfully', lead });
  } catch (err) {
    console.error('Error deleting sales lead:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSalesLead,
  getSalesLeads,
  getSalesLeadsByPhone,
  updateSalesLead,
  deleteSalesLead,
  getHighPriorityLeads,
  updateCallOutcome,
  getLeadsStats,
  requalifyLead
};
