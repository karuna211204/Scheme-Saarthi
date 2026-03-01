/**
 * ⚠️ DEPRECATED SCRIPT - DO NOT USE ⚠️
 * This script is from the old device warranty system and is not compatible 
 * with the current SchemeSaarthi government schemes platform.
 * 
 * Use seedGovernmentSchemes.js and seedGovernmentDocuments.js instead.
 * 
 * Script to seed sample data for specific users
 * Usage: node scripts/seedUserData.js
 */

console.error('⚠️  ERROR: This script is deprecated and should not be used.');
console.error('Please use the following scripts instead:');
console.error('  - node seedGovernmentSchemes.js');
console.error('  - node seedGovernmentDocuments.js');
console.error('  - node seedSchemeSaarthiData.js');
process.exit(1);

/* DEPRECATED CODE BELOW - KEPT FOR REFERENCE ONLY

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Consultation = require('../models/Consultation');
const Application = require('../models/Application');
const Transcript = require('../models/Transcript');

const TARGET_EMAILS = ['abhiram050904@gmail.com', 'abhi3.02638@gmail.com', 'karunasreegorrepati@gmail.com'];

const PHONE_MAPPING = {
  'abhiram050904@gmail.com': '8074355155',
  'abhi3.02638@gmail.com': '9154995426',
  'karunasreegorrepati@gmail.com': '8978015426'
};

const seedUserData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // First, clear ALL existing sample data
    console.log('🗑️  Clearing all previous sample data...');
    await Warranty.deleteMany({});
    await Appointment.deleteMany({});
    await Transcript.deleteMany({});
    console.log('✅ Cleared all previous data\n');

    for (const email of TARGET_EMAILS) {
      console.log(`\n📧 Processing user: ${email}`);
      
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        console.log('   Please ensure user has logged in at least once');
        continue;
      }

      console.log(`✅ Found user: ${user.name}`);
      
      // Update phone number from mapping
      const phone = PHONE_MAPPING[email];
      user.phone = phone;
      await user.save();
      console.log(`   📱 Updated phone: ${phone}`);

      // Create sample warranties (devices) - at least 1 laptop, 1 TV, 1 phone per user
      const warranties = [
        // Laptop
        {
          phone: phone,
          invoice_id: `INV${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
          customer_name: user.name,
          product_name: 'Dell XPS 15 Laptop',
          product_category: 'laptop',
          purchase_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
          warranty_period_months: 24,
          warranty_expiry: new Date(Date.now() + 545 * 24 * 60 * 60 * 1000), // 1.5 years from now
          store_location: 'TechCare Store - Downtown',
          amc_enrolled: false
        },
        // Smartphone
        {
          phone: phone,
          invoice_id: `INV${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
          customer_name: user.name,
          product_name: 'iPhone 14 Pro',
          product_category: 'smartphone',
          purchase_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
          warranty_period_months: 12,
          warranty_expiry: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000), // 9 months from now
          store_location: 'TechCare Store - Mall',
          amc_enrolled: true,
          amc_expiry: new Date(Date.now() + 640 * 24 * 60 * 60 * 1000) // AMC for another year
        },
        // Television
        {
          phone: phone,
          invoice_id: `INV${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
          customer_name: user.name,
          product_name: 'Samsung 55" 4K Smart TV',
          product_category: 'television',
          purchase_date: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
          warranty_period_months: 12,
          warranty_expiry: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // Expired 35 days ago
          store_location: 'TechCare Store - Central',
          amc_enrolled: false
        },
        // Additional Laptop
        {
          phone: phone,
          invoice_id: `INV${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
          customer_name: user.name,
          product_name: 'MacBook Air M2',
          product_category: 'laptop',
          purchase_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
          warranty_period_months: 12,
          warranty_expiry: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000), // 10 months from now
          store_location: 'TechCare Store - Downtown',
          amc_enrolled: true,
          amc_expiry: new Date(Date.now() + 670 * 24 * 60 * 60 * 1000)
        },
        // Additional Phone
        {
          phone: phone,
          invoice_id: `INV${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
          customer_name: user.name,
          product_name: 'Samsung Galaxy S23 Ultra',
          product_category: 'smartphone',
          purchase_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 4 months ago
          warranty_period_months: 12,
          warranty_expiry: new Date(Date.now() + 245 * 24 * 60 * 60 * 1000), // 8 months from now
          store_location: 'TechCare Store - Mall',
          amc_enrolled: false
        },
        // Additional TV
        {
          phone: phone,
          invoice_id: `INV${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
          customer_name: user.name,
          product_name: 'LG 65" OLED TV',
          product_category: 'television',
          purchase_date: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), // ~6.5 months ago
          warranty_period_months: 24,
          warranty_expiry: new Date(Date.now() + 530 * 24 * 60 * 60 * 1000), // ~1.5 years from now
          store_location: 'TechCare Store - Central',
          amc_enrolled: true,
          amc_expiry: new Date(Date.now() + 895 * 24 * 60 * 60 * 1000)
        }
      ];

      // Insert warranties
      const createdWarranties = await Warranty.insertMany(warranties);
      console.log(`   ✅ Created ${createdWarranties.length} warranties/devices`);

      // Create sample appointments
      const appointments = [
        {
          customer_id: user._id.toString(),
          customer_name: user.name,
          phone: phone,
          email: user.email,
          appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          appointment_time: '10:00',
          appointment_type: 'service',
          product_name: 'Dell XPS 15 Laptop',
          issue_description: 'Laptop screen flickering issue',
          address: 'TechCare Service Center - Downtown',
          status: 'scheduled',
          notes: 'Customer reports intermittent screen flickering. May need display replacement.'
        },
        {
          customer_id: user._id.toString(),
          customer_name: user.name,
          phone: phone,
          email: user.email,
          appointment_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days ago
          appointment_time: '14:30',
          appointment_type: 'service',
          product_name: 'iPhone 14 Pro',
          issue_description: 'Phone battery replacement',
          address: 'TechCare Service Center - Mall',
          status: 'completed',
          notes: 'Battery replaced successfully. Device tested and working normally.'
        },
        {
          customer_id: user._id.toString(),
          customer_name: user.name,
          phone: phone,
          email: user.email,
          appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
          appointment_time: '15:00',
          appointment_type: 'consultation',
          product_name: 'Samsung 55" Smart TV',
          issue_description: 'TV remote not responding',
          address: 'On-site Visit',
          status: 'confirmed',
          visit_charge: 50,
          notes: 'Technician dispatched for on-site diagnosis.'
        }
      ];

      const createdAppointments = await Appointment.insertMany(appointments);
      console.log(`   ✅ Created ${createdAppointments.length} appointments`);

      // Create sample transcripts
      const transcripts = [
        {
          customer_id: user._id.toString(),
          customer_name: user.name,
          customer_email: user.email,
          customer_phone: phone,
          call_start: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          call_end: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000),
          duration: 480,
          call_type: 'support',
          transcript: `Agent: Thank you for contacting TechCare support. How can I help you today?

Customer: Hi, I'm having issues with my laptop screen. It keeps flickering randomly.

Agent: I understand that must be frustrating. Can you tell me when this started happening?

Customer: About a week ago. At first it was occasional, but now it's happening more frequently.

Agent: I see. Let me help you troubleshoot this. First, have you tried updating your display drivers?

Customer: No, I haven't. How do I do that?

Agent: I'll guide you through it... [troubleshooting steps provided]

Customer: I tried that but it's still flickering.

Agent: Alright, it sounds like this might be a hardware issue. I'd recommend bringing it in for a diagnostic. Let me schedule an appointment for you.

Customer: That would be great, thank you!

Agent: Perfect! I've scheduled you for next week. Please backup your important data before bringing it in.`,
          summary: 'Customer reported laptop screen flickering. Troubleshooting steps provided. Appointment scheduled for in-person repair.',
          action_items: [
            'Schedule repair appointment',
            'Backup important data before bringing device',
            'Bring purchase receipt for warranty verification'
          ]
        },
        {
          customer_id: user._id.toString(),
          customer_name: user.name,
          customer_email: user.email,
          customer_phone: phone,
          call_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          call_end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
          duration: 300,
          call_type: 'technical',
          transcript: `Agent: Hello! This is TechCare support. How may I assist you?

Customer: My phone battery drains really quickly. Is this normal?

Agent: Battery drain can have several causes. How old is your phone?

Customer: About 6 months old.

Agent: Let me help you optimize your battery. First, let's check your battery health in settings...

Customer: It shows 92% maximum capacity.

Agent: That's actually quite good for 6 months. Let me suggest some optimization tips...

[Tips provided]

Customer: Okay, I'll try these. If it doesn't help, what should I do?

Agent: If you don't see improvement in a week, we can schedule a battery replacement. It's covered under your warranty.`,
          summary: 'Customer inquired about phone battery life. Provided tips to optimize battery performance and recommended battery replacement if issue persists.',
          action_items: [
            'Monitor battery performance for 1 week',
            'Disable background app refresh for unused apps',
            'Consider battery replacement if no improvement'
          ]
        }
      ];

      const createdTranscripts = await Transcript.insertMany(transcripts);
      console.log(`   ✅ Created ${createdTranscripts.length} support transcripts`);

      console.log(`\n🎉 Successfully seeded data for ${user.name} (${user.email})`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ DATA SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log('\nYou can now:');
    console.log('1. Login with either email');
    console.log('2. Navigate to "My Devices" to see registered devices');
    console.log('3. Navigate to "Track Repair" to see appointments');
    console.log('4. Navigate to "Support History" to see call transcripts');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedUserData();
