const express = require('express');
const router = express.Router();
const {
  generateToken,
  endCall,
  transferToHuman,
  listRooms,
  listParticipants,
  updateSessionHeartbeat,
  cleanupStaleSessions
} = require('../controllers/LivekitController');

router.get('/token', generateToken);
router.post('/end-call', endCall);
router.post('/transfer-to-human', transferToHuman);
router.get('/rooms', listRooms);
router.get('/participants/:roomName', listParticipants);
router.post('/heartbeat', updateSessionHeartbeat);
router.post('/cleanup', cleanupStaleSessions);

module.exports = router;
