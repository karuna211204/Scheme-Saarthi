/**
 * Script to make a user an admin
 * Usage: node scripts/makeAdmin.js <email>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const makeAdmin = async (email) => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log(`🔍 Looking for user: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found with email:', email);
      console.log('\n💡 Make sure the user has logged in at least once via Google Auth');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log('ℹ️  User is already an admin!');
      console.log('\nUser Details:');
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  Created:', user.created_at);
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();

    console.log('✅ Successfully promoted to admin!\n');
    console.log('User Details:');
    console.log('  Name:', user.name);
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Phone:', user.phone || '(not set)');
    console.log('  Created:', user.created_at);
    console.log('  Last Login:', user.last_login);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('\nUsage:');
  console.log('  node scripts/makeAdmin.js <email>');
  console.log('\nExample:');
  console.log('  node scripts/makeAdmin.js user@example.com');
  process.exit(1);
}

makeAdmin(email);
 