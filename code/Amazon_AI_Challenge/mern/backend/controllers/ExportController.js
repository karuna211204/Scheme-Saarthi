const Citizen = require('../models/Citizen');
const Consultation = require('../models/Consultation');
const Application = require('../models/Application');
const SchemeInquiry = require('../models/SchemeInquiry');
const Transcript = require('../models/Transcript');

// Helper function to convert JSON to CSV
const jsonToCSV = (data, fields) => {
  if (!data || data.length === 0) return '';
  
  const headers = fields.join(',');
  const rows = data.map(item => {
    return fields.map(field => {
      const value = item[field] || '';
      // Escape commas and quotes
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',');
  });
  
  return [headers, ...rows].join('\n');
};

// Export citizens
const exportCustomers = async (req, res) => {
  try {
    const citizens = await Citizen.find().sort({ created_at: -1 }).lean();
    
    const fields = ['name', 'email', 'phone', 'address', 'date_created', 'status'];
    const csv = jsonToCSV(citizens, fields);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=customers_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Error exporting customers:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Export consultations
const exportAppointments = async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ created_at: -1 }).lean();
    
    const fields = ['customer_name', 'phone', 'email', 'appointment_date', 'appointment_time', 
                   'product_name', 'issue_description', 'status', 'assigned_agent', 'created_at'];
    const csv = jsonToCSV(consultations, fields);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=appointments_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Error exporting appointments:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Export applications
const exportWarranties = async (req, res) => {
  try {
    const applications = await Application.find().sort({ created_at: -1 }).lean();
    
    const fields = ['phone', 'product_name', 'product_category', 'serial_number', 'invoice_id',
                   'purchase_date', 'warranty_expiry', 'amc_enrolled', 'amc_expiry'];
    const csv = jsonToCSV(warranties, fields);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=warranties_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Error exporting warranties:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Export scheme inquiries
const exportSalesLeads = async (req, res) => {
  try {
    const inquiries = await SchemeInquiry.find().sort({ created_at: -1 }).lean();
    
    const fields = ['customer_name', 'email', 'phone', 'product_interest', 'source', 
                   'status', 'lead_score', 'icp_match_score', 'qualification_status', 'created_at'];
    const csv = jsonToCSV(inquiries, fields);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=sales_leads_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Error exporting sales leads:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Export transcripts
const exportTranscripts = async (req, res) => {
  try {
    const transcripts = await Transcript.find().sort({ timestamp: -1 }).lean();
    
    const fields = ['customer_name', 'phone', 'agent_type', 'agent_name', 'issue_summary',
                   'status', 'sentiment_score', 'timestamp'];
    const csv = jsonToCSV(transcripts, fields);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transcripts_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Error exporting transcripts:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  exportCustomers,
  exportAppointments,
  exportWarranties,
  exportSalesLeads,
  exportTranscripts,
};
