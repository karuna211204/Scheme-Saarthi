import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const LeadStatsWidget = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                const baseUrl = process.env.REACT_APP_BACKEND_URL;
                const response = await fetch(`${baseUrl}/api/salesleads/stats`, { headers });
                
                if (response.ok) {
                    const data = await response.json();
                    setStats(data.stats);
                }
            } catch (err) {
                console.error('Error fetching lead stats:', err);
            }
            setLoading(false);
        };

        if (token) {
            fetchStats();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] rounded-xl p-6">
                <p className="text-center text-[#8c8b5f]">Loading...</p>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="bg-surface-light dark:bg-surface-dark border border-[#e6e6db] dark:border-[#3a3928] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#e6e6db] dark:border-[#3a3928]">
                <h3 className="font-bold text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    Lead Performance
                </h3>
            </div>
            
            <div className="p-4 space-y-4">
                {/* Conversion Rate */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#8c8b5f] uppercase">Conversion Rate</span>
                        <span className="text-lg font-bold">{stats.conversionRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#e6e6db] dark:bg-[#3a3928] rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" 
                            style={{ width: `${stats.conversionRate}%` }}
                        ></div>
                    </div>
                </div>

                {/* Lead Score */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#8c8b5f] uppercase">Avg Lead Score</span>
                        <span className="text-lg font-bold">{stats.avgLeadScore}</span>
                    </div>
                    <div className="h-2 w-full bg-[#e6e6db] dark:bg-[#3a3928] rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" 
                            style={{ width: `${stats.avgLeadScore}%` }}
                        ></div>
                    </div>
                </div>

                {/* ICP Match */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#8c8b5f] uppercase">Avg ICP Match</span>
                        <span className="text-lg font-bold">{stats.avgICPScore}</span>
                    </div>
                    <div className="h-2 w-full bg-[#e6e6db] dark:bg-[#3a3928] rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" 
                            style={{ width: `${stats.avgICPScore}%` }}
                        ></div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-background-light dark:bg-background-dark rounded-lg">
                        <p className="text-xs text-[#8c8b5f] uppercase font-semibold">Qualified</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.qualified}</p>
                    </div>
                    <div className="p-3 bg-background-light dark:bg-background-dark rounded-lg">
                        <p className="text-xs text-[#8c8b5f] uppercase font-semibold">High Priority</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.highPriority}</p>
                    </div>
                    <div className="p-3 bg-background-light dark:bg-background-dark rounded-lg">
                        <p className="text-xs text-[#8c8b5f] uppercase font-semibold">Open</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.open}</p>
                    </div>
                    <div className="p-3 bg-background-light dark:bg-background-dark rounded-lg">
                        <p className="text-xs text-[#8c8b5f] uppercase font-semibold">Converted</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.converted}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadStatsWidget;
