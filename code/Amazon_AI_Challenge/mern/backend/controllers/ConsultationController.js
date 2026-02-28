const ConsultationRequest = require('../models/Consultation');
const nodemailer = require('nodemailer');

let transporterCache = null;
let transporterCreatedAt = null;
const TRANSPORTER_MAX_AGE = 5 * 60 * 1000;

function getTransporter(forceNew = false) {
  const now = Date.now();
  if (forceNew || !transporterCache || (transporterCreatedAt && (now - transporterCreatedAt) > TRANSPORTER_MAX_AGE)) {
    transporterCache = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 75000,
      pool: false,
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
        ciphers: 'HIGH:MEDIUM:!aNULL:!eNULL:@STRENGTH:!DH:!kEDH'
      },
      debug: process.env.NODE_ENV !== 'production',
      logger: process.env.NODE_ENV !== 'production'
    });
    transporterCreatedAt = now;
  }
  return transporterCache;
}

function parseDateTime(dateStr, timeStr) {
  const iso = `${dateStr}T${timeStr}:00`;
  return new Date(iso);
}

const createConsultation = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('📥 CREATE CONSULTATION REQUEST');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));

    const consultation = new ConsultationRequest(req.body);
    await consultation.save();

    console.log('✅ Consultation Created:', consultation._id);
    const response = { message: 'Consultation request created successfully', consultation };
    console.log('📤 Response:', response);
    console.log('='.repeat(60));
    return res.status(201).json(response);
  } catch (err) {
    console.error('❌ Error creating appointment:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getConsultations = async (req, res) => {
  try {
    const { status, phone } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (phone) filter.phone = phone;
    const consultations = await ConsultationRequest.find(filter).sort({ created_at: -1 });
    return res.json(consultations);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getConsultationById = async (req, res) => {
  try {
    const consultation = await ConsultationRequest.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    return res.json(consultation);
  } catch (err) {
    console.error('Error fetching consultation:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getConsultationsByPhone = async (req, res) => {
  try {
    const consultations = await ConsultationRequest.find({ phone: req.params.phone });
    return res.json(consultations);
  } catch (err) {
    console.error('Error fetching consultations by phone:', err);
    return res.status(500).json({ error: err.message });
  }
};

const updateConsultation = async (req, res) => {
  try {
    const consultation = await ConsultationRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    return res.json(consultation);
  } catch (err) {
    console.error('Error updating consultation:', err);
    return res.status(500).json({ error: err.message });
  }
};

const saveTranscript = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('💾 SAVE TRANSCRIPT');
    console.log('Appointment ID:', req.params.id);
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));

    const { transcript } = req.body;

    if (!transcript) {
      console.error('❌ No transcript provided');
      return res.status(400).json({ error: 'Transcript is required' });
    }

    console.log(`📝 Transcript length: ${transcript.length} chars`);
    console.log(`📝 Preview: ${transcript.substring(0, 200)}...`);

    const consultation = await ConsultationRequest.findByIdAndUpdate(
      req.params.id,
      { transcript },
      { new: true }
    );

    if (!consultation) {
      console.error('❌ Consultation not found:', req.params.id);
      return res.status(404).json({ message: 'Consultation not found' });
    }

    console.log('✅ Transcript saved to consultation:', consultation._id);
    console.log('='.repeat(60));
    return res.json(consultation);
  } catch (err) {
    console.error('❌ Error saving transcript:', err);
    return res.status(500).json({ error: err.message });
  }
};

const saveTranscriptByCustomerId = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('💾 SAVE TRANSCRIPT BY CUSTOMER ID');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));

    const { customer_id, transcript } = req.body;

    if (!customer_id || !transcript) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ error: 'customer_id and transcript are required' });
    }

    console.log(`🆔 Customer ID: ${customer_id}`);
    console.log(`📝 Transcript length: ${transcript.length} chars`);
    console.log(`📝 Preview: ${transcript.substring(0, 200)}...`);

    // Find consultation by customer_id and update, or create new one
    const consultation = await ConsultationRequest.findOneAndUpdate(
      { customer_id },
      {
        customer_id,
        transcript,
        updated_at: new Date()
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('✅ Transcript saved with customer_id:', customer_id);
    console.log('📋 Consultation ID:', consultation._id);
    console.log('='.repeat(60));
    return res.json(consultation);
  } catch (err) {
    console.error('❌ Error saving transcript by customer_id:', err);
    return res.status(500).json({ error: err.message });
  }
};

const checkAvailability = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('📅 CHECK AVAILABILITY');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));

    const { date_str, time_str, window_minutes = 60 } = req.body;

    if (!date_str || !time_str) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ available: false, error: 'date_str and time_str required' });
    }

    const target = parseDateTime(date_str, time_str);
    console.log('🎯 Target Date/Time:', target);

    const appointments = await ConsultationRequest.find({
      appointment_date: { $exists: true, $ne: '' },
      appointment_time: { $exists: true, $ne: '' }
    }).lean();

    console.log(`📊 Found ${appointments.length} existing consultations`);

    const apptDates = [];
    const conflicts = [];

    for (const a of appointments) {
      try {
        const apptDate = parseDateTime(a.appointment_date, a.appointment_time);
        apptDates.push(apptDate);
        const diff = Math.abs(apptDate.getTime() - target.getTime());
        if (diff <= 15 * 60 * 1000) {
          conflicts.push({ date: a.appointment_date, time: a.appointment_time, patient: a.customer_name });
        }
      } catch (e) {
        console.error('Parse error for appointment:', e);
        continue;
      }
    }

    console.log(`⚠️ Found ${conflicts.length} conflicts`);

    if (conflicts.length > 0) {
      const windowMs = window_minutes * 60 * 1000;
      const left = new Date(target.getTime() - windowMs);
      const right = new Date(target.getTime() + windowMs);
      const suggestions = [];
      const stepMs = 15 * 60 * 1000;
      for (let t = left.getTime(); t <= right.getTime(); t += stepMs) {
        if (t === target.getTime()) continue;
        const busy = apptDates.some(ad => Math.abs(ad.getTime() - t) <= 15 * 60 * 1000);
        if (!busy) {
          const d = new Date(t);
          const iso = d.toISOString().slice(0, 16).replace('T', ' ');
          suggestions.push(iso);
        }
        if (suggestions.length >= 6) break;
      }

      console.log(`💡 Suggested ${suggestions.length} alternative slots`);
      const response = { available: false, conflicts, suggested_slots: suggestions, message: `Slot ${date_str} ${time_str} is not available.` };
      console.log('📤 Response:', response);
      console.log('='.repeat(60));
      return res.json(response);
    }

    console.log('✅ Slot is available!');
    const response = { available: true, conflicts: [], suggested_slots: [], message: `Slot ${date_str} ${time_str} is available!` };
    console.log('📤 Response:', response);
    console.log('='.repeat(60));
    return res.json(response);
  } catch (err) {
    console.error('❌ Error checking availability:', err);
    return res.status(500).json({ available: false, error: err.message });
  }
};

const bookConsultation = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('📝 BOOK CONSULTATION');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));

    // Extract fields matching MCP tool payload exactly
    const { 
      customer_name, 
      phone, 
      email, 
      appointment_date, 
      appointment_time, 
      customer_id = '', 
      notes = '' 
    } = req.body;

    // Validate required fields per MCP tool specification
    if (!customer_name || !phone || !email || !appointment_date || !appointment_time) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        status: 'error', 
        error: 'Missing required fields: customer_name, phone, email, appointment_date, appointment_time' 
      });
    }

    // Use customer_id if provided, otherwise use phone as fallback
    const effectiveCustomerId = customer_id || phone.replace(/\D/g, '');
    console.log(`🆔 Citizen ID: ${effectiveCustomerId}${!customer_id ? ' (derived from phone)' : ''}`);

    // Check if consultation exists for this customer_id
    let appt = await ConsultationRequest.findOne({ customer_id: effectiveCustomerId });

    if (appt) {
      console.log('🔄 Updating existing consultation:', appt._id);
      appt.customer_name = customer_name;
      appt.phone = phone;
      appt.email = email;
      appt.appointment_date = appointment_date;
      appt.appointment_time = appointment_time;
      appt.notes = notes;
      appt.last_updated = new Date();
      await appt.save();
    } else {
      console.log('➕ Creating new consultation');
      appt = new ConsultationRequest({
        customer_id: effectiveCustomerId,
        customer_name,
        phone,
        email,
        appointment_date,
        appointment_time,
        notes,
        last_updated: new Date()
      });
      await appt.save();
    }

    console.log('✅ Consultation Booked:', appt._id);
    
    // Return response matching MCP tool expected format
    const response = { 
      status: 'success', 
      customer_id: effectiveCustomerId, 
      customer_name, 
      appointment_date, 
      appointment_time,
      appointment_id: appt._id,
      message: `Consultation booked for ${customer_name} on ${appointment_date} at ${appointment_time}` 
    };
    
    console.log('📤 Response:', response);
    console.log('='.repeat(60));
    return res.json(response);
  } catch (err) {
    console.error('❌ Error booking consultation:', err);
    return res.status(500).json({ status: 'error', error: err.message });
  }
};

const sendEmail = async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ status: 'error', error: 'to, subject, and body are required' });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return res.status(500).json({ status: 'error', error: 'Gmail credentials not configured' });
    }

    const mailOptions = {
      from: `"Scheme Saarthi" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>')
    };

    let lastError = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const shouldForceNew = attempt > 1;
        const transporter = getTransporter(shouldForceNew);

        if (attempt === 1) {
          try {
            await Promise.race([
              transporter.verify(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Verification timeout')), 5000))
            ]);
          } catch (verifyErr) {
            console.warn('Verification failed, proceeding anyway:', verifyErr.message);
          }
        }

        const sendTimeout = 60000;
        const info = await Promise.race([
          transporter.sendMail(mailOptions),
          new Promise((_, reject) => setTimeout(() => reject(new Error(`Send timeout after ${sendTimeout / 1000}s`)), sendTimeout))
        ]);

        return res.json({
          status: 'sent',
          to,
          subject,
          message_id: info.messageId,
          attempt: attempt,
          accepted: info.accepted
        });

      } catch (sendErr) {
        lastError = sendErr;
        console.error('Email attempt failed:', sendErr.message);

        if (attempt < maxRetries) {
          const delay = attempt * 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return res.status(500).json({
      status: 'error',
      error: `Failed after ${maxRetries} attempts: ${lastError.message}`,
      code: lastError.code,
      details: 'Check server logs for troubleshooting tips'
    });

  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({ status: 'error', error: err.message });
  }
};

const deleteConsultation = async (req, res) => {
  try {
    const consultation = await ConsultationRequest.findByIdAndDelete(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    return res.json({ message: 'Consultation deleted successfully', consultation });
  } catch (err) {
    console.error('Error deleting consultation:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createConsultation,
  getConsultations,
  getConsultationById,
  getConsultationsByPhone,
  updateConsultation,
  deleteConsultation,
  checkAvailability,
  bookConsultation,
  sendEmail,
  saveTranscript,
  saveTranscriptByCustomerId
};