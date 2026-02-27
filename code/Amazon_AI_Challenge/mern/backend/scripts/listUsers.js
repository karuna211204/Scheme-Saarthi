/**
 * Script to list all users and their roles
 * Usage: node scripts/listUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../Models/User');

const listUsers = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).sort({ created_at: -1 });

    if (users.length === 0) {
      console.log('ℹ️  No users found in database');
      process.exit(0);
    }

    console.log(`📋 Total Users: ${users.length}\n`);
    console.log('=' .repeat(100));
    
    const admins = users.filter(u => u.role === 'admin');
    const customers = users.filter(u => u.role === 'customer');

    if (admins.length > 0) {
      console.log(`\n👑 ADMINS (${admins.length})\n`);
      admins.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone || '(not set)'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Last Login: ${user.last_login || 'Never'}`);
        console.log('');
      });
    }

    if (customers.length > 0) {
      console.log(`\n👤 CUSTOMERS (${customers.length})\n`);
      customers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone || '(not set)'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Last Login: ${user.last_login || 'Never'}`);
        console.log('');
      });
    }

    console.log('=' .repeat(100));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listUsers();
