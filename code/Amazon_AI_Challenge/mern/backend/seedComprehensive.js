const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Appointment = require('./models/Appointment');
const Warranty = require('./models/Warranty');
const Transcript = require('./models/Transcript');
const SalesLead = require('./models/SalesLead');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/guntur-electronics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Helper functions
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Data arrays
const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vijay', 'Lakshmi', 'Suresh', 'Divya', 'Ramesh', 'Kavitha',
  'Anil', 'Meera', 'Krishna', 'Shalini', 'Prakash', 'Anita', 'Mahesh', 'Deepa', 'Venkat', 'Swathi',
  'Ravi', 'Sailaja', 'Kumar', 'Madhavi', 'Srinivas', 'Jyothi', 'Ganesh', 'Revathi', 'Naresh', 'Padma',
  'Mohan', 'Uma', 'Kiran', 'Rani', 'Sanjay', 'Nisha', 'Prasad', 'Latha', 'Ashok', 'Sandhya',
  'Dinesh', 'Pooja', 'Harish', 'Rekha', 'Naveen', 'Suma', 'Raghav', 'Anusha', 'Varun', 'Shilpa'];

const lastNames = ['Kumar', 'Reddy', 'Sharma', 'Rao', 'Patel', 'Gupta', 'Singh', 'Nair', 'Iyer', 'Choudhary',
  'Verma', 'Prasad', 'Naidu', 'Joshi', 'Desai', 'Mishra', 'Menon', 'Pillai', 'Agarwal', 'Malhotra'];

const companies = ['Tech Solutions Pvt Ltd', 'Green Energy Co', 'Fast Logistics', 'Prime Traders', 'Metro Hotels',
  'Smart Systems', 'Alpha Industries', 'Beta Corp', 'Gamma Enterprises', 'Delta Services',
  'City Retail Chain', 'Food & Beverage Co', 'Construction Works', 'Medical Supplies Inc', 'Auto Parts Ltd',
  null, null, null]; // More nulls for individual customers

const appliances = [
  { name: 'Samsung 192L Refrigerator', category: 'Refrigerator', price: 18500 },
  { name: 'LG 6.5Kg Washing Machine', category: 'Washing Machine', price: 15200 },
  { name: 'Whirlpool 1.5 Ton AC', category: 'Air Conditioner', price: 32000 },
  { name: 'Sony 43" Smart TV', category: 'Television', price: 35000 },
  { name: 'IFB 20L Microwave', category: 'Microwave', price: 8500 },
  { name: 'Philips Air Purifier', category: 'Air Purifier', price: 12000 },
  { name: 'Panasonic Water Purifier', category: 'Water Purifier', price: 9500 },
  { name: 'Godrej 260L Double Door Fridge', category: 'Refrigerator', price: 28000 },
  { name: 'Bosch 7Kg Front Load Washer', category: 'Washing Machine', price: 28500 },
  { name: 'Daikin 2 Ton Split AC', category: 'Air Conditioner', price: 45000 },
  { name: 'LG 55" OLED TV', category: 'Television', price: 85000 },
  { name: 'Samsung 28L Convection Microwave', category: 'Microwave', price: 15000 },
  { name: 'Haier 320L Triple Door Fridge', category: 'Refrigerator', price: 35000 },
  { name: 'Whirlpool 8Kg Top Load Washer', category: 'Washing Machine', price: 18000 },
  { name: 'Voltas 1 Ton Window AC', category: 'Air Conditioner', price: 24000 }
];

const storeLocations = ['Guntur Main Branch', 'Vijayawada Outlet', 'Tenali Store', 'Narasaraopet Branch'];

const issueDescriptions = [
  'Refrigerator not cooling properly',
  'Washing machine making loud noise during spin cycle',
  'AC not cooling, suspected gas leak',
  'TV display flickering intermittently',
  'Microwave turntable not rotating',
  'Strange smell from refrigerator',
  'Water leaking from washing machine',
  'AC remote not working',
  'TV no sound issue',
  'Refrigerator ice buildup problem',
  'Washing machine door won\'t open',
  'AC compressor making noise',
  'TV won\'t turn on',
  'Microwave buttons not responsive',
  'Refrigerator light not working'
];

const transcriptTemplates = [
  'Customer called regarding {issue}. Checked warranty status. Appointment scheduled for {date}.',
  'Inquiry about {product}. Discussed features and pricing. Customer interested in purchase.',
  'Complaint about {issue}. Troubleshooting steps provided. Issue resolved over call.',
  'Warranty claim for {product}. Invoice verified. Technician visit arranged.',
  'Follow-up call for previous appointment. Service completed successfully. Customer satisfied.',
  'New customer inquiry about {product}. Provided specifications and availability details.',
  'AMC renewal discussion for {product}. Explained benefits and pricing. Customer agreed.',
  'Emergency repair request for {issue}. Same-day appointment arranged.',
  'Product installation query for {product}. Discussed charges and timeline.',
  'Feedback call after service. Customer happy with technician work quality.'
];

const campaignTypes = ['Festival Diwali Offer', 'Summer AC Sale', 'Monsoon Appliance Care', 'New Year Electronics Fest',
  'Independence Day Special', 'Annual Clearance Sale', 'Warranty Expiry Reminder', 'AMC Renewal Campaign'];

// Generate data functions
async function generateCustomers(count) {
  console.log(`\n📦 Generating ${count} customers...`);
  const customers = [];

  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const phone = `9${getRandomInt(100000000, 999999999)}`;

    // Some edge cases
    const hasEmail = Math.random() > 0.1; // 10% no email
    const hasAddress = Math.random() > 0.05; // 5% no address

    customers.push({
      phone,
      name: `${firstName} ${lastName}`,
      email: hasEmail ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'])}` : undefined,
      address: hasAddress ? `${getRandomInt(1, 500)}-${getRandomInt(1, 100)}, ${getRandomElement(['MG Road', 'Gandhi Nagar', 'Amaravathi Road', 'Brodipet', 'Arundalpet', 'Naaz', 'Kothapet'])}, Guntur` : undefined,
      preferences: {
        language: getRandomElement(['telugu', 'english', 'hindi']),
        contact_method: getRandomElement(['phone', 'email', 'sms'])
      }
    });
  }

  await Customer.insertMany(customers);
  console.log(`✅ Created ${customers.length} customers`);
  return customers;
}

async function generateWarranties(customers, count) {
  console.log(`\n📦 Generating ${count} warranties...`);
  const warranties = [];
  const now = new Date('2025-12-14');

  for (let i = 0; i < count; i++) {
    const customer = getRandomElement(customers);
    const appliance = getRandomElement(appliances);

    // Various purchase dates - some recent, some old, some very old
    let purchaseDate;
    if (i % 3 === 0) {
      // Recent purchase (last 3 months)
      purchaseDate = getRandomDate(new Date('2025-09-01'), now);
    } else if (i % 3 === 1) {
      // Medium age (6-12 months)
      purchaseDate = getRandomDate(new Date('2024-12-01'), new Date('2025-06-01'));
    } else {
      // Old purchase (1-2 years)
      purchaseDate = getRandomDate(new Date('2023-12-01'), new Date('2024-12-01'));
    }

    const warrantyMonths = getRandomInt(12, 24);
    const warrantyExpiry = new Date(purchaseDate);
    warrantyExpiry.setMonth(warrantyExpiry.getMonth() + warrantyMonths);

    const hasAMC = Math.random() > 0.6; // 40% have AMC
    let amcExpiry = null;
    if (hasAMC) {
      amcExpiry = new Date(warrantyExpiry);
      amcExpiry.setFullYear(amcExpiry.getFullYear() + 1);
    }

    warranties.push({
      phone: customer.phone,
      invoice_id: `INV${String(i + 1).padStart(6, '0')}`,
      customer_name: customer.name,
      product_name: appliance.name,
      product_category: appliance.category,
      purchase_date: purchaseDate,
      warranty_period_months: warrantyMonths,
      warranty_expiry: warrantyExpiry,
      store_location: getRandomElement(storeLocations),
      amc_enrolled: hasAMC,
      amc_expiry: amcExpiry
    });
  }

  await Warranty.insertMany(warranties);
  console.log(`✅ Created ${warranties.length} warranties`);
  return warranties;
}

async function generateAppointments(customers, count) {
  console.log(`\n📦 Generating ${count} appointments...`);
  const appointments = [];
  const now = new Date('2025-12-14');

  for (let i = 0; i < count; i++) {
    const customer = getRandomElement(customers);
    const appliance = getRandomElement(appliances);
    const issue = getRandomElement(issueDescriptions);

    let appointmentDate, status;

    // Mix of past, today, and future appointments
    if (i % 4 === 0) {
      // Past appointments (last 30 days)
      appointmentDate = getRandomDate(new Date('2025-11-14'), new Date('2025-12-13'));
      status = getRandomElement(['completed', 'completed', 'completed', 'cancelled']);
    } else if (i % 4 === 1) {
      // Today
      appointmentDate = now;
      status = 'scheduled';
    } else if (i % 4 === 2) {
      // Next 7 days
      appointmentDate = getRandomDate(now, new Date('2025-12-21'));
      status = getRandomElement(['scheduled', 'confirmed']);
    } else {
      // Next 30 days
      appointmentDate = getRandomDate(new Date('2025-12-21'), new Date('2026-01-14'));
      status = 'scheduled';
    }

    const dateStr = appointmentDate.toISOString().split('T')[0];
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

    appointments.push({
      customer_id: `session_${customer.phone}_${Date.now()}_${i}`,
      phone: customer.phone,
      customer_name: customer.name,
      email: customer.email,
      appointment_date: dateStr,
      appointment_time: getRandomElement(timeSlots),
      appointment_type: getRandomElement(['service', 'installation', 'consultation']),
      product_name: appliance.name,
      issue_description: issue,
      address: customer.address || `${getRandomInt(1, 500)}, Guntur`,
      status,
      visit_charge: getRandomInt(200, 500),
      notes: status === 'completed' ? 'Service completed successfully' : ''
    });
  }

  await Appointment.insertMany(appointments);
  console.log(`✅ Created ${appointments.length} appointments`);
  return appointments;
}

async function generateTranscripts(customers, count) {
  console.log(`\n📦 Generating ${count} transcripts...`);
  const transcripts = [];

  for (let i = 0; i < count; i++) {
    const customer = getRandomElement(customers);
    const template = getRandomElement(transcriptTemplates);
    const appliance = getRandomElement(appliances);
    const issue = getRandomElement(issueDescriptions);

    const transcript = template
      .replace('{product}', appliance.name)
      .replace('{issue}', issue)
      .replace('{date}', getRandomDate(new Date('2025-12-15'), new Date('2025-12-25')).toLocaleDateString());

    // Add some longer transcripts for edge cases
    let fullTranscript = transcript;
    if (i % 10 === 0) {
      fullTranscript += '\n\nAdditional details discussed:\n';
      fullTranscript += '- Warranty coverage confirmed\n';
      fullTranscript += '- Customer satisfaction survey completed\n';
      fullTranscript += '- Follow-up scheduled if needed\n';
      fullTranscript += '- Payment method: ' + getRandomElement(['Cash', 'Card', 'UPI', 'Online']);
    }

    const createdDate = getRandomDate(new Date('2025-11-01'), new Date('2025-12-14'));

    transcripts.push({
      customer_id: `session_${customer.phone}_${createdDate.getTime()}`,
      transcript: fullTranscript,
      phone: customer.phone,
      customer_name: customer.name,
      created_at: createdDate,
      updated_at: createdDate
    });
  }

  await Transcript.insertMany(transcripts);
  console.log(`✅ Created ${transcripts.length} transcripts`);
  return transcripts;
}

async function generateSalesLeads(customers, warranties, count) {
  console.log(`\n📦 Generating ${count} sales leads...`);
  const leads = [];
  const now = new Date('2025-12-14');

  for (let i = 0; i < count; i++) {
    const customer = getRandomElement(customers);
    const appliance = getRandomElement(appliances);

    // Lead types distribution
    let leadType, source, leadScore, qualificationStatus, icpMatchScore;

    if (i % 5 === 0) {
      // High-quality leads - warranty expiring
      leadType = 'warranty_expiring';
      source = 'outbound_call';
      leadScore = getRandomInt(70, 95);
      qualificationStatus = getRandomElement(['qualified', 'high_priority']);
      icpMatchScore = getRandomInt(75, 95);
    } else if (i % 5 === 1) {
      // Medium quality - AMC renewal
      leadType = 'amc_renewal';
      source = 'phone';
      leadScore = getRandomInt(50, 75);
      qualificationStatus = 'qualified';
      icpMatchScore = getRandomInt(60, 80);
    } else if (i % 5 === 2) {
      // Inbound inquiries
      leadType = 'inbound_inquiry';
      source = getRandomElement(['website', 'phone']);
      leadScore = getRandomInt(40, 70);
      qualificationStatus = getRandomElement(['unqualified', 'qualified']);
      icpMatchScore = getRandomInt(50, 70);
    } else if (i % 5 === 3) {
      // Festival offers
      leadType = 'festival_offer';
      source = 'outbound_call';
      leadScore = getRandomInt(30, 60);
      qualificationStatus = 'unqualified';
      icpMatchScore = getRandomInt(40, 65);
    } else {
      // New purchase interest
      leadType = 'new_purchase';
      source = getRandomElement(['referral', 'website', 'manual']);
      leadScore = getRandomInt(20, 80);
      qualificationStatus = getRandomElement(['unqualified', 'qualified', 'disqualified']);
      icpMatchScore = getRandomInt(30, 75);
    }

    // Engagement history based on existing data
    const customerWarranties = warranties.filter(w => w.phone === customer.phone);
    const pastPurchases = customerWarranties.length;
    const totalSpent = customerWarranties.reduce((sum, w) => {
      const product = appliances.find(a => a.name === w.product_name);
      return sum + (product ? product.price : 0);
    }, 0);

    const engagementScore = Math.min(100, pastPurchases * 15 + (totalSpent / 1000));

    // Company data for some leads
    const hasCompany = Math.random() > 0.7; // 30% B2B leads
    const company = hasCompany ? getRandomElement(companies.filter(c => c !== null)) : null;

    const enrichmentData = hasCompany ? {
      company_size: getRandomElement(['small', 'medium', 'large', 'enterprise']),
      industry: getRandomElement(['Technology', 'Retail', 'Hospitality', 'Manufacturing', 'Healthcare', 'Education']),
      location: 'Guntur',
      annual_revenue_range: getRandomElement(['< 1Cr', '1-5Cr', '5-10Cr', '10-50Cr', '> 50Cr']),
      enriched_at: getRandomDate(new Date('2025-12-01'), now)
    } : {};

    // Call history
    const callCount = getRandomInt(0, 5);
    const lastCallDate = callCount > 0 ? getRandomDate(new Date('2025-11-15'), now) : null;
    const callOutcome = callCount > 0 ? getRandomElement(['answered', 'no_answer', 'busy', 'interested', 'not_interested']) : null;

    // Status based on lead quality and calls
    let status;
    if (qualificationStatus === 'high_priority') {
      status = getRandomElement(['contacted', 'calling', 'qualified']);
    } else if (qualificationStatus === 'qualified') {
      status = getRandomElement(['open', 'contacted', 'qualified']);
    } else if (qualificationStatus === 'disqualified') {
      status = 'closed';
    } else {
      status = getRandomElement(['open', 'contacted']);
    }

    leads.push({
      phone: customer.phone,
      customer_name: customer.name,
      email: customer.email,
      company,
      lead_type: leadType,
      source,
      product_interest: appliance.name,
      budget_range: `₹${appliance.price - 2000} - ₹${appliance.price + 5000}`,
      lead_score: leadScore,
      qualification_status: qualificationStatus,
      icp_match_score: icpMatchScore,
      enrichment_data: hasCompany ? enrichmentData : undefined,
      engagement_score: Math.round(engagementScore),
      past_purchases_count: pastPurchases,
      total_spent: totalSpent,
      last_interaction_date: lastCallDate || getRandomDate(new Date('2025-11-01'), now),
      campaign_type: getRandomElement(campaignTypes),
      campaign_context: {
        offer: `${getRandomInt(10, 30)}% off on ${appliance.category}`,
        valid_till: '2025-12-31'
      },
      status,
      follow_up_date: status === 'open' || status === 'contacted' ? getRandomDate(new Date('2025-12-15'), new Date('2025-12-30')) : null,
      notes: leadScore > 70 ? 'High-value customer. Priority follow-up required.' : '',
      last_call_date: lastCallDate,
      call_count: callCount,
      call_outcome: callOutcome,
      assigned_to: getRandomElement(['Ravi Kumar', 'Sneha Patel', 'Amit Singh', null])
    });
  }

  await SalesLead.insertMany(leads);
  console.log(`✅ Created ${leads.length} sales leads`);
  return leads;
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('\n🌱 Starting comprehensive database seeding...\n');
    console.log('⚠️  This will DELETE all existing data!\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Customer.deleteMany({});
    await Appointment.deleteMany({});
    await Warranty.deleteMany({});
    await Transcript.deleteMany({});
    await SalesLead.deleteMany({});
    console.log('✅ All collections cleared\n');

    // Generate data
    const customers = await generateCustomers(60);
    const warranties = await generateWarranties(customers, 40);
    const appointments = await generateAppointments(customers, 120);
    const transcripts = await generateTranscripts(customers, 80);
    const leads = await generateSalesLeads(customers, warranties, 50);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ DATABASE SEEDING COMPLETED!');
    console.log('='.repeat(50));
    console.log(`\n📊 Summary:`);
    console.log(`   • Customers: ${customers.length}`);
    console.log(`   • Appointments: ${appointments.length}`);
    console.log(`   • Warranties: ${warranties.length}`);
    console.log(`   • Transcripts: ${transcripts.length}`);
    console.log(`   • Sales Leads: ${leads.length}`);
    console.log(`   • TOTAL RECORDS: ${customers.length + appointments.length + warranties.length + transcripts.length + leads.length}`);

    console.log('\n🎯 Edge Cases Covered:');
    console.log('   ✓ Customers with missing emails');
    console.log('   ✓ Customers with missing addresses');
    console.log('   ✓ Multiple transcripts per customer');
    console.log('   ✓ Past, current, and future appointments');
    console.log('   ✓ Completed, scheduled, and cancelled appointments');
    console.log('   ✓ Active, expired, and near-expiry warranties');
    console.log('   ✓ Warranties with and without AMC');
    console.log('   ✓ High, medium, and low-quality sales leads');
    console.log('   ✓ B2B and B2C leads');
    console.log('   ✓ Various lead qualification statuses');
    console.log('   ✓ Leads with different engagement histories');
    console.log('   ✓ Leads with call history');

    console.log('\n🚀 Ready to test all features!\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run seeding
seedDatabase();
