const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');

let roomService;

const initializeRoomService = () => {
  if (!roomService) {
    roomService=new RoomServiceClient(
      process.env.LIVEKIT_URL,
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET
    );
  }
  return roomService;
};

const generateToken = async (req, res) => {
  try {
    const name=req.query.name || 'customer';
    const email=req.query.email || '';
    const phone=req.query.phone || '';
    const user_id=req.query.user_id || '';
    const roomName=req.query.room || 'customer-support';
    
    console.log('🎟️ Generating token for:', { name, email, phone, user_id });
    
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      return res.status(500).json({ error: 'Server configuration error: Missing LiveKit credentials' });
    }
    
    const at=new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { 
        identity: name, 
        metadata: JSON.stringify({ email, phone, user_id }),
        // Token valid for 24 hours
        ttl: '24h',
      }
    );

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });
    
    let token;
    try {
      token=await at.toJwt();
    } catch (e) {
      token=at.toJwt();
    }
    
    if (!token || typeof token!=='string') {
      throw new Error(`Invalid token generated: ${token}`);
    }
    
    console.log('✅ Token generated successfully!');
    console.log('📊 Token Details:', {
      length: token.length,
      preview: token.substring(0, 60) + '...',
      room: roomName,
      identity: name,
      metadata: { email, phone, user_id }
    });
    console.log('🎟️  Full Token:', token);
    console.log('='*60);
    
    res.send(token);
  } catch (err) {
    console.error('Error generating token:', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

const endCall = async (req, res) => {
  try {
    const { roomName } = req.body;
    
    if (!roomName) {
      return res.status(400).json({ error: 'Room name is required' });
    }
    
    const service=initializeRoomService();
    await service.deleteRoom(roomName);
    
    return res.json({ success: true, message: 'Call ended successfully' });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ error: 'Failed to end call' });
  }
};

const transferToHuman = async (req, res) => {
  try {
    const { roomName, patientIdentity, agentIdentity } = req.body;
    
    if (!roomName || !patientIdentity) {
      return res.status(400).json({ error: 'Room name and patient identity required' });
    }
    
    const aiIdentity=agentIdentity || 'tavus-avatar-agent';
    const service=initializeRoomService();
    await service.removeParticipant(roomName, aiIdentity);
    
    return res.json({ 
      success: true, 
      message: 'Transferred to human agent',
      roomName,
      note: 'Human agent can now join the room'
    });
  } catch (err) {
    console.error('Error transferring to human:', err);
    res.status(500).json({ error: 'Failed to transfer to human agent' });
  }
};

const listRooms = async (req, res) => {
  try {
    const service=initializeRoomService();
    const rooms=await service.listRooms();
    return res.json({ success: true, rooms });
  } catch (err) {
    console.error('Error listing rooms:', err);
    res.status(500).json({ error: 'Failed to list rooms' });
  }
};



const listParticipants = async (req, res) => {
  try {
    const { roomName } = req.params;
    
    if (!roomName) {
      return res.status(400).json({ error: 'Room name is required' });
    }
    
    const service=initializeRoomService();
    const participants=await service.listParticipants(roomName);
    
    return res.json({ success: true, participants });
  } catch (err) {
    console.error('Error listing participants:', err);
    res.status(500).json({ error: 'Failed to list participants' });
  }
};



module.exports = {
  generateToken,
  endCall,
  transferToHuman,
  listRooms,
  listParticipants
};