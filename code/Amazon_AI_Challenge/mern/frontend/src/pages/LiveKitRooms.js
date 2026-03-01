import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const LiveKitRooms = () => {
    const { token } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRooms();
    }, [token]);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/livekit/rooms`, { headers });
            
            if (response.ok) {
                const data = await response.json();
                setRooms(data.rooms || []);
            }
        } catch (err) {
            console.error('Error fetching rooms:', err);
        }
        setLoading(false);
    };

    const fetchParticipants = async (roomName) => {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/livekit/participants/${roomName}`, { headers });
            
            if (response.ok) {
                const data = await response.json();
                setParticipants(data.participants || []);
                setSelectedRoom(roomName);
            }
        } catch (err) {
            console.error('Error fetching participants:', err);
        }
    };

    const handleEndCall = async (roomName) => {
        if (!window.confirm(`Are you sure you want to end the call in room: ${roomName}?`)) {
            return;
        }

        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/livekit/end-call`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ roomName })
            });
            
            if (response.ok) {
                alert('Call ended successfully!');
                fetchRooms();
            }
        } catch (err) {
            console.error('Error ending call:', err);
            alert('Failed to end call');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading rooms...</div>;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark min-h-screen flex flex-col selection:bg-primary selection:text-black">
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">LiveKit Room Management</h1>
                        <p className="text-[#5c5b4f] dark:text-[#cbcb9c]">
                            Monitor active video calls and manage participants
                        </p>
                    </div>
                    <button
                        onClick={fetchRooms}
                        className="px-5 py-2.5 rounded-full border border-[#e6e6db] dark:border-[#3a3928] bg-surface-light dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Rooms List */}
                    <div className="lg:col-span-2">
                        <div className="bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-[#e6e6db] dark:border-[#3a3928] bg-[#f8f8f5] dark:bg-[#23220f]">
                                <h3 className="font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">video_call</span>
                                    Active Rooms ({rooms.length})
                                </h3>
                            </div>

                            {rooms.length === 0 ? (
                                <div className="p-12 text-center text-[#8c8b5f]">
                                    <span className="material-symbols-outlined text-6xl mb-4 opacity-20">video_call</span>
                                    <p>No active rooms</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#e6e6db] dark:divide-[#3a3928]">
                                    {rooms.map((room, index) => (
                                        <div 
                                            key={index}
                                            className="p-4 hover:bg-[#f8f8f5] dark:hover:bg-[#3a3928]/30 transition-colors cursor-pointer"
                                            onClick={() => fetchParticipants(room.name)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold flex items-center gap-2">
                                                        {selectedRoom === room.name && (
                                                            <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                                                        )}
                                                        {room.name}
                                                    </h4>
                                                    <div className="flex items-center gap-4 mt-1 text-xs text-[#8c8b5f]">
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">person</span>
                                                            {room.num_participants || 0} participants
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                                            Created: {room.creation_time ? new Date(room.creation_time * 1000).toLocaleString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEndCall(room.name);
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">call_end</span>
                                                    End Call
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Participants Panel */}
                    <div>
                        <div className="bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] rounded-xl shadow-sm overflow-hidden sticky top-24">
                            <div className="p-4 border-b border-[#e6e6db] dark:border-[#3a3928] bg-[#f8f8f5] dark:bg-[#23220f]">
                                <h3 className="font-bold text-sm">Participants</h3>
                                {selectedRoom && (
                                    <p className="text-xs text-[#8c8b5f] mt-1">{selectedRoom}</p>
                                )}
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {!selectedRoom ? (
                                    <div className="p-6 text-center text-[#8c8b5f] text-sm">
                                        <p>Select a room to view participants</p>
                                    </div>
                                ) : participants.length === 0 ? (
                                    <div className="p-6 text-center text-[#8c8b5f] text-sm">
                                        <p>No participants in this room</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[#e6e6db] dark:divide-[#3a3928]">
                                        {participants.map((participant, index) => (
                                            <div key={index} className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">
                                                            {participant.identity?.includes('AI') ? 'smart_toy' : 'person'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold">{participant.identity || 'Unknown'}</p>
                                                        <p className="text-xs text-[#8c8b5f]">
                                                            {participant.state || 'Active'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveKitRooms;
