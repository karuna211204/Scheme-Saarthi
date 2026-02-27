/**
 * LiveKit Video Call Component for Scheme Saarthi
 * Integrates with the LiveKit agent for voice/video support
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  LiveKitRoom,
  AudioTrack,
  useParticipant,
  useTracks,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

// Configuration - Use environment variable for LiveKit server URL
const LIVEKIT_URL = process.env.REACT_APP_LIVEKIT_URL;

function VideoCallRoom({ token, roomName, onDisconnect }) {
  const [transcript, setTranscript] = useState([]);
  const [agentStatus, setAgentStatus] = useState('connecting');

  const tracks = useTracks([
    Track.Source.Microphone,
  ]);

  const addTranscriptLine = (role, message) => {
    setTranscript(prev => [...prev, { role, message, timestamp: new Date() }]);
  };

  return (
    <div className="video-call-container">

      {/* Agent Status Indicator */}
      <div className={`agent-status status-${agentStatus}`}>
        <div className="status-icon"></div>
        <span>Agent: {agentStatus}</span>
      </div>

      {/* Live Transcript */}
      <div className="transcript-panel">
        <h3>Live Conversation</h3>
        <div className="transcript-messages">
          {transcript.map((line, idx) => (
            <div key={idx} className={`transcript-line ${line.role}`}>
              <span className="role">{line.role}:</span>
              <span className="message">{line.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audio Renderer */}
      <RoomAudioRenderer />

      {/* Control Buttons */}
      <div className="controls">
        <button className="btn btn-danger" onClick={onDisconnect}>
          End Call
        </button>
      </div>
    </div>
  );
}

export default function VideoCall() {
  const [token, setToken] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateToken = async () => {
    setIsLoading(true);
    try {
      // Call backend to generate LiveKit token
      const params = new URLSearchParams({
        name: customerName || `Customer_${Date.now()}`,
        room: roomName || 'customer-support',
        email: '',
        phone: '',
        user_id: ''
      });
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/livekit/token?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status}`);
      }

      const tokenText = await response.text();
      setToken(tokenText);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to generate token:', error);
      alert('Failed to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setToken(null);
  };

  if (!isConnected) {
    return (
      <div className="call-setup">
        <div className="setup-card">
          <h2>📞 Scheme Saarthi - Citizen Support</h2>
          
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Support Session ID (Optional)</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Leave blank for new session"
              className="form-control"
            />
          </div>

          <button
            onClick={generateToken}
            disabled={!customerName || isLoading}
            className="btn btn-primary btn-lg"
          >
            {isLoading ? 'Connecting...' : 'Start Call with Agent'}
          </button>

          <div className="features">
            <p>✅ Voice Support</p>
            <p>✅ Audio Error Diagnosis</p>
            <p>✅ Instant Warranty Check</p>
            <p>✅ Appointment Booking</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={LIVEKIT_URL}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={handleDisconnect}
    >
      <VideoCallRoom
        token={token}
        roomName={roomName}
        onDisconnect={handleDisconnect}
      />
    </LiveKitRoom>
  );
}

// CSS (add to separate file or styled-components)
const styles = `
.video-call-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a1a;
  color: white;
}

.video-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.video-tile {
  position: relative;
  background: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
}

.participant-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.participant-name {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
  border-radius: 4px;
}

.agent-status {
  padding: 10px 20px;
  text-align: center;
  font-weight: bold;
}

.status-connecting { background: #ff9800; }
.status-listening { background: #2196F3; }
.status-thinking { background: #9c27b0; }
.status-speaking { background: #4caf50; }
.status-acting { background: #ff5722; }

.transcript-panel {
  height: 200px;
  overflow-y: auto;
  padding: 1rem;
  background: #2a2a2a;
  border-top: 2px solid #444;
}

.transcript-line {
  margin: 8px 0;
  padding: 8px;
  border-radius: 4px;
}

.transcript-line.customer { background: #1e3a5f; }
.transcript-line.agent { background: #2d4a2d; }

.controls {
  padding: 1rem;
  text-align: center;
  background: #2a2a2a;
}

.call-setup {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.setup-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  max-width: 500px;
  width: 90%;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.features {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.features p {
  margin: 8px 0;
  color: #666;
}
`;
