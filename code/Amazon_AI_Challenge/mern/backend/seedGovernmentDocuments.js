/**
 * Seed Dummy Indian Government Documents
 * This file creates realistic dummy data for testing SchemeSaarthi document verification
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schemesaarthi', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// Document Schema (if not exists)
const DocumentSchema = new mongoose.Schema({
  citizenId: String,
  documentType: String,
  documentNumber: String,
  documentData: Object,
  uploadDate: { type: Date, default: Date.now },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  extractedData: Object,
  ocrConfidence: Number,
});

const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);

// Dummy Indian Government Documents Data
const dummyDocuments = [
  // =====================================================
  // AADHAAR CARDS
  // =====================================================
  {
    citizenId: 'CIT001',
    documentType: 'aadhaar',
    documentNumber: '2345-6789-1234',
    verificationStatus: 'verified',
    ocrConfidence: 98.5,
    documentData: {
      fullName: 'Rajesh Kumar Sharma',
      dob: '15/08/1985',
      gender: 'Male',
      address: 'House No. 45, Gandhi Nagar, Jaipur, Rajasthan - 302015',
      fatherName: 'Mohan Lal Sharma',
      mobileNumber: '+91-9876543210',
    },
    extractedData: {
      fullName: 'Rajesh Kumar Sharma',
      dateOfBirth: '1985-08-15',
      age: 38,
      gender: 'Male',
      state: 'Rajasthan',
      district: 'Jaipur',
      pincode: '302015',
    }
  },
  {
    citizenId: 'CIT002',
    documentType: 'aadhaar',
    documentNumber: '3456-7890-2345',
    verificationStatus: 'verified',
    ocrConfidence: 97.2,
    documentData: {
      fullName: 'Priya Devi',
      dob: '22/03/1992',
      gender: 'Female',
      address: 'Flat 12B, Anand Vihar, Bangalore, Karnataka - 560038',
      fatherName: 'Ramesh Reddy',
      mobileNumber: '+91-9123456789',
    },
    extractedData: {
      fullName: 'Priya Devi',
      dateOfBirth: '1992-03-22',
      age: 31,
      gender: 'Female',
      state: 'Karnataka',
      district: 'Bangalore Urban',
      pincode: '560038',
    }
  },
  {
    citizenId: 'CIT003',
    documentType: 'aadhaar',
    documentNumber: '4567-8901-3456',
    verificationStatus: 'verified',
    ocrConfidence: 96.8,
    documentData: {
      fullName: 'Mohammed Abdul Kalam',
      dob: '10/12/1978',
      gender: 'Male',
      address: 'Plot No. 23, Nehru Colony, Hyderabad, Telangana - 500018',
      fatherName: 'Abdul Rahman',
      mobileNumber: '+91-9988776655',
    },
    extractedData: {
      fullName: 'Mohammed Abdul Kalam',
      dateOfBirth: '1978-12-10',
      age: 45,
      gender: 'Male',
      state: 'Telangana',
      district: 'Hyderabad',
      pincode: '500018',
    }
  },

  // =====================================================
  // INCOME CERTIFICATES
  // =====================================================
  {
    citizenId: 'CIT001',
    documentType: 'income_certificate',
    documentNumber: 'INC/RAJ/2024/12345',
    verificationStatus: 'verified',
    ocrConfidence: 95.3,
    documentData: {
      certificateNumber: 'INC/RAJ/2024/12345',
      applicantName: 'Rajesh Kumar Sharma',
      fatherName: 'Mohan Lal Sharma',
      annualIncome: '₹85,000',
      issueDate: '15/01/2024',
      issuingAuthority: 'Tehsildar, Jaipur District',
      validUntil: '14/01/2025',
    },
    extractedData: {
      annualIncome: 85000,
      incomeBracket: 'Below 1 Lakh',
      eligibleForBPL: true,
      issueDate: '2024-01-15',
      expiryDate: '2025-01-14',
    }
  },
  {
    citizenId: 'CIT002',
    documentType: 'income_certificate',
    documentNumber: 'INC/KAR/2024/23456',
    verificationStatus: 'verified',
    ocrConfidence: 94.7,
    documentData: {
      certificateNumber: 'INC/KAR/2024/23456',
      applicantName: 'Priya Devi',
      fatherName: 'Ramesh Reddy',
      annualIncome: '₹1,20,000',
      issueDate: '20/02/2024',
      issuingAuthority: 'Tahsildar, Bangalore Urban',
      validUntil: '19/02/2025',
    },
    extractedData: {
      annualIncome: 120000,
      incomeBracket: '1-2 Lakhs',
      eligibleForBPL: true,
      issueDate: '2024-02-20',
      expiryDate: '2025-02-19',
    }
  },
  {
    citizenId: 'CIT003',
    documentType: 'income_certificate',
    documentNumber: 'INC/TEL/2024/34567',
    verificationStatus: 'verified',
    ocrConfidence: 96.1,
    documentData: {
      certificateNumber: 'INC/TEL/2024/34567',
      applicantName: 'Mohammed Abdul Kalam',
      fatherName: 'Abdul Rahman',
      annualIncome: '₹65,000',
      issueDate: '10/03/2024',
      issuingAuthority: 'Revenue Officer, Hyderabad District',
      validUntil: '09/03/2025',
    },
    extractedData: {
      annualIncome: 65000,
      incomeBracket: 'Below 1 Lakh',
      eligibleForBPL: true,
      issueDate: '2024-03-10',
      expiryDate: '2025-03-09',
    }
  },

  // =====================================================
  // CASTE CERTIFICATES
  // =====================================================
  {
    citizenId: 'CIT001',
    documentType: 'caste_certificate',
    documentNumber: 'CC/RAJ/2023/98765',
    verificationStatus: 'verified',
    ocrConfidence: 97.5,
    documentData: {
      certificateNumber: 'CC/RAJ/2023/98765',
      applicantName: 'Rajesh Kumar Sharma',
      caste: 'OBC',
      subCaste: 'Kumhar',
      issueDate: '05/06/2023',
      issuingAuthority: 'District Magistrate, Jaipur',
      validityType: 'Lifetime',
    },
    extractedData: {
      caste: 'OBC',
      category: 'Other Backward Class',
      eligibleForReservation: true,
      reservationPercentage: 27,
    }
  },
  {
    citizenId: 'CIT002',
    documentType: 'caste_certificate',
    documentNumber: 'CC/KAR/2023/87654',
    verificationStatus: 'verified',
    ocrConfidence: 98.1,
    documentData: {
      certificateNumber: 'CC/KAR/2023/87654',
      applicantName: 'Priya Devi',
      caste: 'SC',
      subCaste: 'Madiga',
      issueDate: '12/07/2023',
      issuingAuthority: 'Deputy Commissioner, Bangalore Urban',
      validityType: 'Lifetime',
    },
    extractedData: {
      caste: 'SC',
      category: 'Scheduled Caste',
      eligibleForReservation: true,
      reservationPercentage: 15,
    }
  },
  {
    citizenId: 'CIT004',
    documentType: 'caste_certificate',
    documentNumber: 'CC/TEL/2023/76543',
    verificationStatus: 'verified',
    ocrConfidence: 96.8,
    documentData: {
      certificateNumber: 'CC/TEL/2023/76543',
      applicantName: 'Lakshmi Bai',
      caste: 'ST',
      subCaste: 'Gond',
      issueDate: '18/08/2023',
      issuingAuthority: 'Collector, Adilabad District',
      validityType: 'Lifetime',
    },
    extractedData: {
      caste: 'ST',
      category: 'Scheduled Tribe',
      eligibleForReservation: true,
      reservationPercentage: 7.5,
    }
  },

  // =====================================================
  // LAND RECORDS (FOR FARMERS)
  // =====================================================
  {
    citizenId: 'CIT005',
    documentType: 'land_record',
    documentNumber: 'LR/UP/2024/11111',
    verificationStatus: 'verified',
    ocrConfidence: 93.2,
    documentData: {
      recordNumber: 'LR/UP/2024/11111',
      ownerName: 'Ramesh Chand Yadav',
      village: 'Tikonia',
      district: 'Barabanki',
      state: 'Uttar Pradesh',
      landArea: '2.5 Acres',
      surveyNumber: '45/2A',
      landType: 'Agricultural',
      issueDate: '10/04/2024',
    },
    extractedData: {
      ownerName: 'Ramesh Chand Yadav',
      totalLandArea: 2.5,
      landUnit: 'Acres',
      landType: 'Agricultural',
      eligibleForFarmerSchemes: true,
    }
  },
  {
    citizenId: 'CIT006',
    documentType: 'land_record',
    documentNumber: 'LR/MH/2024/22222',
    verificationStatus: 'verified',
    ocrConfidence: 94.5,
    documentData: {
      recordNumber: 'LR/MH/2024/22222',
      ownerName: 'Santosh Patil',
      village: 'Wadgaon',
      district: 'Pune',
      state: 'Maharashtra',
      landArea: '4.2 Acres',
      surveyNumber: '78/3B',
      landType: 'Agricultural',
      issueDate: '22/05/2024',
    },
    extractedData: {
      ownerName: 'Santosh Patil',
      totalLandArea: 4.2,
      landUnit: 'Acres',
      landType: 'Agricultural',
      eligibleForFarmerSchemes: true,
    }
  },

  // =====================================================
  // BANK ACCOUNT DOCUMENTS
  // =====================================================
  {
    citizenId: 'CIT001',
    documentType: 'bank_passbook',
    documentNumber: 'SBI-12345678901',
    verificationStatus: 'verified',
    ocrConfidence: 99.1,
    documentData: {
      accountNumber: '12345678901',
      accountHolderName: 'Rajesh Kumar Sharma',
      bankName: 'State Bank of India',
      branchName: 'Jaipur Main Branch',
      ifscCode: 'SBIN0001234',
      accountType: 'Savings',
      openingDate: '10/01/2015',
    },
    extractedData: {
      hasBankAccount: true,
      accountType: 'Savings',
      bankName: 'SBI',
      ifscCode: 'SBIN0001234',
    }
  },
  {
    citizenId: 'CIT002',
    documentType: 'bank_passbook',
    documentNumber: 'HDFC-98765432101',
    verificationStatus: 'verified',
    ocrConfidence: 98.7,
    documentData: {
      accountNumber: '98765432101',
      accountHolderName: 'Priya Devi',
      bankName: 'HDFC Bank',
      branchName: 'Bangalore Koramangala',
      ifscCode: 'HDFC0002345',
      accountType: 'Savings',
      openingDate: '15/03/2018',
    },
    extractedData: {
      hasBankAccount: true,
      accountType: 'Savings',
      bankName: 'HDFC',
      ifscCode: 'HDFC0002345',
    }
  },

  // =====================================================
  // EDUCATION CERTIFICATES (MARKSHEETS)
  // =====================================================
  {
    citizenId: 'CIT007',
    documentType: 'marksheet',
    documentNumber: 'HSC/MH/2023/123456',
    verificationStatus: 'verified',
    ocrConfidence: 96.3,
    documentData: {
      certificateType: '12th Standard Marksheet',
      studentName: 'Anita Deshmukh',
      rollNumber: '123456',
      board: 'Maharashtra State Board',
      yearOfPassing: '2023',
      totalMarks: '480',
      marksObtained: '420',
      percentage: '87.5%',
      subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Marathi'],
    },
    extractedData: {
      educationLevel: '12th',
      percentage: 87.5,
      yearOfPassing: 2023,
      eligibleForScholarship: true,
    }
  },
  {
    citizenId: 'CIT008',
    documentType: 'marksheet',
    documentNumber: 'CBSE/2022/654321',
    verificationStatus: 'verified',
    ocrConfidence: 97.8,
    documentData: {
      certificateType: '10th Standard Marksheet',
      studentName: 'Rahul Verma',
      rollNumber: '654321',
      board: 'Central Board of Secondary Education (CBSE)',
      yearOfPassing: '2022',
      totalMarks: '500',
      marksObtained: '445',
      percentage: '89%',
      subjects: ['Science', 'Mathematics', 'Social Science', 'English', 'Hindi'],
    },
    extractedData: {
      educationLevel: '10th',
      percentage: 89,
      yearOfPassing: 2022,
      eligibleForScholarship: true,
    }
  },

  // =====================================================
  // RATION CARDS
  // =====================================================
  {
    citizenId: 'CIT001',
    documentType: 'ration_card',
    documentNumber: 'RC/RAJ/APL/123456',
    verificationStatus: 'verified',
    ocrConfidence: 95.6,
    documentData: {
      cardNumber: 'RC/RAJ/APL/123456',
      cardType: 'APL (Above Poverty Line)',
      headOfFamily: 'Rajesh Kumar Sharma',
      familyMembers: [
        { name: 'Rajesh Kumar Sharma', age: 38, relation: 'Self' },
        { name: 'Sunita Sharma', age: 35, relation: 'Wife' },
        { name: 'Amit Sharma', age: 12, relation: 'Son' },
        { name: 'Priya Sharma', age: 8, relation: 'Daughter' },
      ],
      issueDate: '01/01/2023',
      issuingAuthority: 'Food & Civil Supplies Department, Jaipur',
    },
    extractedData: {
      cardType: 'APL',
      familySize: 4,
      eligibleForFoodSubsidy: true,
    }
  },
  {
    citizenId: 'CIT003',
    documentType: 'ration_card',
    documentNumber: 'RC/TEL/BPL/234567',
    verificationStatus: 'verified',
    ocrConfidence: 94.8,
    documentData: {
      cardNumber: 'RC/TEL/BPL/234567',
      cardType: 'BPL (Below Poverty Line)',
      headOfFamily: 'Mohammed Abdul Kalam',
      familyMembers: [
        { name: 'Mohammed Abdul Kalam', age: 45, relation: 'Self' },
        { name: 'Fatima Begum', age: 40, relation: 'Wife' },
        { name: 'Aamir Khan', age: 15, relation: 'Son' },
        { name: 'Zara Khan', age: 10, relation: 'Daughter' },
        { name: 'Saira Khan', age: 6, relation: 'Daughter' },
      ],
      issueDate: '15/02/2023',
      issuingAuthority: 'Civil Supplies Department, Hyderabad',
    },
    extractedData: {
      cardType: 'BPL',
      familySize: 5,
      eligibleForFoodSubsidy: true,
      eligibleForPrioritySchemes: true,
    }
  },

  // =====================================================
  // DOMICILE CERTIFICATES
  // =====================================================
  {
    citizenId: 'CIT001',
    documentType: 'domicile_certificate',
    documentNumber: 'DOM/RAJ/2023/11111',
    verificationStatus: 'verified',
    ocrConfidence: 97.2,
    documentData: {
      certificateNumber: 'DOM/RAJ/2023/11111',
      applicantName: 'Rajesh Kumar Sharma',
      fatherName: 'Mohan Lal Sharma',
      state: 'Rajasthan',
      district: 'Jaipur',
      issueDate: '01/04/2023',
      issuingAuthority: 'Sub-Divisional Magistrate, Jaipur',
      validityType: 'Lifetime',
    },
    extractedData: {
      domicileState: 'Rajasthan',
      domicileDistrict: 'Jaipur',
      eligibleForStateSchemes: true,
    }
  },
  {
    citizenId: 'CIT002',
    documentType: 'domicile_certificate',
    documentNumber: 'DOM/KAR/2023/22222',
    verificationStatus: 'verified',
    ocrConfidence: 96.5,
    documentData: {
      certificateNumber: 'DOM/KAR/2023/22222',
      applicantName: 'Priya Devi',
      fatherName: 'Ramesh Reddy',
      state: 'Karnataka',
      district: 'Bangalore Urban',
      issueDate: '10/05/2023',
      issuingAuthority: 'Tahsildar, Bangalore Urban',
      validityType: 'Lifetime',
    },
    extractedData: {
      domicileState: 'Karnataka',
      domicileDistrict: 'Bangalore Urban',
      eligibleForStateSchemes: true,
    }
  },

  // =====================================================
  // DISABILITY CERTIFICATES
  // =====================================================
  {
    citizenId: 'CIT009',
    documentType: 'disability_certificate',
    documentNumber: 'DC/GUJ/2023/55555',
    verificationStatus: 'verified',
    ocrConfidence: 95.8,
    documentData: {
      certificateNumber: 'DC/GUJ/2023/55555',
      applicantName: 'Suresh Patel',
      typeOfDisability: 'Locomotor Disability',
      percentageOfDisability: '65%',
      issueDate: '20/06/2023',
      issuingAuthority: 'Medical Board, Ahmedabad Civil Hospital',
      validUntil: '19/06/2028',
    },
    extractedData: {
      hasDisability: true,
      disabilityType: 'Locomotor',
      disabilityPercentage: 65,
      eligibleForDisabilitySchemes: true,
    }
  },
];

// Seed function
const seedDocuments = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing documents...');
    await Document.deleteMany({});
    
    console.log('📄 Seeding dummy government documents...');
    await Document.insertMany(dummyDocuments);
    
    console.log(`✅ Successfully seeded ${dummyDocuments.length} government documents!`);
    console.log('\n📊 Document Types Seeded:');
    console.log('  - Aadhaar Cards: 3');
    console.log('  - Income Certificates: 3');
    console.log('  - Caste Certificates: 3');
    console.log('  - Land Records: 2');
    console.log('  - Bank Passbooks: 2');
    console.log('  - Education Marksheets: 2');
    console.log('  - Ration Cards: 2');
    console.log('  - Domicile Certificates: 2');
    console.log('  - Disability Certificates: 1');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding documents:', error);
    process.exit(1);
  }
};

// Run seeder
seedDocuments();
