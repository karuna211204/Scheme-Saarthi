import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AadhaarOCR from '../components/AadhaarOCR';

const CitizenProfile = () => {
    const { user, token, updatePhone, logout } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showOCR, setShowOCR] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        // Basic Information
        name: user?.name || '',
        email: user?.email || '',
        mobile: user?.phone || '',
        dateOfBirth: '',
        age: '',
        gender: '',
        
        // Aadhaar Details
        aadhaarNumber: '',
        fatherName: '',
        
        // Address Information
        address: '',
        pincode: '',
        district: '',
        state: '',
        
        // Economic Information
        annualIncome: '',
        occupation: '',
        employmentType: '',
        
        // Family Information
        familySize: '',
        dependents: '',
        
        // Category Information
        category: '', // General, OBC, SC, ST
        disability: '',
        
        // Financial Information
        bankAccountNumber: '',
        ifscCode: '',
        panNumber: '',
        
        // Additional Information
        educationLevel: '',
        landOwnership: '',
        hasRationCard: false,
        rationCardNumber: '',
        
        // Profile completeness
        profileCompleteness: 0
    });
    
    const [verificationStatus, setVerificationStatus] = useState({
        aadhaar: false,
        mobile: false,
        email: false,
        bank: false,
        income: false
    });

    const [consultationHistory, setConsultationHistory] = useState([]);
    const [eligibleSchemes, setEligibleSchemes] = useState([]);

    // Calculate profile completeness
    useEffect(() => {
        const requiredFields = [
            'name', 'mobile', 'dateOfBirth', 'gender', 'aadhaarNumber',
            'address', 'pincode', 'annualIncome', 'occupation', 'category'
        ];
        const filledFields = requiredFields.filter(field => profileData[field] && profileData[field] !== '');
        const completeness = Math.round((filledFields.length / requiredFields.length) * 100);
        setProfileData(prev => ({ ...prev, profileCompleteness: completeness }));
    }, [profileData.name, profileData.mobile, profileData.dateOfBirth, profileData.gender, 
        profileData.aadhaarNumber, profileData.address, profileData.pincode, 
        profileData.annualIncome, profileData.occupation, profileData.category]);

    // Calculate age from date of birth
    useEffect(() => {
        if (profileData.dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(profileData.dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            setProfileData(prev => ({ ...prev, age: age.toString() }));
        }
    }, [profileData.dateOfBirth]);

    // Fetch consultation history and eligible schemes
    useEffect(() => {
        fetchUserData();
    }, [profileData.age, profileData.annualIncome, profileData.category, profileData.gender]);

    const fetchUserData = async () => {
        if (!user?.phone || !token) return;
        
        try {
            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            
            // Fetch consultation history
            const transRes = await fetch(`${baseUrl}/api/transcripts`, { headers });
            if (transRes.ok) {
                const transcripts = await transRes.json();
                setConsultationHistory(transcripts.slice(0, 5)); // Get latest 5
            }
            
            // Fetch eligible schemes based on profile
            if (profileData.profileCompleteness > 30) {
                const schemes = calculateEligibleSchemes();
                setEligibleSchemes(schemes);
            }
            
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const calculateEligibleSchemes = () => {
        const schemes = [];
        const age = parseInt(profileData.age);
        const income = parseInt(profileData.annualIncome);
        
        // Age-based schemes
        if (age >= 60) schemes.push({ name: 'Old Age Pension', category: 'pension' });
        if (profileData.gender === 'Female' && age < 10) {
            schemes.push({ name: 'Sukanya Samriddhi Yojana', category: 'savings' });
        }
        
        // Income-based schemes
        if (income < 200000) {
            schemes.push({ name: 'Ayushman Bharat', category: 'health' });
            schemes.push({ name: 'PM-Kisan (if farmer)', category: 'agriculture' });
        }
        
        // Occupation-based schemes
        if (profileData.occupation === 'Farmer') {
            schemes.push({ name: 'PM-KISAN Samman Nidhi', category: 'agriculture' });
            schemes.push({ name: 'PMAY - Gramin', category: 'housing' });
        }
        
        // Category-based schemes
        if (['SC', 'ST', 'OBC'].includes(profileData.category)) {
            schemes.push({ name: 'Post Matric Scholarship', category: 'education' });
        }
        
        // Gender-based schemes
        if (profileData.gender === 'Female') {
            schemes.push({ name: 'Beti Bachao Beti Padhao', category: 'women' });
        }
        
        return schemes.slice(0, 8); // Limit to 8 schemes
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleOCRData = (extractedData) => {
        setProfileData(prev => ({
            ...prev,
            ...extractedData
        }));
        
        // Update verification status for Aadhaar if number is extracted
        if (extractedData.aadhaarNumber) {
            setVerificationStatus(prev => ({ ...prev, aadhaar: true }));
        }
        
        setShowOCR(false);
        setIsEditing(true);
    };

    const handleOCRError = (error) => {
        alert(error);
    };

    const saveProfile = async () => {
        setLoading(true);
        try {
            // Here you would typically send data to backend
            console.log('Saving profile:', profileData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const startConsultation = () => {
        if (profileData.profileCompleteness < 50) {
            alert('Please complete your profile (at least 50%) before starting consultation.');
            return;
        }
        // Start consultation logic here
        navigate('/consultation');
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 border-b border-border-light dark:border-border-dark">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Link to="/home" className="text-text-light dark:text-text-dark hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">My Profile</h1>
                                <p className="text-text-light/70 dark:text-text-dark/70">Manage your personal information and preferences</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowOCR(true)}
                                className="px-4 py-2 bg-primary hover:bg-primary-hover text-black font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">document_scanner</span>
                                Scan Aadhaar
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">logout</span>
                                Logout
                            </button>
                        </div>
                    </div>
                    
                    {/* Profile Completeness */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-text-light dark:text-text-dark">Profile Completeness</span>
                            <span className="text-sm font-bold text-primary">{profileData.profileCompleteness}%</span>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${profileData.profileCompleteness}%` }}
                            ></div>
                        </div>
                        {profileData.profileCompleteness < 50 && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                Complete at least 50% to access all features
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* OCR Modal */}
            {showOCR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Scan Aadhaar Card</h3>
                            <button
                                onClick={() => setShowOCR(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <AadhaarOCR onExtractedData={handleOCRData} onError={handleOCRError} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">Basic Information</h2>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">{isEditing ? 'close' : 'edit'}</span>
                                    {isEditing ? 'Cancel' : 'Edit'}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Full Name *</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="text-text-light dark:text-text-dark py-2">{profileData.name || 'Not provided'}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Email *</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="text-text-light dark:text-text-dark py-2">{profileData.email || 'Not provided'}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Mobile Number *</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="mobile"
                                            value={profileData.mobile}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="text-text-light dark:text-text-dark py-2">{profileData.mobile || 'Not provided'}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Date of Birth *</label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={profileData.dateOfBirth}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="text-text-light dark:text-text-dark py-2">
                                            {profileData.dateOfBirth ? `${profileData.dateOfBirth} (Age: ${profileData.age})` : 'Not provided'}
                                        </p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Gender *</label>
                                    {isEditing ? (
                                        <select
                                            name="gender"
                                            value={profileData.gender}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : (
                                        <p className="text-text-light dark:text-text-dark py-2">{profileData.gender || 'Not provided'}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Aadhaar Number *</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="aadhaarNumber"
                                            value={profileData.aadhaarNumber}
                                            onChange={handleInputChange}
                                            placeholder="XXXX XXXX XXXX"
                                            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="text-text-light dark:text-text-dark py-2">
                                            {profileData.aadhaarNumber ? `XXXX XXXX ${profileData.aadhaarNumber.slice(-4)}` : 'Not provided'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Economic Information */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark p-6">
                            <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">Economic Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Annual Income *</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="annualIncome"
                                            value={profileData.annualIncome}
                                            onChange={handleInputChange}
                                            placeholder="₹ 0"
                                            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="text-text-light dark:text-text-dark py-2">
                                            {profileData.annualIncome ? `₹${parseInt(profileData.annualIncome).toLocaleString()}` : 'Not provided'}
                                        </p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Occupation *</label>
                                    {isEditing ? (
                                        <select
                                            name="occupation"
                                            value={profileData.occupation}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">Select Occupation</option>
                                            <option value="Farmer">Farmer</option>
                                            <option value="Labor">Labor</option>
                                            <option value="Business">Business</option>
                                            <option value="Service">Service</option>
                                            <option value="Student">Student</option>
                                            <option value="Unemployed">Unemployed</option>
                                            <option value="Retired">Retired</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : (
                                        <p className="text-text-light dark:text-text-dark py-2">{profileData.occupation || 'Not provided'}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Category *</label>
                                    {isEditing ? (
                                        <select
                                            name="category"
                                            value={profileData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="General">General</option>
                                            <option value="OBC">OBC</option>
                                            <option value="SC">SC</option>
                                            <option value="ST">ST</option>
                                        </select>
                                    ) : (
                                        <p className="text-text-light dark:text-text-dark py-2">{profileData.category || 'Not provided'}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Family Size</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="familySize"
                                            value={profileData.familySize}
                                            onChange={handleInputChange}
                                            placeholder="Number of family members"
                                            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="text-text-light dark:text-text-dark py-2">{profileData.familySize || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark p-6">
                            <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-4">Address Information</h2>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Full Address *</label>
                                    {isEditing ? (
                                        <textarea
                                            name="address"
                                            value={profileData.address}
                                            onChange={handleInputChange}
                                            rows="3"
                                            placeholder="House No, Street, Village/City"
                                            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    ) : (
                                        <p className="text-text-light dark:text-text-dark py-2">{profileData.address || 'Not provided'}</p>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">Pincode *</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={profileData.pincode}
                                                onChange={handleInputChange}
                                                placeholder="123456"
                                                className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        ) : (
                                            <p className="text-text-light dark:text-text-dark py-2">{profileData.pincode || 'Not provided'}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">District</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="district"
                                                value={profileData.district}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        ) : (
                                            <p className="text-text-light dark:text-text-dark py-2">{profileData.district || 'Not provided'}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">State</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="state"
                                                value={profileData.state}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        ) : (
                                            <p className="text-text-light dark:text-text-dark py-2">{profileData.state || 'Not provided'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        {isEditing && (
                            <div className="flex gap-3">
                                <button
                                    onClick={saveProfile}
                                    disabled={loading}
                                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-black font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">save</span>
                                            Save Profile
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark p-6">
                            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={startConsultation}
                                    disabled={profileData.profileCompleteness < 50}
                                    className="w-full px-4 py-3 bg-primary hover:bg-primary-hover text-black font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined">support_agent</span>
                                    Start AI Consultation
                                </button>
                                
                                <Link
                                    to="/my-schemes"
                                    className="w-full px-4 py-3 border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">assignment</span>
                                    Browse Schemes
                                </Link>
                                
                                <Link
                                    to="/applications"
                                    className="w-full px-4 py-3 border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">description</span>
                                    My Applications
                                </Link>
                            </div>
                        </div>

                        {/* Eligible Schemes */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark p-6">
                            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4">Eligible Schemes</h3>
                            {eligibleSchemes.length > 0 ? (
                                <div className="space-y-3">
                                    {eligibleSchemes.slice(0, 5).map((scheme, index) => (
                                        <div key={index} className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                                            <h4 className="font-medium text-text-light dark:text-text-dark text-sm">{scheme.name}</h4>
                                            <p className="text-xs text-primary capitalize">{scheme.category}</p>
                                        </div>
                                    ))}
                                    {eligibleSchemes.length > 5 && (
                                        <Link
                                            to="/my-schemes"
                                            className="text-primary text-sm hover:underline"
                                        >
                                            View all {eligibleSchemes.length} eligible schemes →
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <p className="text-text-light/60 dark:text-text-dark/60 text-sm">
                                    Complete your profile to see eligible schemes
                                </p>
                            )}
                        </div>

                        {/* Recent Consultations */}
                        <div className="bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark p-6">
                            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-4">Recent Consultations</h3>
                            {consultationHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {consultationHistory.slice(0, 3).map((consultation, index) => (
                                        <div key={index} className="p-3 border border-border-light dark:border-border-dark rounded-lg">
                                            <p className="font-medium text-text-light dark:text-text-dark text-sm">
                                                {consultation.call_type || 'General'} Consultation
                                            </p>
                                            <p className="text-xs text-text-light/60 dark:text-text-dark/60">
                                                {new Date(consultation.call_start).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                    <Link
                                        to="/consultations"
                                        className="text-primary text-sm hover:underline"
                                    >
                                        View all consultations →
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-text-light/60 dark:text-text-dark/60 text-sm">
                                    No consultations yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CitizenProfile;
