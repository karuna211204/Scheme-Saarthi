import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const TrackRepair = () => {
    const { user, token } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && user?.phone) {
            fetchAppointments();
        } else {
            setLoading(false);
        }
    }, [token, user]);

    const fetchAppointments = async () => {
        try {
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`${baseUrl}/api/appointments/phone/${user.phone}`, { headers });
            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'scheduled': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status] || colors.pending;
    };

    const getStatusIcon = (status) => {
        const icons = {
            'scheduled': 'schedule',
            'pending': 'pending',
            'in-progress': 'progress_activity',
            'completed': 'check_circle',
            'approved': 'check_circle',
            'rejected': 'cancel',
            'cancelled': 'cancel'
        };
        return icons[status] || 'pending';
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
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 border-b border-border-light dark:border-border-dark">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to="/home" className="text-text-light dark:text-text-dark hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">आवेदन स्थिति</h1>
                    </div>
                    <p className="text-text-light/70 dark:text-text-dark/70">Monitor the status of your scheme applications</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {appointments.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                            <span className="material-symbols-outlined text-6xl text-gray-400">description</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-text-light dark:text-text-dark mb-2">No Applications</h3>
                        <p className="text-text-light/60 dark:text-text-dark/60 mb-8">You haven't submitted any scheme applications yet</p>
                        <Link to="/home" className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-lg transition-colors">
                            Browse Schemes
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {appointments.map((appointment) => (
                            <div key={appointment._id} className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-primary text-2xl">
                                                    {getStatusIcon(appointment.status)}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-1">
                                                    {appointment.issue_description || 'Scheme Application'}
                                                </h3>
                                                <p className="text-sm text-text-light/60 dark:text-text-dark/60">
                                                    Application ID: {appointment._id}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                                            {appointment.status?.replace('-', ' ').toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="space-y-1">
                                            <p className="text-xs text-text-light/60 dark:text-text-dark/60 uppercase tracking-wide">Application Date</p>
                                            <p className="text-text-light dark:text-text-dark font-medium">
                                                {new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
                                                    weekday: 'short', 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </p>
                                            <p className="text-primary font-semibold">{appointment.appointment_time}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-xs text-text-light/60 dark:text-text-dark/60 uppercase tracking-wide">Scheme Category</p>
                                            <p className="text-text-light dark:text-text-dark font-medium capitalize">
                                                {appointment.appointment_type || 'General'}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-xs text-text-light/60 dark:text-text-dark/60 uppercase tracking-wide">District</p>
                                            <p className="text-text-light dark:text-text-dark font-medium">
                                                {appointment.address || 'Not specified'}
                                            </p>
                                        </div>
                                    </div>

                                    {appointment.notes && (
                                        <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 mb-6">
                                            <p className="text-xs text-text-light/60 dark:text-text-dark/60 uppercase tracking-wide mb-2">Notes</p>
                                            <p className="text-text-light dark:text-text-dark">{appointment.notes}</p>
                                        </div>
                                    )}

                                    {/* Progress Timeline */}
                                    <div className="relative pl-8 space-y-4">
                                        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                                        
                                        <div className="relative">
                                            <div className={`absolute -left-6 w-4 h-4 rounded-full ${appointment.status === 'scheduled' || appointment.status === 'in-progress' || appointment.status === 'completed' || appointment.status === 'approved' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'} border-2 border-surface-light dark:border-surface-dark`}></div>
                                            <div>
                                                <p className="font-medium text-text-light dark:text-text-dark">Submitted</p>
                                                <p className="text-xs text-text-light/60 dark:text-text-dark/60">Application received</p>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className={`absolute -left-6 w-4 h-4 rounded-full ${appointment.status === 'in-progress' || appointment.status === 'completed' || appointment.status === 'approved' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'} border-2 border-surface-light dark:border-surface-dark`}></div>
                                            <div>
                                                <p className="font-medium text-text-light dark:text-text-dark">Under Review</p>
                                                <p className="text-xs text-text-light/60 dark:text-text-dark/60">Documents being verified</p>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className={`absolute -left-6 w-4 h-4 rounded-full ${appointment.status === 'completed' || appointment.status === 'approved' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'} border-2 border-surface-light dark:border-surface-dark`}></div>
                                            <div>
                                                <p className="font-medium text-text-light dark:text-text-dark">Approved</p>
                                                <p className="text-xs text-text-light/60 dark:text-text-dark/60">Benefit processing</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark flex gap-3">
                                        <button className="flex-1 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-sm">support_agent</span>
                                            Get Help
                                        </button>
                                        {appointment.status === 'scheduled' && (
                                            <button className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors font-medium">
                                                Withdraw
                                            </button>
                                        )}
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

export default TrackRepair;
