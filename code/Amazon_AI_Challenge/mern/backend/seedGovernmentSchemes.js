/**
 * Seed Comprehensive Government Schemes Data
 * This file creates realistic Indian government schemes for SchemeSaarthi
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

// Scheme Schema
const SchemeSchema = new mongoose.Schema({
  schemeId: String,
  schemeName: String,
  schemeNameHindi: String,
  category: String,
  department: String,
  governmentLevel: String,
  description: String,
  descriptionHindi: String,
  benefits: [String],
  eligibilityCriteria: {
    age: { min: Number, max: Number },
    gender: [String],
    income: { max: Number },
    caste: [String],
    education: String,
    landOwnership: Boolean,
    disability: Boolean,
    maritalStatus: String,
    state: [String],
  },
  requiredDocuments: [String],
  applicationProcess: [String],
  applicationDeadline: String,
  contactInfo: {
    website: String,
    helpline: String,
    email: String,
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Scheme = mongoose.models.Scheme || mongoose.model('Scheme', SchemeSchema);

// Comprehensive Government Schemes Data
const governmentSchemes = [
  // =====================================================
  // PRADHAN MANTRI SCHEMES (CENTRAL)
  // =====================================================
  {
    schemeId: 'PM-KISAN-001',
    schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    schemeNameHindi: 'प्रधानमंत्री किसान सम्मान निधि',
    category: 'Agriculture',
    department: 'Ministry of Agriculture & Farmers Welfare',
    governmentLevel: 'Central',
    description: 'PM-KISAN provides income support of ₹6,000 per year to all farmer families across the country in three equal installments of ₹2,000 each every four months.',
    descriptionHindi: 'पीएम-किसान देश भर के सभी किसान परिवारों को हर चार महीने में ₹2,000 की तीन समान किस्तों में ₹6,000 प्रति वर्ष की आय सहायता प्रदान करता है।',
    benefits: [
      '₹6,000 annual income support',
      'Direct Benefit Transfer (DBT) to bank account',
      'Three installments of ₹2,000 each',
      'No application fee',
    ],
    eligibilityCriteria: {
      age: { min: 18, max: 100 },
      gender: ['Male', 'Female', 'Other'],
      income: { max: null },
      caste: ['General', 'OBC', 'SC', 'ST'],
      landOwnership: true,
      state: ['All States'],
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Land Ownership Records',
      'Bank Account Details',
      'Mobile Number',
    ],
    applicationProcess: [
      'Visit PM-KISAN portal or nearest CSC',
      'Fill registration form with Aadhaar',
      'Upload land records',
      'Submit bank account details',
      'Receive confirmation SMS',
    ],
    applicationDeadline: 'Open throughout the year',
    contactInfo: {
      website: 'https://pmkisan.gov.in',
      helpline: '155261 / 011-24300606',
      email: 'pmkisan-ict@gov.in',
    },
    isActive: true,
  },

  {
    schemeId: 'PM-AWAS-002',
    schemeName: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
    schemeNameHindi: 'प्रधानमंत्री आवास योजना - ग्रामीण',
    category: 'Housing',
    department: 'Ministry of Rural Development',
    governmentLevel: 'Central',
    description: 'PMAY-G aims to provide assistance for construction of pucca houses to all houseless and households living in dilapidated houses in rural areas.',
    descriptionHindi: 'पीएमएवाई-जी का उद्देश्य ग्रामीण क्षेत्रों में सभी बेघर और जर्जर घरों में रहने वाले परिवारों को पक्के मकान बनाने के लिए सहायता प्रदान करना है।',
    benefits: [
      '₹1,20,000 for plain areas',
      '₹1,30,000 for hilly/difficult areas',
      '90/10 cost sharing between Centre and State',
      'Assistance for toilet, electricity, LPG connection',
    ],
    eligibilityCriteria: {
      age: { min: 18, max: 100 },
      gender: ['Male', 'Female', 'Other'],
      income: { max: 100000 },
      caste: ['General', 'OBC', 'SC', 'ST'],
      state: ['All States'],
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Income Certificate',
      'Bank Account Details',
      'BPL/AAY Ration Card',
      'Landholding Documents',
    ],
    applicationProcess: [
      'Registration through Gram Panchayat',
      'Verification by Block Development Officer',
      'Approval from District Rural Development Agency',
      'Installment-based payment upon construction progress',
    ],
    applicationDeadline: 'Open (subject to availability)',
    contactInfo: {
      website: 'https://pmayg.nic.in',
      helpline: '1800-11-6446',
      email: 'support-pmayg@gov.in',
    },
    isActive: true,
  },

  {
    schemeId: 'PM-UJJWALA-003',
    schemeName: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
    schemeNameHindi: 'प्रधानमंत्री उज्ज्वला योजना',
    category: 'Energy',
    department: 'Ministry of Petroleum & Natural Gas',
    governmentLevel: 'Central',
    description: 'PMUY provides LPG connections to women from Below Poverty Line (BPL) households to ensure clean cooking fuel.',
    descriptionHindi: 'पीएमयूवाई स्वच्छ खाना पकाने के ईंधन को सुनिश्चित करने के लिए गरीबी रेखा से नीचे (बीपीएल) परिवारों की महिलाओं को एलपीजी कनेक्शन प्रदान करती है।',
    benefits: [
      'Free LPG connection',
      '₹1,600 assistance for connection',
      'EMI facility for stove and cylinder',
      'First refill free in some cases',
    ],
    eligibilityCriteria: {
      age: { min: 18, max: 100 },
      gender: ['Female'],
      income: { max: 100000 },
      caste: ['General', 'OBC', 'SC', 'ST'],
      state: ['All States'],
    },
    requiredDocuments: [
      'BPL Ration Card / SECC-2011 data',
      'Aadhaar Card',
      'Bank Account Details',
      'Address Proof',
      'Photo ID',
    ],
    applicationProcess: [
      'Visit nearest LPG distributor',
      'Fill PMUY application form',
      'Submit documents',
      'Get connection installed at home',
    ],
    applicationDeadline: 'Open throughout the year',
    contactInfo: {
      website: 'https://www.pmuy.gov.in',
      helpline: '1906',
      email: 'contact-pmuy@gov.in',
    },
    isActive: true,
  },

  // =====================================================
  // EDUCATION SCHEMES
  // =====================================================
  {
    schemeId: 'NSP-SC-004',
    schemeName: 'National Scholarship Portal - SC/ST Pre-Matric Scholarship',
    schemeNameHindi: 'राष्ट्रीय छात्रवृत्ति पोर्टल - एससी/एसटी प्री-मैट्रिक छात्रवृत्ति',
    category: 'Education',
    department: 'Ministry of Social Justice & Empowerment',
    governmentLevel: 'Central',
    description: 'Provides financial assistance to SC/ST students studying in classes 9 and 10 to encourage them to pursue education.',
    descriptionHindi: 'एससी/एसटी छात्रों को कक्षा 9 और 10 में पढ़ाई करने के लिए वित्तीय सहायता प्रदान करती है ताकि उन्हें शिक्षा जारी रखने के लिए प्रोत्साहित किया जा सके।',
    benefits: [
      'Day scholar: ₹225 per month (Class 9-10)',
      'Hostel: ₹525 per month',
      'Books and stationery allowance',
      'Reimbursement of admission/tuition fees',
    ],
    eligibilityCriteria: {
      age: { min: 13, max: 18 },
      gender: ['Male', 'Female', 'Other'],
      income: { max: 250000 },
      caste: ['SC', 'ST'],
      education: 'Class 9-10',
      state: ['All States'],
    },
    requiredDocuments: [
      'Caste Certificate',
      'Income Certificate',
      'Marksheet of previous class',
      'Aadhaar Card',
      'Bank Account Details',
      'School Bonafide',
    ],
    applicationProcess: [
      'Register on National Scholarship Portal (NSP)',
      'Fill application form',
      'Upload required documents',
      'Institute verification',
      'Receive scholarship via DBT',
    ],
    applicationDeadline: 'October 31 (annually)',
    contactInfo: {
      website: 'https://scholarships.gov.in',
      helpline: '0120-6619540',
      email: 'helpdesk@nsp.gov.in',
    },
    isActive: true,
  },

  {
    schemeId: 'NSP-OBC-005',
    schemeName: 'Post-Matric Scholarship for OBC Students',
    schemeNameHindi: 'ओबीसी छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति',
    category: 'Education',
    department: 'Ministry of Social Justice & Empowerment',
    governmentLevel: 'Central',
    description: 'Financial assistance for OBC students pursuing higher education (11th onwards) to reduce dropout rates.',
    descriptionHindi: 'उच्च शिक्षा (11वीं से आगे) करने वाले ओबीसी छात्रों के लिए वित्तीय सहायता ताकि ड्रॉपआउट दर को कम किया जा सके।',
    benefits: [
      'Tuition fee reimbursement',
      'Maintenance allowance: ₹230-1,200/month',
      'Book allowance',
      'Study tour expenses',
    ],
    eligibilityCriteria: {
      age: { min: 16, max: 35 },
      gender: ['Male', 'Female', 'Other'],
      income: { max: 100000 },
      caste: ['OBC'],
      education: 'Class 11 onwards',
      state: ['All States'],
    },
    requiredDocuments: [
      'OBC Certificate',
      'Income Certificate',
      'Previous year marksheet',
      'Aadhaar Card',
      'Bank Account Details',
      'Fee receipt',
    ],
    applicationProcess: [
      'Apply online on NSP portal',
      'Upload documents',
      'Institute verification',
      'State government approval',
      'DBT to student account',
    ],
    applicationDeadline: 'November 15 (annually)',
    contactInfo: {
      website: 'https://scholarships.gov.in',
      helpline: '0120-6619540',
      email: 'obc-scholarship@gov.in',
    },
    isActive: true,
  },

  // =====================================================
  // WOMEN EMPOWERMENT SCHEMES
  // =====================================================
  {
    schemeId: 'MUDRA-006',
    schemeName: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    schemeNameHindi: 'प्रधानमंत्री मुद्रा योजना',
    category: 'Women Empowerment',
    department: 'Ministry of Finance',
    governmentLevel: 'Central',
    description: 'Provides loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises for income-generating activities.',
    descriptionHindi: 'आय-सृजन गतिविधियों के लिए गैर-कॉर्पोरेट, गैर-कृषि लघु/सूक्ष्म उद्यमों को ₹10 लाख तक का ऋण प्रदान करता है।',
    benefits: [
      'Shishu: Loans up to ₹50,000',
      'Kishore: Loans from ₹50,001 to ₹5 lakh',
      'Tarun: Loans from ₹5 lakh to ₹10 lakh',
      'No collateral required',
    ],
    eligibilityCriteria: {
      age: { min: 18, max: 65 },
      gender: ['Male', 'Female', 'Other'],
      income: { max: null },
      caste: ['General', 'OBC', 'SC', 'ST'],
      state: ['All States'],
    },
    requiredDocuments: [
      'Aadhaar Card',
      'PAN Card',
      'Business plan',
      'Bank Account Details',
      'Address Proof',
      'Photo ID',
    ],
    applicationProcess: [
      'Approach any bank or NBFC',
      'Fill MUDRA loan application',
      'Submit business plan and documents',
      'Bank assessment and approval',
      'Loan disbursement',
    ],
    applicationDeadline: 'Open throughout the year',
    contactInfo: {
      website: 'https://www.mudra.org.in',
      helpline: '1800-180-11-11',
      email: 'mudra.helpdesk@sidbi.in',
    },
    isActive: true,
  },

  // =====================================================
  // HEALTHCARE SCHEMES
  // =====================================================
  {
    schemeId: 'AYUSHMAN-007',
    schemeName: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
    schemeNameHindi: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
    category: 'Healthcare',
    department: 'Ministry of Health & Family Welfare',
    governmentLevel: 'Central',
    description: 'World\'s largest health insurance scheme providing health cover of ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
    descriptionHindi: 'दुनिया की सबसे बड़ी स्वास्थ्य बीमा योजना जो द्वितीयक और तृतीयक देखभाल अस्पताल में भर्ती के लिए प्रति परिवार प्रति वर्ष ₹5 लाख का स्वास्थ्य कवर प्रदान करती है।',
    benefits: [
      '₹5 lakh annual health cover per family',
      'Covers 1,393 procedures',
      'Free treatment at empaneled hospitals',
      'Cashless and paperless',
      'Pre and post-hospitalization expenses covered',
    ],
    eligibilityCriteria: {
      age: { min: 0, max: 100 },
      gender: ['Male', 'Female', 'Other'],
      income: { max: null },
      caste: ['General', 'OBC', 'SC', 'ST'],
      state: ['All States'],
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Ration Card (BPL/AAY)',
      'SECC-2011 data verification',
      'Mobile Number',
    ],
    applicationProcess: [
      'Check eligibility on PMJAY website',
      'Visit nearest CSC with Aadhaar',
      'Get Ayushman Card printed',
      'Use at empaneled hospitals',
    ],
    applicationDeadline: 'Open - enroll anytime',
    contactInfo: {
      website: 'https://pmjay.gov.in',
      helpline: '14555',
      email: 'pmjay@nha.gov.in',
    },
    isActive: true,
  },

  // =====================================================
  // SENIOR CITIZEN SCHEMES
  // =====================================================
  {
    schemeId: 'IGNOAPS-008',
    schemeName: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
    schemeNameHindi: 'इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना',
    category: 'Senior Citizens',
    department: 'Ministry of Rural Development',
    governmentLevel: 'Central',
    description: 'Provides pension to senior citizens living below the poverty line to ensure income security in old age.',
    descriptionHindi: 'वृद्धावस्था में आय सुरक्षा सुनिश्चित करने के लिए गरीबी रेखा से नीचे रहने वाले वरिष्ठ नागरिकों को पेंशन प्रदान करती है।',
    benefits: [
      '₹300/month for 60-79 years',
      '₹500/month for 80+ years',
      'Additional state pension (varies)',
      'Direct DBT to bank account',
    ],
    eligibilityCriteria: {
      age: { min: 60, max: 150 },
      gender: ['Male', 'Female', 'Other'],
      income: { max: 100000 },
      caste: ['General', 'OBC', 'SC', 'ST'],
      state: ['All States'],
    },
    requiredDocuments: [
      'Age Proof (Birth Certificate/Aadhaar)',
      'Income Certificate',
      'BPL Certificate',
      'Bank Account Details',
      'Aadhaar Card',
    ],
    applicationProcess: [
      'Apply through Gram Panchayat/Municipal Office',
      'Submit documents',
      'Verification by local authorities',
      'Approval and DBT activation',
    ],
    applicationDeadline: 'Open throughout the year',
    contactInfo: {
      website: 'https://nsap.nic.in',
      helpline: 'State-specific',
      email: 'nsap@gov.in',
    },
    isActive: true,
  },

  // =====================================================
  // DISABILITY SCHEMES
  // =====================================================
  {
    schemeId: 'IGNDPS-009',
    schemeName: 'Indira Gandhi National Disability Pension Scheme (IGNDPS)',
    schemeNameHindi: 'इंदिरा गांधी राष्ट्रीय विकलांगता पेंशन योजना',
    category: 'Differently Abled',
    department: 'Ministry of Rural Development',
    governmentLevel: 'Central',
    description: 'Provides monthly pension to persons with severe or multiple disabilities living below poverty line.',
    descriptionHindi: 'गरीबी रेखा से नीचे रहने वाले गंभीर या एकाधिक विकलांगता वाले व्यक्तियों को मासिक पेंशन प्रदान करती है।',
    benefits: [
      '₹300/month for 18-79 years',
      '₹500/month for 80+ years',
      'Additional state benefits',
      'Direct bank transfer',
    ],
    eligibilityCriteria: {
      age: { min: 18, max: 100 },
      gender: ['Male', 'Female', 'Other'],
      income: { max: 100000 },
      caste: ['General', 'OBC', 'SC', 'ST'],
      disability: true,
      state: ['All States'],
    },
    requiredDocuments: [
      'Disability Certificate (min 80% disability)',
      'Income Certificate',
      'BPL Certificate',
      'Aadhaar Card',
      'Bank Account Details',
      'Age Proof',
    ],
    applicationProcess: [
      'Apply through local authorities',
      'Medical board verification of disability',
      'Document verification',
      'Pension approval and DBT',
    ],
    applicationDeadline: 'Open throughout the year',
    contactInfo: {
      website: 'https://nsap.nic.in',
      helpline: 'State-specific',
      email: 'disability-pension@gov.in',
    },
    isActive: true,
  },

  // =====================================================
  // EMPLOYMENT & SKILL DEVELOPMENT
  // =====================================================
  {
    schemeId: 'PMKVY-010',
    schemeName: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
    schemeNameHindi: 'प्रधानमंत्री कौशल विकास योजना',
    category: 'Skill Development',
    department: 'Ministry of Skill Development & Entrepreneurship',
    governmentLevel: 'Central',
    description: 'Flagship scheme to provide skill training to youth and make them employable by providing industry-relevant certification.',
    descriptionHindi: 'युवाओं को कौशल प्रशिक्षण प्रदान करने और उद्योग-प्रासंगिक प्रमाणन प्रदान करके उन्हें रोजगार योग्य बनाने की प्रमुख योजना।',
    benefits: [
      'Free skill training',
      'Industry-recognized certification',
      'Monetary reward upon certification',
      'Placement assistance',
      '200+ skill courses',
    ],
    eligibilityCriteria: {
      age: { min: 15, max: 45 },
      gender: ['Male', 'Female', 'Other'],
      income: { max: null },
      caste: ['General', 'OBC', 'SC', 'ST'],
      education: 'Class 8 pass',
      state: ['All States'],
    },
    requiredDocuments: [
      'Aadhaar Card',
      'Educational certificates',
      'Bank Account Details',
      'Passport size photo',
    ],
    applicationProcess: [
      'Visit PMKVY portal or training center',
      'Enroll in desired course',
      'Complete training',
      'Appear for assessment',
      'Receive certificate and reward',
    ],
    applicationDeadline: 'Continuous enrollment',
    contactInfo: {
      website: 'https://www.pmkvyofficial.org',
      helpline: '08800055555',
      email: 'pmkvy@nsdcindia.org',
    },
    isActive: true,
  },
];

// Seed function
const seedSchemes = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing schemes...');
    await Scheme.deleteMany({});
    
    console.log('📋 Seeding government schemes...');
    await Scheme.insertMany(governmentSchemes);
    
    console.log(`✅ Successfully seeded ${governmentSchemes.length} government schemes!`);
    console.log('\n📊 Scheme Categories Seeded:');
    console.log('  - Agriculture: 1 (PM-KISAN)');
    console.log('  - Housing: 1 (PMAY-G)');
    console.log('  - Energy: 1 (PMUY)');
    console.log('  - Education: 2 (SC/ST, OBC Scholarships)');
    console.log('  - Women Empowerment: 1 (MUDRA)');
    console.log('  - Healthcare: 1 (Ayushman Bharat)');
    console.log('  - Senior Citizens: 1 (IGNOAPS)');
    console.log('  - Differently Abled: 1 (IGNDPS)');
    console.log('  - Skill Development: 1 (PMKVY)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding schemes:', error);
    process.exit(1);
  }
};

// Run seeder
seedSchemes();
