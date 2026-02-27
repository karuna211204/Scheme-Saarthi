const express=require('express');
const router=express.Router();
const { googleAuth, getProfile, updateProfile }=require('../controllers/AuthController');
const { authenticate }=require('../middleware/auth');
const User=require('../models/User');

router.post('/google', googleAuth);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Make existing user admin by email (legacy endpoint)
router.post('/make-admin/:email', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { role: 'admin' },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user, message: 'User promoted to admin successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to make admin', error: error.message });
  }
});

// Create new admin user (POST /api/auth/create-admin)
router.post('/create-admin', async (req, res) => {
  try {
    const { email, name, google_id, phone } = req.body;
    
    // Validation
    if (!email || !name || !google_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, name, and google_id are required' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { google_id }] });
    if (existingUser) {
      // If user exists, just update role to admin
      existingUser.role = 'admin';
      existingUser.name = name;
      if (phone) existingUser.phone = phone;
      await existingUser.save();
      
      return res.json({ 
        success: true, 
        user: existingUser, 
        message: 'Existing user updated to admin role' 
      });
    }
    
    // Create new admin user
    const newAdmin = new User({
      google_id,
      email,
      name,
      phone: phone || null,
      role: 'admin',
      last_login: new Date()
    });
    
    await newAdmin.save();
    
    res.status(201).json({ 
      success: true, 
      user: newAdmin, 
      message: 'Admin user created successfully' 
    });
    
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create admin user', 
      error: error.message 
    });
  }
});

// Get all admins (GET /api/auth/admins)
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-google_id');
    res.json({ success: true, admins, count: admins.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admins', error: error.message });
  }
});

// Remove admin role (POST /api/auth/remove-admin/:email)
router.post('/remove-admin/:email', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { role: 'customer' },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user, message: 'Admin role removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove admin', error: error.message });
  }
});

module.exports=router;
