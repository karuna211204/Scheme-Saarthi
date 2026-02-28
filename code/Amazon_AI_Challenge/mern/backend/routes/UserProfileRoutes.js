const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Get user profile
router.get('/', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            profile: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching profile' 
        });
    }
});

// Update user profile (comprehensive)
router.put('/', authenticate, async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            dateOfBirth,
            age,
            gender,
            aadhaarNumber,
            fatherName,
            address,
            pincode,
            district,
            state,
            annualIncome,
            occupation,
            employmentType,
            familySize,
            dependents,
            category,
            disability,
            bankAccountNumber,
            ifscCode,
            panNumber,
            educationLevel,
            landOwnership,
            hasRationCard,
            rationCardNumber,
            verificationStatus
        } = req.body;

        const updateData = {};
        
        // Basic Information
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
        if (age) updateData.age = parseInt(age);
        if (gender) updateData.gender = gender;
        
        // Aadhaar Details
        if (aadhaarNumber) updateData.aadhaarNumber = aadhaarNumber;
        if (fatherName) updateData.fatherName = fatherName;
        
        // Address Information
        if (address) updateData.address = address;
        if (pincode) updateData.pincode = pincode;
        if (district) updateData.district = district;
        if (state) updateData.state = state;
        
        // Economic Information
        if (annualIncome) updateData.annualIncome = parseInt(annualIncome);
        if (occupation) updateData.occupation = occupation;
        if (employmentType) updateData.employmentType = employmentType;
        
        // Family Information
        if (familySize) updateData.familySize = parseInt(familySize);
        if (dependents) updateData.dependents = parseInt(dependents);
        
        // Category Information
        if (category) updateData.category = category;
        if (disability) updateData.disability = disability;
        
        // Financial Information
        if (bankAccountNumber) updateData.bankAccountNumber = bankAccountNumber;
        if (ifscCode) updateData.ifscCode = ifscCode;
        if (panNumber) updateData.panNumber = panNumber;
        
        // Additional Information
        if (educationLevel) updateData.educationLevel = educationLevel;
        if (landOwnership) updateData.landOwnership = landOwnership;
        if (hasRationCard !== undefined) updateData.hasRationCard = hasRationCard;
        if (rationCardNumber) updateData.rationCardNumber = rationCardNumber;
        
        // Verification Status
        if (verificationStatus) updateData.verificationStatus = verificationStatus;
        
        // Calculate profile completeness
        const requiredFields = [
            'name', 'phone', 'dateOfBirth', 'gender', 'aadhaarNumber',
            'address', 'pincode', 'annualIncome', 'occupation', 'category'
        ];
        
        const user = await User.findById(req.user.id);
        const filledFields = requiredFields.filter(field => 
            updateData[field] || user[field]
        );
        updateData.profileCompleteness = Math.round((filledFields.length / requiredFields.length) * 100);
        
        // Update last modification timestamp
        updateData.lastProfileUpdate = new Date();

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation error',
                errors 
            });
        }
        
        // Handle duplicate key errors (e.g., unique email/phone)
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ 
                success: false, 
                message: `${field} already exists. Please use a different ${field}.` 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating profile' 
        });
    }
});

// Update OCR extracted data
router.post('/ocr-update', authenticate, async (req, res) => {
    try {
        const {
            aadhaarNumber,
            name,
            fatherName,
            dateOfBirth,
            gender,
            address,
            pincode
        } = req.body;

        const updateData = {
            lastOcrUpdate: new Date()
        };

        // Only update fields that were successfully extracted
        if (aadhaarNumber) {
            updateData.aadhaarNumber = aadhaarNumber;
            updateData['verificationStatus.aadhaar'] = true;
        }
        if (name) updateData.name = name;
        if (fatherName) updateData.fatherName = fatherName;
        if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
        if (gender) updateData.gender = gender;
        if (address) updateData.address = address;
        if (pincode) updateData.pincode = pincode;

        // Calculate age if date of birth is provided
        if (dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            updateData.age = age;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            message: 'OCR data updated successfully',
            profile: updatedUser,
            extractedFields: Object.keys(req.body).filter(key => req.body[key])
        });

    } catch (error) {
        console.error('OCR update error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating OCR data' 
        });
    }
});

// Get eligible schemes based on profile
router.get('/eligible-schemes', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Load schemes data
        const fs = require('fs');
        const path = require('path');
        const schemesPath = path.join(__dirname, '../data/schemes.json');
        
        if (!fs.existsSync(schemesPath)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Schemes data not found' 
            });
        }

        const schemesData = JSON.parse(fs.readFileSync(schemesPath, 'utf8'));
        const eligibleSchemes = [];

        // Scheme eligibility logic
        schemesData.schemes.forEach(scheme => {
            let isEligible = true;
            let eligibilityScore = 0;

            // Age-based eligibility
            if (scheme.eligibility.age && user.age) {
                const ageRange = scheme.eligibility.age;
                if (ageRange.min && user.age < ageRange.min) isEligible = false;
                if (ageRange.max && user.age > ageRange.max) isEligible = false;
                if (isEligible) eligibilityScore += 20;
            }

            // Income-based eligibility
            if (scheme.eligibility.income && user.annualIncome) {
                const incomeLimit = scheme.eligibility.income.max;
                if (incomeLimit && user.annualIncome > incomeLimit) isEligible = false;
                if (isEligible) eligibilityScore += 30;
            }

            // Gender-based schemes
            if (scheme.eligibility.gender) {
                if (scheme.eligibility.gender !== user.gender && scheme.eligibility.gender !== 'All') {
                    isEligible = false;
                } else {
                    eligibilityScore += 15;
                }
            }

            // Category-based schemes
            if (scheme.eligibility.category && user.category) {
                if (!scheme.eligibility.category.includes(user.category)) {
                    isEligible = false;
                } else {
                    eligibilityScore += 20;
                }
            }

            // Occupation-based schemes
            if (scheme.eligibility.occupation && user.occupation) {
                if (!scheme.eligibility.occupation.includes(user.occupation)) {
                    isEligible = false;
                } else {
                    eligibilityScore += 15;
                }
            }

            if (isEligible) {
                eligibleSchemes.push({
                    ...scheme,
                    eligibilityScore,
                    matchedCriteria: []
                });
            }
        });

        // Sort by eligibility score (descending)
        eligibleSchemes.sort((a, b) => b.eligibilityScore - a.eligibilityScore);

        res.json({
            success: true,
            totalSchemes: eligibleSchemes.length,
            schemes: eligibleSchemes,
            userProfile: {
                age: user.age,
                income: user.annualIncome,
                gender: user.gender,
                category: user.category,
                occupation: user.occupation,
                profileCompleteness: user.profileCompleteness || 0
            }
        });

    } catch (error) {
        console.error('Eligible schemes error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching eligible schemes' 
        });
    }
});

// Get profile completion suggestions
router.get('/completion-suggestions', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const requiredFields = [
            { field: 'name', label: 'Full Name', priority: 'High' },
            { field: 'phone', label: 'Mobile Number', priority: 'High' },
            { field: 'dateOfBirth', label: 'Date of Birth', priority: 'High' },
            { field: 'gender', label: 'Gender', priority: 'High' },
            { field: 'aadhaarNumber', label: 'Aadhaar Number', priority: 'High' },
            { field: 'address', label: 'Address', priority: 'Medium' },
            { field: 'pincode', label: 'Pincode', priority: 'Medium' },
            { field: 'annualIncome', label: 'Annual Income', priority: 'High' },
            { field: 'occupation', label: 'Occupation', priority: 'High' },
            { field: 'category', label: 'Category', priority: 'Medium' },
            { field: 'bankAccountNumber', label: 'Bank Account', priority: 'Low' },
            { field: 'educationLevel', label: 'Education Level', priority: 'Low' }
        ];

        const missingFields = requiredFields.filter(item => 
            !user[item.field] || user[item.field] === ''
        );

        const filledFields = requiredFields.length - missingFields.length;
        const completionPercentage = Math.round((filledFields / requiredFields.length) * 100);

        const suggestions = missingFields.map(field => ({
            ...field,
            action: field.field === 'aadhaarNumber' ? 'Use Aadhaar OCR to scan and fill automatically' : 'Please fill this information'
        }));

        res.json({
            success: true,
            completionPercentage,
            totalFields: requiredFields.length,
            filledFields,
            missingFields: missingFields.length,
            suggestions,
            canAccessFullFeatures: completionPercentage >= 50
        });

    } catch (error) {
        console.error('Profile completion suggestions error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching completion suggestions' 
        });
    }
});

module.exports = router;