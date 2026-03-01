const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('🔐 GOOGLE AUTH');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));

    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: google_id, email, name, picture } = payload;

    console.log('✅ Google token verified');
    console.log('Email:', email);
    console.log('Name:', name);

    // Find or create user
    let user = await User.findOne({ google_id });

    if (!user) {
      user = new User({
        google_id,
        email,
        name,
        picture,
        role: 'customer',
        last_login: new Date()
      });
      await user.save();
      console.log('➕ New user created:', user._id);
    } else {
      user.last_login = new Date();
      await user.save();
      console.log('👤 Existing user logged in:', user._id);
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🎟️  JWT generated');
    console.log('='.repeat(60));

    return res.json({
      status: 'success',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (err) {
    console.error('❌ Google auth error:', err);
    return res.status(401).json({ error: 'Invalid Google token', details: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
      last_login: user.last_login
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { phone, updated_at: new Date() },
      { new: true }
    );

    return res.json({
      status: 'success',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { googleAuth, getProfile, updateProfile };
