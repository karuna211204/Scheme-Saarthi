import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyDevices = () => {
    const { user, token } = useAuth();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [formData, setFormData] = useState({
        product_name: '',
        product_category: '',
        invoice_id: '',
        purchase_date: '',
        warranty_expiry: '',
        store_location: '',
        amc_enrolled: false
    });

    useEffect(() => {
        if (token && user?.phone) {
            fetchDevices();
        } else {
            setLoading(false);
        }
    }, [token, user]);

    const fetchDevices = async () => {
        try {
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch warranties which represent devices
            const response = await fetch(`${baseUrl}/api/warranties/phone/${user.phone}`, { headers });
            if (response.ok) {
                const data = await response.json();
                setDevices(data);
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterDevice = async (e) => {
        e.preventDefault();
        
        if (!user?.phone) {
            alert('Please update your phone number in your profile before registering devices.');
            return;
        }

        try {
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/warranties`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    phone: user.phone
                })
            });

            if (response.ok) {
                alert('Application submitted successfully!');
                setShowRegisterForm(false);
                setFormData({
                    product_name: '',
                    product_category: '',
                    invoice_id: '',
                    purchase_date: '',
                    warranty_expiry: '',
                    store_location: '',
                    amc_enrolled: false
                });
                fetchDevices(); // Refresh the device list
            } else {
                const error = await response.json();
                alert('Failed to submit application: ' + (error.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Failed to submit application. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const getDeviceIcon = (category) => {
        const icons = {
            'agriculture': 'agriculture',
            'education': 'school',
            'health': 'health_and_safety',
            'housing': 'home',
            'pension': 'elderly',
            'women': 'woman',
            'employment': 'work',
            'other': 'more_horiz',
            'default': 'description'
        };
        return icons[category?.toLowerCase()] || icons.default;
    };

    const getStatusColor = (expiryDate) => {
        const expiry = new Date(expiryDate);
        const now = new Date();
        const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining < 0) {
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        } else if (daysRemaining < 30) {
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    };

    const getDaysRemaining = (expiryDate) => {
        const end = new Date(expiryDate);
        const now = new Date();
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getStatus = (expiryDate) => {
        const days = getDaysRemaining(expiryDate);
        if (days < 0) return 'expired';
        if (days < 30) return 'expiring';
        return 'active';
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
                            <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">मेरे आवेदन</h1>
                        </div>
                        {devices.length > 0 && user?.phone && (
                            <button
                                onClick={() => setShowRegisterForm(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">add</span>
                                New Application
                            </button>
                        )}
                    </div>
                    <p className="text-text-light/70 dark:text-text-dark/70">Track all your scheme applications and benefits</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Registration Form Modal */}
                {showRegisterForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">नया आवेदन (New Application)</h2>
                                <button
                                    onClick={() => setShowRegisterForm(false)}
                                    className="text-text-light/60 dark:text-text-dark/60 hover:text-text-light dark:hover:text-text-dark"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleRegisterDevice} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                                        Scheme Name (योजना का नाम) *
                                    </label>
                                    <input
                                        type="text"
                                        name="product_name"
                                        value={formData.product_name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark focus:outline-none focus:border-primary"
                                        placeholder="e.g., PM-KISAN, Ayushman Bharat"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                                        Category (श्रेणी) *
                                    </label>
                                    <select
                                        name="product_category"
                                        value={formData.product_category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark focus:outline-none focus:border-primary"
                                    >
                                        <option value="">Select a category</option>
                                        <option value="agriculture">कृषि (Agriculture)</option>
                                        <option value="education">शिक्षा (Education)</option>
                                        <option value="health">स्वास्थ्य (Health)</option>
                                        <option value="housing">आवास (Housing)</option>
                                        <option value="pension">पेंशन (Pension)</option>
                                        <option value="women">महिला (Women)</option>
                                        <option value="employment">रोजगार (Employment)</option>
                                        <option value="other">अन्य (Other)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                                        Application ID (आवेदन क्रमांक) *
                                    </label>
                                    <input
                                        type="text"
                                        name="invoice_id"
                                        value={formData.invoice_id}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark focus:outline-none focus:border-primary"
                                        placeholder="e.g., APP-2026-001"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                                            Application Date (आवेदन तिथि) *
                                        </label>
                                        <input
                                            type="date"
                                            name="purchase_date"
                                            value={formData.purchase_date}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                                            Expected Approval Date
                                        </label>
                                        <input
                                            type="date"
                                            name="warranty_expiry"
                                            value={formData.warranty_expiry}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                                        District / Location (जिला)
                                    </label>
                                    <input
                                        type="text"
                                        name="store_location"
                                        value={formData.store_location}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark focus:outline-none focus:border-primary"
                                        placeholder="e.g., Hyderabad, Telangana"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="amc_enrolled"
                                        id="amc_enrolled"
                                        checked={formData.amc_enrolled}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="amc_enrolled" className="text-sm text-text-light dark:text-text-dark">
                                        Documents Verified (दस्तावेज़ सत्यापित)
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRegisterForm(false)}
                                        className="flex-1 px-6 py-3 bg-surface-light dark:bg-black/20 hover:bg-black/10 dark:hover:bg-white/5 text-text-light dark:text-text-dark rounded-lg transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-lg transition-colors"
                                    >
                                        Submit Application
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {devices.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                            <span className="material-symbols-outlined text-6xl text-gray-400">description</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-text-light dark:text-text-dark mb-2">No Applications Yet</h3>
                        <p className="text-text-light/60 dark:text-text-dark/60 mb-8">Start applying for schemes to receive benefits</p>
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
                            <button 
                                onClick={() => setShowRegisterForm(true)}
                                className="px-6 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-lg transition-colors"
                            >
                                Start New Application
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {devices.map((device, index) => {
                            const daysRemaining = getDaysRemaining(device.warranty_expiry);
                            const status = getStatus(device.warranty_expiry);

                            return (
                                <div key={device._id || index} className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-2xl">
                                                    {getDeviceIcon(device.product_category)}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-text-light dark:text-text-dark">
                                                    {device.product_name}
                                                </h3>
                                                <p className="text-xs text-text-light/60 dark:text-text-dark/60 capitalize">
                                                    {device.product_category}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(device.warranty_expiry)}`}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <p className="text-text-light/60 dark:text-text-dark/60 text-xs mb-1">Application Date</p>
                                            <p className="text-text-light dark:text-text-dark font-medium">
                                                {new Date(device.purchase_date).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-text-light/60 dark:text-text-dark/60 text-xs mb-1">Expected Approval</p>
                                            <p className="text-text-light dark:text-text-dark font-medium">
                                                {new Date(device.warranty_expiry).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {daysRemaining >= 0 && (
                                            <div>
                                                <p className="text-text-light/60 dark:text-text-dark/60 text-xs mb-1">Days Remaining</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-primary to-yellow-500 rounded-full transition-all"
                                                            style={{ width: `${Math.min((daysRemaining / 365) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-primary font-bold">{daysRemaining}d</span>
                                                </div>
                                            </div>
                                        )}

                                        {device.store_location && (
                                            <div>
                                                <p className="text-text-light/60 dark:text-text-dark/60 text-xs mb-1">District</p>
                                                <p className="text-text-light dark:text-text-dark">{device.store_location}</p>
                                            </div>
                                        )}

                                        {device.amc_enrolled && (
                                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                                                <p className="text-xs text-green-800 dark:text-green-400 font-semibold flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">verified</span>
                                                    Documents Verified
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark flex gap-2">
                                        <button className="flex-1 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium">
                                            View Status
                                        </button>
                                        <button className="flex-1 px-4 py-2 bg-surface-light dark:bg-black/20 hover:bg-black/10 dark:hover:bg-white/5 text-text-light dark:text-text-dark rounded-lg transition-colors text-sm font-medium">
                                            Contact
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDevices;
