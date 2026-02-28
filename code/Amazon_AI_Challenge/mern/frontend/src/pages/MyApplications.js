import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyApplications = () => {
    const { user, token } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && user?.phone) {
            fetchApplications();
        } else {
            setLoading(false);
        }
    }, [token, user]);

    const fetchApplications = async () => {
        try {
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch applications for this user
            const response = await fetch(`${baseUrl}/api/applications/phone/${user.phone}`, { headers });
            if (response.ok) {
                const data = await response.json();
                setApplications(data);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'agriculture': 'agriculture',
            'education': 'school',
            'health': 'health_and_safety',
            'healthcare': 'health_and_safety',
            'housing': 'home',
            'pension': 'elderly',
            'women': 'woman',
            'employment': 'work',
            'other': 'more_horiz',
            'default': 'description'
        };
        return icons[category?.toLowerCase()] || icons.default;
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'disbursed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'submitted': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'under_review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'documents_pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
        return statusColors[status?.toLowerCase()] || statusColors.draft;
    };

    const getStatusDisplay = (status) => {
        const statusDisplay = {
            'approved': 'Approved',
            'disbursed': 'Disbursed',
            'submitted': 'Submitted',
            'under_review': 'Under Review',
            'documents_pending': 'Documents Pending',
            'rejected': 'Rejected',
            'draft': 'Draft'
        };
        return statusDisplay[status?.toLowerCase()] || 'Unknown';
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
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
            <div className="bg-gradient-to-r from-primary/20 to-yellow-500/20 dark:from-primary/10 dark:to-yellow-500/10 border-b border-border-light dark:border-border-dark">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Link to="/home" className="text-text-light dark:text-text-dark hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">My Applications</h1>
                        </div>
                        {user?.phone && (
                            <Link
                                to="/my-schemes"
                                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Apply for Scheme
                            </Link>
                        )}
                    </div>
                    <p className="text-text-light/70 dark:text-text-dark/70">Track all your government scheme applications and benefits</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {applications.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                            <span className="material-symbols-outlined text-6xl text-gray-400">description</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-text-light dark:text-text-dark mb-2">No Applications Yet</h3>
                        <p className="text-text-light/60 dark:text-text-dark/60 mb-8">Start applying for government schemes to receive benefits</p>
                        {!user?.phone ? (
                            <div className="mb-4">
                                <p className="text-yellow-600 dark:text-yellow-400 mb-4">
                                    ⚠️ Please add your phone number in your profile first
                                </p>
                                <Link 
                                    to="/profile" 
                                    className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-lg transition-colors"
                                >
                                    Go to Profile
                                </Link>
                            </div>
                        ) : (
                            <Link 
                                to="/my-schemes"
                                className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-lg transition-colors"
                            >
                                Browse Available Schemes
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map((application, index) => (
                            <div key={application._id || application.application_id || index} className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-2xl">
                                                {getCategoryIcon(application.scheme_category)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-text-light dark:text-text-dark">
                                                {application.scheme_name}
                                            </h3>
                                            <p className="text-xs text-text-light/60 dark:text-text-dark/60 capitalize">
                                                {application.scheme_category}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(application.status)}`}>
                                        {getStatusDisplay(application.status)}
                                    </span>
                                </div>

                                <div className="space-y-3 text-sm">
                                    {application.reference_number && (
                                        <div>
                                            <p className="text-text-light/60 dark:text-text-dark/60 text-xs mb-1">Reference Number</p>
                                            <p className="text-text-light dark:text-text-dark font-medium font-mono">
                                                {application.reference_number}
                                            </p>
                                        </div>
                                    )}

                                    {application.application_id && (
                                        <div>
                                            <p className="text-text-light/60 dark:text-text-dark/60 text-xs mb-1">Application ID</p>
                                            <p className="text-text-light dark:text-text-dark font-medium">
                                                {application.application_id}
                                            </p>
                                        </div>
                                    )}

                                    {application.benefit_amount && (
                                        <div>
                                            <p className="text-text-light/60 dark:text-text-dark/60 text-xs mb-1">Benefit Amount</p>
                                            <p className="text-text-light dark:text-text-dark font-bold text-lg text-primary">
                                                {formatCurrency(application.benefit_amount)}
                                            </p>
                                        </div>
                                    )}

                                    {application.submission_date && (
                                        <div>
                                            <p className="text-text-light/60 dark:text-text-dark/60 text-xs mb-1">Submitted On</p>
                                            <p className="text-text-light dark:text-text-dark font-medium">
                                                {new Date(application.submission_date).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}

                                    {application.last_updated && (
                                        <div>
                                            <p className="text-text-light/60 dark:text-text-dark/60 text-xs mb-1">Last Updated</p>
                                            <p className="text-text-light dark:text-text-dark font-medium">
                                                {new Date(application.last_updated).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}

                                    {/* Status-specific indicators */}
                                    {application.status === 'approved' && (
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                                            <p className="text-xs text-green-800 dark:text-green-400 font-semibold flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                Application Approved
                                            </p>
                                        </div>
                                    )}

                                    {application.status === 'disbursed' && (
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                                            <p className="text-xs text-green-800 dark:text-green-400 font-semibold flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">paid</span>
                                                Benefit Disbursed
                                            </p>
                                        </div>
                                    )}

                                    {application.status === 'documents_pending' && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2">
                                            <p className="text-xs text-yellow-800 dark:text-yellow-400 font-semibold flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">warning</span>
                                                Documents Required
                                            </p>
                                        </div>
                                    )}

                                    {application.status === 'rejected' && (
                                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                                            <p className="text-xs text-red-800 dark:text-red-400 font-semibold flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">cancel</span>
                                                Application Rejected
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark flex gap-2">
                                    <button className="flex-1 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium">
                                        View Details
                                    </button>
                                    <button className="flex-1 px-4 py-2 bg-surface-light dark:bg-black/20 hover:bg-black/10 dark:hover:bg-white/5 text-text-light dark:text-text-dark rounded-lg transition-colors text-sm font-medium">
                                        Track Status
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary Stats */}
                {applications.length > 0 && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-blue-500">pending_actions</span>
                                <h4 className="font-semibold text-text-light dark:text-text-dark">Total Applications</h4>
                            </div>
                            <p className="text-3xl font-bold text-primary">{applications.length}</p>
                        </div>

                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                                <h4 className="font-semibold text-text-light dark:text-text-dark">Approved</h4>
                            </div>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {applications.filter(app => app.status === 'approved' || app.status === 'disbursed').length}
                            </p>
                        </div>

                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-yellow-500">hourglass_empty</span>
                                <h4 className="font-semibold text-text-light dark:text-text-dark">Pending</h4>
                            </div>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                {applications.filter(app => app.status === 'submitted' || app.status === 'under_review' || app.status === 'documents_pending').length}
                            </p>
                        </div>

                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-primary">currency_rupee</span>
                                <h4 className="font-semibold text-text-light dark:text-text-dark">Total Benefits</h4>
                            </div>
                            <p className="text-2xl font-bold text-primary">
                                {formatCurrency(applications.reduce((sum, app) => sum + (app.benefit_amount || 0), 0))}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplications;
