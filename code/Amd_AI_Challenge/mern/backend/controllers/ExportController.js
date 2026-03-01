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
const exportCitizens = async (req, res) => {
  try {
    const citizens = await Citizen.find().sort({ created_at: -1 }).lean();
    
    const fields = ['name', 'email', 'phone', 'age', 'occupation', 'annual_income', 'state', 'district', 'created_at', 'status'];
    const csv = jsonToCSV(citizens, fields);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=citizens_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Error exporting citizens:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Export consultations
const exportConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ created_at: -1 }).lean();
    
    const fields = ['citizen_name', 'phone', 'email', 'appointment_date', 'appointment_time', 
                   'scheme_name', 'inquiry_description', 'status', 'assigned_agent', 'created_at'];
    const csv = jsonToCSV(consultations, fields);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=consultations_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Error exporting consultations:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Export applications
const exportApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ created_at: -1 }).lean();
    
    const fields = ['application_id', 'phone', 'citizen_name', 'scheme_name', 'scheme_category', 
                   'status', 'benefit_amount', 'reference_number', 'submission_date', 'created_at'];
    const csv = jsonToCSV(applications, fields);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=applications_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Error exporting applications:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Export scheme inquiries
const exportSchemeInquiries = async (req, res) => {
  try {
    const inquiries = await SchemeInquiry.find().sort({ created_at: -1 }).lean();
    
    const fields = ['citizen_name', 'email', 'phone', 'scheme_id', 'scheme_category', 
                   'status', 'inquiry_type', 'notes', 'created_at'];
    const csv = jsonToCSV(inquiries, fields);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=scheme_inquiries_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Error exporting scheme inquiries:', err);
    return res.status(500).json({ error: err.message });
  }
};

// Export transcripts
const exportTranscripts = async (req, res) => {
  try {
    const transcripts = await Transcript.find().sort({ created_at: -1 }).lean();
    
    const fields = ['citizen_name', 'phone', 'citizen_id', 'transcript', 'created_at'];
    const csv = jsonToCSV(transcripts, fields);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transcripts_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Error exporting transcripts:', err);
    return res.status(500).json({ error: err.message});
  }
};

module.exports = {
  exportCitizens,
  exportConsultations,
  exportApplications,
  exportSchemeInquiries,
  exportTranscripts,
};
