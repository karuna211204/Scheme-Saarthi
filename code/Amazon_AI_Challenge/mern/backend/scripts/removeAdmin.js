/**
 * Script to remove admin privileges from a user
 * Usage: node scripts/removeAdmin.js <email>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const removeAdmin = async (email) => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log(`🔍 Looking for user: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }

    if (user.role !== 'admin') {
      console.log('ℹ️  User is not an admin (current role: ' + user.role + ')');
      process.exit(0);
    }

    user.role = 'customer';
    await user.save();

    console.log('✅ Admin privileges removed!\n');
    console.log('User Details:');
    console.log('  Name:', user.name);
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Phone:', user.phone || '(not set)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('\nUsage:');
  console.log('  node scripts/removeAdmin.js <email>');
  console.log('\nExample:');
  console.log('  node scripts/removeAdmin.js user@example.com');
  process.exit(1);
}

removeAdmin(email);
