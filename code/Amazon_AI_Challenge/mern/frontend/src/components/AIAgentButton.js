import React, { useState, useCallback, useEffect } from 'react';
import { FiMessageCircle, FiX, FiPhoneOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useVoiceAssistant,
    BarVisualizer,
    VoiceAssistantControlBar,
    VideoTrack,
    useRemoteParticipants,
    useDataChannel
} from '@livekit/components-react';
import '@livekit/components-styles';
import VoiceActionIndicator from './VoiceActionIndicator';

// Voice Assistant Component inside LiveKit Room
const VoiceAgent = ({ onClose, onVoiceAction }) => {
    const { state, audioTrack } = useVoiceAssistant();
    const remoteParticipants = useRemoteParticipants();
    const [hasVideo, setHasVideo] = useState(false);

    // Listen for data messages from AI agent
    useDataChannel('voice-commands', (message) => {
        try {
            const command = JSON.parse(message.payload);
            console.log('📨 Received voice command:', command);
            
            // Show action indicator
            const actionMessages = {
                'general': 'Processing your request...',
                'greeting': 'Responding to greeting',
                'info': 'Providing information'
            };
            
            onVoiceAction({
                type: 'info',
                message: actionMessages[command.action] || 'Processing command'
            });
        } catch (error) {
            console.error('❌ Error parsing voice command:', error);
        }
    });

    useEffect(() => {
        console.log('🎙️  [LIVEKIT] Voice Assistant state changed:', state);
    }, [state]);

    useEffect(() => {
        if (audioTrack) {
            console.log('🔊 [LIVEKIT] Audio track available:', audioTrack);
        }
    }, [audioTrack]);

    useEffect(() => {
        // Check if any remote participant has video (Tavus avatar)
        const videoAvailable = remoteParticipants.some(participant => {
            const videoTrack = Array.from(participant.videoTrackPublications.values())
                .find(pub => pub.track);
            return videoTrack !== undefined;
        });

        if (videoAvailable !== hasVideo) {
            console.log('📹 [LIVEKIT] Video availability changed:', videoAvailable);
            setHasVideo(videoAvailable);
        }
    }, [remoteParticipants, hasVideo]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-t-2xl">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <FiMessageCircle size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold">Guntur Electronics</h3>
                            <p className="text-xs text-green-100 capitalize">{state || 'Connecting...'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 p-2 rounded-lg transition"
                    >
                        <FiX size={20} />
                    </button>
                </div>
            </div>

            {/* Video or Audio Visualizer */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-blue-50/30 to-white p-4">
                {hasVideo && remoteParticipants.length > 0 ? (
                    // Show video from Tavus avatar
                    <div className="w-full h-full flex flex-col">
                        <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative">
                            {remoteParticipants.map((participant) => {
                                const videoTrackPub = Array.from(participant.videoTrackPublications.values())
                                    .find(pub => pub.track);

                                if (videoTrackPub?.track) {
                                    return (
                                        <VideoTrack
                                            key={participant.identity}
                                            trackRef={{
                                                participant: participant,
                                                source: videoTrackPub.source,
                                                publication: videoTrackPub
                                            }}
                                            className="w-full h-full object-cover"
                                        />
                                    );
                                }
                                return null;
                            })}
                            {/* Audio visualizer overlay on video */}
                            {audioTrack && (
                                <div className="absolute bottom-3 left-3 right-3">
                                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                                        <BarVisualizer
                                            state={state}
                                            barCount={8}
                                            trackRef={audioTrack}
                                            className="h-10"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">AI Avatar powered by Tavus</p>
                    </div>
                ) : (
                    // Show audio-only UI
                    <div className="text-center space-y-6">
                        <div className="w-32 h-32 mx-auto">
                            <BarVisualizer
                                state={state}
                                barCount={5}
                                trackRef={audioTrack}
                                className="flex items-center justify-center h-full gap-2"
                            >
                                <span className="bg-green-600 rounded-full transition-all duration-200" style={{ width: '12px', minHeight: '12px' }} />
                            </BarVisualizer>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Namaste! 🙏</p>
                            <p className="text-xs text-gray-500 mt-1">Start speaking to fix appliances, book appointments, or check warranty</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Control Bar */}
            <div className="p-4 border-t border-blue-100 bg-white rounded-b-2xl space-y-3">
                <VoiceAssistantControlBar />
                <button
                    onClick={onClose}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm font-semibold"
                >
                    <FiPhoneOff size={18} />
                    End Call
                </button>
            </div>
        </div>
    );
};

const AIAgentButton = () => {
    const { user }=useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [showActionIndicator, setShowActionIndicator] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds
    const [timerActive, setTimerActive] = useState(false);

    const handleVoiceAction = (action) => {
        setCurrentAction(action);
        setShowActionIndicator(true);
    };

    // Timer effect
    useEffect(() => {
        let interval;
        if (timerActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        handleClose();
                        alert('Your 3-minute session has ended. Please reconnect if you need more assistance.');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeRemaining]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getToken = useCallback(async () => {
        console.log('\n🔵 ========================================');
        console.log('🔵 [FRONTEND] FETCHING LIVEKIT TOKEN');
        console.log('🔵 ========================================');
        console.log('📡 Backend URL:', process.env.REACT_APP_BACKEND_URL);
        console.log('🌐 LiveKit URL:', process.env.REACT_APP_LIVEKIT_URL);
        console.log('👤 User Data:', {
            name: user?.name,
            email: user?.email,
            phone: user?.phone || '(empty)',
            id: user?.id
        });

        try {
            setIsConnecting(true);
            const params=new URLSearchParams({
                name: user?.name || 'customer',
                email: user?.email || '',
                phone: user?.phone || '',
                user_id: user?.id || ''
            });
            const url = `${process.env.REACT_APP_BACKEND_URL}/api/livekit/token?${params.toString()}`;
            console.log('🔗 Fetching from:', url);

            const response = await fetch(url);

            console.log('📥 Response status:', response.status);
            console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                throw new Error(`Failed to fetch token: ${response.status}`);
            }

            const tokenText = await response.text();
            console.log('🎟️  Token received successfully!');
            console.log('🎟️  Token length:', tokenText.length, 'characters');
            console.log('🎟️  Token preview:', tokenText.substring(0, 50) + '...');
            console.log('🎟️  Token type:', typeof tokenText);

            if (!tokenText || tokenText.length < 10) {
                throw new Error('Invalid token received from server');
            }

            setToken(tokenText);
            setIsConnecting(false);
            console.log('✅ [FRONTEND] Token set successfully');
            console.log('✅ [FRONTEND] Ready to connect to LiveKit room');
            console.log('🔵 ========================================\n');
        } catch (error) {
            console.error('❌ ========================================');
            console.error('❌ [FRONTEND] ERROR CONNECTING TO AI');
            console.error('❌ ========================================');
            console.error('❌ Error:', error);
            console.error('❌ ========================================\n');
            alert('Failed to connect to AI Assistant. Please try again.');
            setIsConnecting(false);
        }
    }, [user]);

    const handleConnect = () => {
        console.log('\n🟢 [FRONTEND] AI Assistant button clicked');
        console.log('🎟️  Current token:', token ? 'Exists' : 'Not yet fetched');
        setIsOpen(true);
        if (!token) {
            console.log('📞 [FRONTEND] No token found, fetching new token...');
            getToken();
        } else {
            console.log('♻️  [FRONTEND] Reusing existing token');
        }
    };

    const handleClose = () => {
        console.log('\n🔴 [FRONTEND] Closing AI Assistant connection');
        setIsOpen(false);
        setIsConnecting(false);
        setToken(null);
        console.log('✅ [FRONTEND] Connection closed and token cleared\n');
    };

    return (
        <>
            {/* Floating AI Voice Assistant Button */}
            {!isOpen && (
                <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Talk to AI Customer Support"
                >
                    {isConnecting ? (
                        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <FiMessageCircle size={28} />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                AI
                            </span>
                        </>
                    )}
                </button>
            )}

            {/* LiveKit Voice Assistant Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-blue-100">
                    {isConnecting ? (
                        <div className="flex flex-col items-center justify-center h-full p-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
                            <h2 className="text-xl font-semibold text-gray-700">Connecting to Customer Support...</h2>
                            <p className="text-sm text-gray-500 mt-2">Please wait...</p>
                            <button
                                onClick={handleClose}
                                className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <LiveKitRoom
                                serverUrl={process.env.REACT_APP_LIVEKIT_URL}
                                token={token}
                                connect={true}
                                audio={true}
                                video={false}  // ❌ Disable user camera (audio only, but can receive avatar video)
                                // Audio optimization settings for lowest latency
                                options={{
                                    // Audio capture options optimized for speed
                                    audioCaptureDefaults: {
                                        echoCancellation: true,
                                        noiseSuppression: true,
                                        autoGainControl: true,
                                        // Lower sample rate for faster transmission (voice optimized)
                                        sampleRate: 16000,
                                        channelCount: 1,
                                    },
                                    // Publishing options for minimal latency
                                    publishDefaults: {
                                        audioPreset: {
                                            maxBitrate: 32000, // Reduced bitrate for faster transmission
                                            priority: 'high',
                                        },
                                        dtx: true, // Discontinuous transmission saves bandwidth
                                        red: true, // Redundant audio encoding for reliability
                                    },
                                    // Adaptive stream for network optimization
                                    adaptiveStream: true,
                                    dynacast: true,
                                    // WebRTC configurations for lower latency
                                    webAudioMix: true,
                                }}
                                onConnected={() => {
                                    console.log('✅ ========================================');
                                    console.log('✅ [LIVEKIT] ROOM CONNECTED SUCCESSFULLY!');
                                    console.log('✅ ========================================');
                                    console.log('✅ Server URL:', process.env.REACT_APP_LIVEKIT_URL);
                                    console.log('✅ Room Name: customer-support');
                                    console.log('✅ User:', user?.name);
                                    console.log('✅ Audio Settings: Optimized for low latency');
                                    console.log('✅ Agent should now join...');
                                    console.log('✅ ========================================\n');
                                }}
                                onDisconnected={() => {
                                    console.log('🔌 ========================================');
                                    console.log('🔌 [LIVEKIT] ROOM DISCONNECTED');
                                    console.log('🔌 ========================================\n');
                                    handleClose();
                                }}
                                onError={(error) => {
                                    console.error('❌ ========================================');
                                    console.error('❌ [LIVEKIT] ROOM ERROR');
                                    console.error('❌ ========================================');
                                    console.error('❌ Error:', error);
                                    console.error('❌ ========================================\n');
                                }}
                            >
                                <RoomAudioRenderer />
                                <VoiceAgent onClose={handleClose} onVoiceAction={handleVoiceAction} />
                            </LiveKitRoom>
                        </div>
                    )}
                </div>
            )}

            {/* Voice Action Indicator */}
            <VoiceActionIndicator 
                action={currentAction}
                visible={showActionIndicator}
                onHide={() => setShowActionIndicator(false)}
            />
        </>
    );
};

export default AIAgentButton;
