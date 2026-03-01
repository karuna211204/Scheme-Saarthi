const User=require('../models/User');

const updatePhoneByUserId=async (req, res) => {
  try {
    console.log('='.repeat(60));
    console.log('📞 UPDATE PHONE BY USER ID');
    console.log('Request Body:', req.body);
    console.log('='.repeat(60));

    const { user_id, phone, name }=req.body;
    
    if (!user_id || !phone) {
      return res.status(400).json({ error: 'user_id and phone are required' });
    }

    const user=await User.findByIdAndUpdate(
      user_id,
      { phone, updated_at: new Date() },
      { new: true }
    );

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Phone updated:', phone);
    console.log('='.repeat(60));

    return res.json({
      status: 'success',
      message: 'Phone number updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('❌ Error updating phone:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports={ updatePhoneByUserId };
