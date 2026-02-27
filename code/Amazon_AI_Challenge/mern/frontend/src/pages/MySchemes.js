import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const SupportHistory = () => {
    const { user, token } = useAuth();
    const [transcripts, setTranscripts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchTranscripts();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchTranscripts = async () => {
        try {
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`${baseUrl}/api/transcripts`, { headers });
            if (response.ok) {
                const data = await response.json();
                setTranscripts(data);
            }
        } catch (error) {
            console.error('Error fetching transcripts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCallTypeIcon = (type) => {
        const icons = {
            'support': 'support_agent',
            'consultation': 'contact_support',
            'eligibility': 'verified_user',
            'application': 'description',
            'sales': 'shopping_cart',
            'technical': 'construction',
            'general': 'chat'
        };
        return icons[type] || icons.general;
    };

    const getCallTypeColor = (type) => {
        const colors = {
            'support': 'from-blue-500 to-blue-600',
            'consultation': 'from-green-500 to-green-600',
            'eligibility': 'from-purple-500 to-purple-600',
            'application': 'from-orange-500 to-orange-600',
            'sales': 'from-green-500 to-green-600',
            'technical': 'from-purple-500 to-purple-600',
            'general': 'from-gray-500 to-gray-600'
        };
        return colors[type] || colors.general;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 border-b border-border-light dark:border-border-dark">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to="/home" className="text-text-light dark:text-text-dark hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">योजना इतिहास</h1>
                    </div>
                    <p className="text-text-light/70 dark:text-text-dark/70">View all your scheme consultations and AI interactions</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {transcripts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                            <span className="material-symbols-outlined text-6xl text-gray-400">history</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-text-light dark:text-text-dark mb-2">No Interaction History</h3>
                        <p className="text-text-light/60 dark:text-text-dark/60 mb-8">You haven't consulted about any schemes yet</p>
                        <Link to="/home" className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-lg transition-colors">
                            Explore Schemes
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {transcripts.map((transcript) => (
                            <div key={transcript._id} className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCallTypeColor(transcript.call_type)} flex items-center justify-center flex-shrink-0`}>
                                                <span className="material-symbols-outlined text-white text-2xl">
                                                    {getCallTypeIcon(transcript.call_type)}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-1 capitalize">
                                                    {transcript.call_type || 'Consultation'} Session
                                                </h3>
                                                <p className="text-sm text-text-light/60 dark:text-text-dark/60">
                                                    {new Date(transcript.call_start).toLocaleString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-text-light/60 dark:text-text-dark/60 mb-1">Duration</p>
                                            <p className="text-lg font-semibold text-primary">
                                                {transcript.duration ? `${Math.floor(transcript.duration / 60)}:${(transcript.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {transcript.summary && (
                                        <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 mb-4">
                                            <p className="text-xs text-text-light/60 dark:text-text-dark/60 uppercase tracking-wide mb-2">Summary</p>
                                            <p className="text-text-light dark:text-text-dark">{transcript.summary}</p>
                                        </div>
                                    )}

                                    {transcript.action_items && transcript.action_items.length > 0 && (
                                        <div className="bg-primary/5 rounded-lg p-4 mb-4">
                                            <p className="text-xs text-text-light/60 dark:text-text-dark/60 uppercase tracking-wide mb-3">Action Items</p>
                                            <ul className="space-y-2">
                                                {transcript.action_items.map((item, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                                                        <span className="text-text-light dark:text-text-dark text-sm">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {transcript.transcript && (
                                        <details className="group">
                                            <summary className="cursor-pointer text-primary font-medium flex items-center gap-2 hover:text-primary-hover transition-colors">
                                                <span className="material-symbols-outlined text-sm group-open:rotate-90 transition-transform">chevron_right</span>
                                                View Full Transcript
                                            </summary>
                                            <div className="mt-4 bg-background-light dark:bg-background-dark rounded-lg p-4 max-h-96 overflow-y-auto">
                                                <pre className="text-sm text-text-light dark:text-text-dark whitespace-pre-wrap font-mono">
                                                    {transcript.transcript}
                                                </pre>
                                            </div>
                                        </details>
                                    )}

                                    <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark flex justify-between items-center">
                                        <div className="flex gap-3 text-xs text-text-light/60 dark:text-text-dark/60">
                                            {transcript.customer_email && (
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">mail</span>
                                                    {transcript.customer_email}
                                                </span>
                                            )}
                                            {transcript.phone && (
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">phone</span>
                                                    {transcript.phone}
                                                </span>
                                            )}
                                        </div>
                                        <button className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium">
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportHistory;
