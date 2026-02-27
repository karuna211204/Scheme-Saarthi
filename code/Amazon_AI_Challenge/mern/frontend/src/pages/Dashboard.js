import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ leads: 0, appointments: 0, warranties: 0, successRate: 0 });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                const baseUrl = process.env.REACT_APP_BACKEND_URL;

                const [leadsRes, apptsRes, warrRes, transRes] = await Promise.all([
                    fetch(`${baseUrl}/api/salesleads`, { headers }),
                    fetch(`${baseUrl}/api/appointments`, { headers }),
                    fetch(`${baseUrl}/api/warranties`, { headers }),
                    fetch(`${baseUrl}/api/transcripts/admin/all`, { headers })
                ]);

                if (leadsRes.ok) {
                    const leads = await leadsRes.json();
                    setStats(prev => ({ ...prev, leads: leads.length }));
                    setRecentActivities(prev => [...prev, ...leads.slice(0, 2).map(l => ({...l, type: 'Lead'}))]);
                }
                if (apptsRes.ok) {
                    const appts = await apptsRes.json();
                    setStats(prev => ({ ...prev, appointments: appts.length }));
                }
                if (warrRes.ok) {
                    const warrs = await warrRes.json();
                    setStats(prev => ({ ...prev, warranties: warrs.length }));
                }
                if (transRes.ok) {
                    const transcripts = await transRes.json();
                     setRecentActivities(prev => [...prev, ...transcripts.slice(0, 2).map(t => ({...t, type: 'Transcript'}))]);
                    const aiResolvedCount = transcripts.filter(t => t.agent_type === 'AI' && t.status === 'Resolved').length;
                    const totalAiCount = transcripts.filter(t => t.agent_type === 'AI').length;
                    setStats(prev => ({...prev, successRate: totalAiCount > 0 ? (aiResolvedCount/totalAiCount)*100 : 0}));
                }

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            }
            setLoading(false);
        };

        if (token) {
            fetchData();
        } else {
             navigate('/login');
        }
    }, [token, navigate]);

    if (loading) {
        return <div className="text-center py-8">Loading dashboard...</div>;
    }

    const getTypeIcon = (type) => {
        switch(type) {
            case 'Lead': return <span className="material-symbols-outlined text-slate-400 text-[18px]">person</span>;
            case 'Inquiry': return <span className="material-symbols-outlined text-slate-400 text-[18px]">contact_support</span>;
            case 'Transcript': return <span className="material-symbols-outlined text-purple-500 text-[18px]">smart_toy</span>;
            default: return null;
        }
    }

    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white h-screen flex overflow-hidden">
             <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                <div className="max-w-[1400px] mx-auto space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Scheme Saarthi analytics - connecting citizens to benefits.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Inquiries</p><p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.leads}</p>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                           <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Consultations</p><p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.appointments}</p>
                        </div>
                        <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                           <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Applications</p><p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.warranties}</p>
                        </div>
                         <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                           <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">AI Success Rate</p><p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.successRate.toFixed(1)}%</p>
                        </div>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col">
                        <div className="border-b border-border-light dark:border-border-dark px-4"><h3 className="py-4 text-sm font-semibold">All Activities</h3></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-border-light dark:border-border-dark text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                                        <th className="px-6 py-4 font-semibold">Citizen</th>
                                        <th className="px-6 py-4 font-semibold">Type</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
                                    {recentActivities.sort((a,b) => new Date(b.date_created || b.timestamp) - new Date(a.date_created || a.timestamp)).map(activity => (
                                        <tr key={activity._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">{activity.customer_name}</td>
                                            <td className="px-6 py-4"><div className="flex items-center gap-2">{getTypeIcon(activity.type)}<span>{activity.type}</span></div></td>
                                            <td className="px-6 py-4">{activity.status}</td>
                                            <td className="px-6 py-4 text-right text-slate-500">{new Date(activity.date_created || activity.timestamp).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
