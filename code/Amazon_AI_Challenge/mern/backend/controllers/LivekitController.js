const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');

let roomService;
const activeSessions = new Map(); // Track active sessions for cleanup
const sessionTimeouts = new Map(); // Track session timeouts

const initializeRoomService = () => {
  if (!roomService) {
    roomService = new RoomServiceClient(
      process.env.LIVEKIT_URL,
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET
    );
  }
  return roomService;
};

// Session cleanup utilities
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const HEARTBEAT_INTERVAL = 60 * 1000; // 1 minute

const cleanupStaleRooms = async () => {
  try {
    const service = initializeRoomService();
    const rooms = await service.listRooms();
    
    for (const room of rooms) {
      // Check if room has been empty for more than 5 minutes
      if (room.num_participants === 0) {
        const roomAge = Date.now() - (room.creation_time * 1000);
        if (roomAge > 5 * 60 * 1000) { // 5 minutes
          console.log(`🧹 Cleaning up empty room: ${room.name}`);
          await service.deleteRoom(room.name);
          activeSessions.delete(room.name);
          if (sessionTimeouts.has(room.name)) {
            clearTimeout(sessionTimeouts.get(room.name));
            sessionTimeouts.delete(room.name);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up stale rooms:', error.message);
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupStaleRooms, 5 * 60 * 1000);

const scheduleSessionCleanup = (roomName) => {
  // Clear existing timeout if any
  if (sessionTimeouts.has(roomName)) {
    clearTimeout(sessionTimeouts.get(roomName));
  }
  
  // Schedule new cleanup
  const timeoutId = setTimeout(async () => {
    console.log(`⏰ Session timeout reached for room: ${roomName}`);
    try {
      const service = initializeRoomService();
      await service.deleteRoom(roomName);
      activeSessions.delete(roomName);
      sessionTimeouts.delete(roomName);
      console.log(`✅ Cleaned up timed-out session: ${roomName}`);
    } catch (error) {
      console.error(`Error cleaning up session ${roomName}:`, error.message);
    }
  }, SESSION_TIMEOUT);
  
  sessionTimeouts.set(roomName, timeoutId);
};

const generateToken = async (req, res) => {
  try {
    const name = req.query.name || 'customer';
    const email = req.query.email || '';
    const phone = req.query.phone || '';
    const user_id = req.query.user_id || '';
    const roomName = req.query.room || 'customer-support';
    
    console.log('🎟️ Generating token for:', { name, email, phone, user_id, room: roomName });
    
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      return res.status(500).json({ error: 'Server configuration error: Missing LiveKit credentials' });
    }
    
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { 
        identity: name, 
        metadata: JSON.stringify({ email, phone, user_id, created_at: new Date().toISOString() }),
        // Shorter token validity for better security - 2 hours
        ttl: '2h',
      }
    );

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
      // Allow participant to update metadata (for heartbeat)
      canUpdateOwnMetadata: true,
    });
    
    let token;
    try {
      token = await at.toJwt();
    } catch (e) {
      token = at.toJwt();
    }
    
    if (!token || typeof token !== 'string') {
      throw new Error(`Invalid token generated: ${token}`);
    }
    
    // Track the session and schedule cleanup
    const sessionInfo = {
      name,
      email,
      phone,
      user_id,
      roomName,
      created_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString()
    };
    
    activeSessions.set(roomName, sessionInfo);
    scheduleSessionCleanup(roomName);
    
    console.log('✅ Token generated successfully!');
    console.log('📊 Token Details:', {
      length: token.length,
      preview: token.substring(0, 60) + '...',
      room: roomName,
      identity: name,
      metadata: { email, phone, user_id },
      ttl: '2h'
    });
    
    res.json({
      token,
      room: roomName,
      identity: name,
      expires_in: 2 * 60 * 60, // 2 hours in seconds
      session_id: roomName
    });
  } catch (err) {
    console.error('Error generating token:', err);
    res.status(500).json({ error: 'Failed to generate token', details: err.message });
  }
};

const endCall = async (req, res) => {
  try {
    const { roomName, participant_identity } = req.body;
    
    if (!roomName) {
      return res.status(400).json({ error: 'Room name is required' });
    }
    
    console.log(`🛑 Ending call for room: ${roomName}`);
    const service = initializeRoomService();
    
    // If specific participant identity provided, remove only that participant
    if (participant_identity) {
      try {
        await service.removeParticipant(roomName, participant_identity);
        console.log(`✅ Removed participant: ${participant_identity}`);
      } catch (error) {
        console.log(`⚠️ Participant ${participant_identity} not found or already removed`);
      }
    }
    
    // Check if room still has participants
    let shouldDeleteRoom = false;
    try {
      const participants = await service.listParticipants(roomName);
      if (participants.length === 0 || !participant_identity) {
        shouldDeleteRoom = true;
      }
    } catch (error) {
      // Room might not exist, that's fine
      shouldDeleteRoom = true;
    }
    
    if (shouldDeleteRoom) {
      try {
        await service.deleteRoom(roomName);
        console.log(`✅ Room deleted: ${roomName}`);
      } catch (error) {
        console.log(`⚠️ Room ${roomName} already deleted or doesn't exist`);
      }
    }
    
    // Clean up session tracking
    activeSessions.delete(roomName);
    if (sessionTimeouts.has(roomName)) {
      clearTimeout(sessionTimeouts.get(roomName));
      sessionTimeouts.delete(roomName);
    }
    
    return res.json({ 
      success: true, 
      message: 'Call ended successfully',
      room_deleted: shouldDeleteRoom,
      participant_removed: !!participant_identity
    });
  } catch (err) {
    console.error('Error ending call:', err);
    res.status(500).json({ error: 'Failed to end call', details: err.message });
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
    const service = initializeRoomService();
    const rooms = await service.listRooms();
    
    // Enrich rooms with session info
    const enrichedRooms = rooms.map(room => {
      const sessionInfo = activeSessions.get(room.name);
      return {
        ...room,
        session_info: sessionInfo || null,
        is_active: !!sessionInfo,
        age_minutes: room.creation_time ? Math.round((Date.now() - (room.creation_time * 1000)) / 60000) : 0
      };
    });
    
    return res.json({ 
      success: true, 
      rooms: enrichedRooms,
      total_active_sessions: activeSessions.size,
      pending_timeouts: sessionTimeouts.size
    });
  } catch (err) {
    console.error('Error listing rooms:', err);
    res.status(500).json({ error: 'Failed to list rooms', details: err.message });
  }
};

const listParticipants = async (req, res) => {
  try {
    const { roomName } = req.params;
    
    if (!roomName) {
      return res.status(400).json({ error: 'Room name is required' });
    }
    
    const service = initializeRoomService();
    const participants = await service.listParticipants(roomName);
    
    // Enrich participants with connection status
    const enrichedParticipants = participants.map(p => {
      let metadata = {};
      try {
        metadata = p.metadata ? JSON.parse(p.metadata) : {};
      } catch (e) {
        // Ignore JSON parse errors
      }
      
      return {
        ...p,
        parsed_metadata: metadata,
        connection_age_minutes: p.joined_at ? Math.round((Date.now() - (p.joined_at * 1000)) / 60000) : 0,
        is_ai_agent: p.identity.includes('ai-agent') || p.identity.includes('AI'),
        is_sip: p.kind === 3
      };
    });
    
    return res.json({ 
      success: true, 
      participants: enrichedParticipants,
      room: roomName,
      count: participants.length
    });
  } catch (err) {
    console.error('Error listing participants:', err);
    
    // If room doesn't exist, return empty participants list
    if (err.message.includes('not_found') || err.message.includes('404')) {
      return res.json({ 
        success: true, 
        participants: [],
        room: roomName,
        count: 0,
        note: 'Room not found or empty'
      });
    }
    
    res.status(500).json({ error: 'Failed to list participants', details: err.message });
  }
};

// New endpoint for session heartbeat
const updateSessionHeartbeat = async (req, res) => {
  try {
    const { roomName } = req.body;
    
    if (!roomName) {
      return res.status(400).json({ error: 'Room name is required' });
    }
    
    const sessionInfo = activeSessions.get(roomName);
    if (sessionInfo) {
      sessionInfo.last_heartbeat = new Date().toISOString();
      activeSessions.set(roomName, sessionInfo);
      
      // Reset the timeout
      scheduleSessionCleanup(roomName);
      
      console.log(`💓 Heartbeat updated for room: ${roomName}`);
    }
    
    return res.json({ 
      success: true, 
      message: 'Heartbeat updated',
      last_heartbeat: sessionInfo?.last_heartbeat
    });
  } catch (err) {
    console.error('Error updating heartbeat:', err);
    res.status(500).json({ error: 'Failed to update heartbeat' });
  }
};

// New endpoint for cleaning up all stale sessions
const cleanupStaleSessions = async (req, res) => {
  try {
    console.log('🧹 Manual cleanup triggered');
    await cleanupStaleRooms();
    
    return res.json({ 
      success: true, 
      message: 'Stale session cleanup completed',
      active_sessions: activeSessions.size,
      pending_timeouts: sessionTimeouts.size
    });
  } catch (err) {
    console.error('Error in manual cleanup:', err);
    res.status(500).json({ error: 'Cleanup failed', details: err.message });
  }
};



module.exports = {
  generateToken,
  endCall,
  transferToHuman,
  listRooms,
  listParticipants,
  updateSessionHeartbeat,
  cleanupStaleSessions
};