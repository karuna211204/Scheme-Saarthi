import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const CallTranscriptViewer = () => {
    const { token } = useAuth();
    const [transcripts, setTranscripts] = useState([]);
    const [selectedTranscript, setSelectedTranscript] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTranscripts = async () => {
            setLoading(true);
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                const baseUrl = process.env.REACT_APP_BACKEND_URL;
                const response = await fetch(`${baseUrl}/api/transcripts/admin/all`, { headers });
                if (response.ok) {
                    const data = await response.json();
                    setTranscripts(data);
                    if (data.length > 0) {
                        setSelectedTranscript(data[0]);
                    }
                }
            } catch (err) {
                console.error('Error fetching transcripts:', err);
            }
            setLoading(false);
        };
        if(token) {
            fetchTranscripts();
        }
    }, [token]);

    const getSentimentChip = (sentiment) => {
        if (sentiment > 80) return <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">Positive</span>;
        if (sentiment > 60) return <span className="text-xs font-medium text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded">Neutral</span>;
        return <span className="text-xs font-medium text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded">Negative</span>;
    }

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading transcripts...</div>;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-neutral-dark dark:text-neutral-light font-display overflow-hidden h-screen flex flex-col">
            <div className="flex flex-1 overflow-hidden">
                <aside className="w-96 flex flex-col border-r border-[#e6e6e0] dark:border-[#3a392a] bg-white dark:bg-[#1a190b] z-10 shrink-0">
                    <div className="p-4 flex flex-col gap-4 border-b border-[#e6e60] dark:border-[#3a392a]">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8b5f] material-symbols-outlined">filter_list</span>
                            <input className="w-full bg-[#f5f5f0] dark:bg-[#2c2b1f] rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-neutral-dark dark:text-white placeholder:text-[#8c8b5f]" placeholder="Filter consultations..."/>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {transcripts.map(transcript => (
                            <div key={transcript._id} onClick={() => setSelectedTranscript(transcript)} className={`flex items-start gap-3 p-4 cursor-pointer border-b border-[#f0f0eb] dark:border-[#2c2b1f] ${selectedTranscript?._id === transcript._id ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                <div>
                                    <div className="flex justify-between items-start">
                                        <p className="text-neutral-dark dark:text-white text-sm font-bold truncate">{transcript.customer_name}</p>
                                        <span className="text-xs text-[#8c8b5f] whitespace-nowrap">{new Date(transcript.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-[#5c5b3f] dark:text-[#a8a898] text-xs mt-0.5 line-clamp-1">Ticket #{transcript._id.slice(-6)} • {transcript.issue_summary}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${transcript.agent_type === 'AI' ? 'bg-white dark:bg-black/20 text-neutral-dark dark:text-white border border-primary/30' : 'bg-[#f5f5f0] dark:bg-[#2c2b1f] text-neutral-dark dark:text-neutral-light'}`}>{transcript.agent_type} Agent</span>
                                        {transcript.status === 'Resolved' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Resolved</span>}
                                        {transcript.status === 'Escalated' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Escalated</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
                <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark relative">
                    {selectedTranscript && (
                        <>
                           <div className="bg-white dark:bg-[#1a190b] border-b border-[#e6e6e0] dark:border-[#3a392a] px-8 py-4 flex flex-col gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-neutral-dark dark:text-white mb-1">{selectedTranscript.customer_name}</h1>
                                    <div className="flex items-center gap-3 text-sm text-[#8c8b5f]">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">calendar_today</span> {new Date(selectedTranscript.timestamp).toLocaleDateString()}</span>
                                        <span className="w-1 h-1 rounded-full bg-[#8c8b5f]"></span>
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">schedule</span> {selectedTranscript.duration || 'N/A'}</span>
                                        <span className="w-1 h-1 rounded-full bg-[#8c8b5f]"></span>
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">{selectedTranscript.agent_type === 'AI' ? 'smart_toy' : 'person'}</span> Agent: {selectedTranscript.agent_name}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#e6e6e0] dark:border-[#3a392a] hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium transition-colors"><span className="material-symbols-outlined text-[20px]">flag</span> Flag</button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-black text-sm font-bold shadow-sm hover:shadow-md transition-shadow"><span className="material-symbols-outlined text-[20px]">download</span> Export Transcript</button>
                                </div>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                                    <div className="max-w-3xl mx-auto flex flex-col gap-6">
                                        <p>{selectedTranscript.transcript}</p>
                                    </div>
                                </div>
                                <aside className="w-80 bg-white dark:bg-[#1a190b] border-l border-[#e6e6e0] dark:border-[#3a392a] p-6 overflow-y-auto hidden xl:block">
                                    <div className="flex flex-col gap-8">
                                        <div>
                                            <h3 className="text-sm font-bold text-neutral-dark dark:text-white mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">auto_awesome</span> AI Analysis</h3>
                                            <div className="bg-[#f8f8f5] dark:bg-[#23220f] p-4 rounded-xl border border-[#e6e6e0] dark:border-[#3a392a]"><p className="text-sm text-neutral-dark dark:text-neutral-light leading-relaxed">{selectedTranscript.ai_analysis}</p></div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-neutral-dark dark:text-white mb-4">Sentiment Score</h3>
                                            <div className="flex items-center gap-4 mb-2">
                                                <span className="text-3xl font-bold text-neutral-dark dark:text-white">{selectedTranscript.sentiment_score}%</span>
                                                {getSentimentChip(selectedTranscript.sentiment_score)}
                                            </div>
                                            <div className="h-2 w-full bg-[#e6e6e0] dark:bg-[#3a392a] rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{width: `${selectedTranscript.sentiment_score}%`}}></div></div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-neutral-dark dark:text-white mb-4">Detected Topics</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTranscript.tags?.map(tag => <span key={tag} className="px-3 py-1 rounded-full bg-white dark:bg-[#2c2b1f] border border-[#e6e6e0] dark:border-[#3a392a] text-neutral-dark dark:text-neutral-light text-xs font-medium">{tag}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CallTranscriptViewer;
