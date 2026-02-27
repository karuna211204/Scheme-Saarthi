const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');

// Sample Government Schemes for Testing
const sampleSchemes = [
  {
    scheme_id: 'PM-KISAN',
    scheme_name: 'Pradhan Mantri Kisan Samman Nidhi',
    scheme_name_hindi: 'प्रधानमंत्री किसान सम्मान निधि',
    scheme_name_regional: 'ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి',
    ministry_department: 'Ministry of Agriculture and Farmers Welfare',
    scheme_type: 'Central',
    category: 'Agriculture',
    description: 'Direct income support of ₹6,000 per year to all farmer families across India in three equal installments of ₹2,000 each.',
    description_hindi: 'भारत भर के सभी किसान परिवारों को ₹6,000 प्रति वर्ष की प्रत्यक्ष आय सहायता, तीन समान किस्तों में ₹2,000 प्रत्येक।',
    description_regional: 'భారతదేశంలో అన్ని రైతు కుటుంబాలకు సంవత్సరానికి ₹6,000 ప్రత్యక్ష ఆదాయ మద్దతు',
    benefit_amount: 6000,
    benefit_type: 'Cash Transfer',
    benefit_description: '₹6,000 per year in three installments directly to bank account',
    eligibility: {
      min_age: 18,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['farmer', 'agricultural_worker'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Must own cultivable land. Land ownership certificates required.'
    },
    required_documents: ['Aadhaar Card', 'Bank Account Details', 'Land Ownership Documents'],
    application_process: 'Apply online at pmkisan.gov.in or visit nearest Common Service Center (CSC). Verification by local revenue officials.',
    application_url: 'https://pmkisan.gov.in/',
    helpline_number: '155261 / 011-24300606',
    application_deadline: null,
    processing_time_days: 30,
    is_active: true,
    tags: ['agriculture', 'farmer', 'income support', 'central scheme', 'direct benefit transfer']
  },
  {
    scheme_id: 'AYUSHMAN-BHARAT',
    scheme_name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    scheme_name_hindi: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
    scheme_name_regional: 'ఆయుష్మాన్ భారత్ - PM-JAY',
    ministry_department: 'Ministry of Health and Family Welfare',
    scheme_type: 'Central',
    category: 'Health',
    description: 'Provides health insurance coverage of ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
    description_hindi: 'माध्यमिक और तृतीयक देखभाल अस्पताल में भर्ती के लिए प्रति परिवार ₹5 लाख प्रति वर्ष का स्वास्थ्य बीमा कवरेज प्रदान करता है।',
    benefit_amount: 500000,
    benefit_type: 'Insurance',
    benefit_description: '₹5 lakh health insurance cover per family per year',
    eligibility: {
      min_age: null,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Based on SECC 2011 data. Must be from economically weaker sections.'
    },
    required_documents: ['Aadhaar Card', 'Ration Card', 'SECC 2011 verification'],
    application_process: 'Check eligibility at pmjay.gov.in. Generate Ayushman card from nearest Ayushman Mitra or CSC.',
    application_url: 'https://pmjay.gov.in/',
    helpline_number: '14555',
    application_deadline: null,
    processing_time_days: 7,
    is_active: true,
    tags: ['health', 'insurance', 'hospitalization', 'BPL', 'free treatment']
  },
  {
    scheme_id: 'PMAY-G',
    scheme_name: 'Pradhan Mantri Awas Yojana - Gramin (Rural)',
    scheme_name_hindi: 'प्रधानमंत्री आवास योजना - ग्रामीण',
    scheme_name_regional: 'ప్రధాన మంత్రి ఆవాస్ యోజన - గ్రామీణ',
    ministry_department: 'Ministry of Rural Development',
    scheme_type: 'Central',
    category: 'Housing',
    description: 'Provides financial assistance of ₹1.2 lakh (plain areas) or ₹1.3 lakh (hilly states) for construction of pucca house.',
    description_hindi: 'पक्का घर के निर्माण के लिए ₹1.2 लाख (मैदानी क्षेत्र) या ₹1.3 लाख (पहाड़ी राज्य) की वित्तीय सहायता प्रदान करता है।',
    benefit_amount: 120000,
    benefit_type: 'Subsidy',
    benefit_description: '₹1.2 lakh to ₹1.3 lakh for house construction',
    eligibility: {
      min_age: 18,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['Rural Areas'],
      education_level: null,
      other_criteria: 'Must not own a pucca house. Priority to SC/ST, minorities, and women-headed households.'
    },
    required_documents: ['Aadhaar Card', 'Bank Account', 'Income Certificate', 'Caste Certificate (if applicable)', 'Land Documents'],
    application_process: 'Apply through Gram Panchayat. Verification by local authorities.',
    application_url: 'https://pmayg.nic.in/',
    helpline_number: '1800-11-6446',
    application_deadline: null,
    processing_time_days: 90,
    is_active: true,
    tags: ['housing', 'rural', 'subsidy', 'construction', 'pucca house']
  },
  {
    scheme_id: 'NSP-SC-ST',
    scheme_name: 'National Scholarship Portal - SC/ST Students',
    scheme_name_hindi: 'राष्ट्रीय छात्रवृत्ति पोर्टल - SC/ST छात्र',
    scheme_name_regional: 'జాతీయ స్కాలర్‌షిప్ పోర్టల్ - SC/ST విద్యార్థులు',
    ministry_department: 'Ministry of Social Justice and Empowerment',
    scheme_type: 'Central',
    category: 'Education',
    description: 'Provides scholarships to SC/ST students studying in classes 9-12 and pursuing higher education.',
    description_hindi: 'कक्षा 9-12 में पढ़ने वाले और उच्च शिक्षा प्राप्त करने वाले SC/ST छात्रों को छात्रवृत्ति प्रदान करता है।',
    benefit_amount: 20000,
    benefit_type: 'Scholarship',
    benefit_description: 'Up to ₹20,000 per year for post-matric studies',
    eligibility: {
      min_age: 14,
      max_age: 30,
      gender: 'All',
      income_limit: 250000,
      caste_category: ['SC', 'ST'],
      occupation: ['student'],
      location: ['All States'],
      education_level: 'Class 9 and above',
      other_criteria: 'Must have passed previous examination. Minimum 50% attendance required.'
    },
    required_documents: ['Aadhaar Card', 'Caste Certificate', 'Income Certificate', 'Previous Year Marksheet', 'Bank Account', 'Bonafide Certificate'],
    application_process: 'Apply online at scholarships.gov.in. Upload all required documents. Institute verification required.',
    application_url: 'https://scholarships.gov.in/',
    helpline_number: '0120-6619540',
    application_deadline: new Date('2025-12-31'),
    processing_time_days: 60,
    is_active: true,
    tags: ['education', 'scholarship', 'SC', 'ST', 'students', 'post-matric']
  },
  {
    scheme_id: 'OLDAGE-PENSION',
    scheme_name: 'National Old Age Pension Scheme (Indira Gandhi NOAPS)',
    scheme_name_hindi: 'राष्ट्रीय वृद्धावस्था पेंशन योजना (इंदिरा गांधी)',
    scheme_name_regional: 'జాతీయ వృద్ధాప్య పెన్షన్ పథకం',
    ministry_department: 'Ministry of Rural Development',
    scheme_type: 'Central',
    category: 'Social Welfare',
    description: 'Provides monthly pension to elderly persons aged 60+ living below poverty line.',
    description_hindi: 'गरीबी रेखा से नीचे रहने वाले 60+ वर्ष के बुजुर्ग व्यक्तियों को मासिक पेंशन प्रदान करता है।',
    benefit_amount: 600,
    benefit_type: 'Cash Transfer',
    benefit_description: '₹200-500 per month (varies by state), ₹500 for 80+ age',
    eligibility: {
      min_age: 60,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Must be BPL (Below Poverty Line). No regular source of income.'
    },
    required_documents: ['Aadhaar Card', 'Age Proof (Birth Certificate/School Certificate)', 'BPL Card', 'Bank Account', 'Income Certificate'],
    application_process: 'Apply at nearest Gram Panchayat or Municipal Office. Provide BPL certificate and age proof.',
    application_url: 'Contact local Panchayat office',
    helpline_number: 'State-specific',
    application_deadline: null,
    processing_time_days: 45,
    is_active: true,
    tags: ['pension', 'senior citizen', 'elderly', 'BPL', 'social security']
  },
  {
    scheme_id: 'UJJWALA',
    scheme_name: 'Pradhan Mantri Ujjwala Yojana',
    scheme_name_hindi: 'प्रधानमंत्री उज्ज्वला योजना',
    scheme_name_regional: 'ప్రధాన మంత్రి ఉజ్వల యోజన',
    ministry_department: 'Ministry of Petroleum and Natural Gas',
    scheme_type: 'Central',
    category: 'Women Empowerment',
    description: 'Provides free LPG connection to women from BPL families.',
    description_hindi: 'BPL परिवारों की महिलाओं को मुफ्त LPG कनेक्शन प्रदान करता है।',
    benefit_amount: 1600,
    benefit_type: 'In-kind',
    benefit_description: 'Free LPG connection with ₹1600 subsidy',
    eligibility: {
      min_age: 18,
      max_age: null,
      gender: 'Female',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Must be BPL. Woman should be head of household. No existing LPG connection in household.'
    },
    required_documents: ['Aadhaar Card', 'BPL Card', 'Bank Account', 'Address Proof', 'Photograph'],
    application_process: 'Apply at nearest LPG distributor with BPL certificate. Fill PMUY form.',
    application_url: 'https://www.pmuy.gov.in/',
    helpline_number: '1906',
    application_deadline: null,
    processing_time_days: 15,
    is_active: true,
    tags: ['LPG', 'women', 'cooking gas', 'BPL', 'clean energy']
  },
  {
    scheme_id: 'MGNREGA',
    scheme_name: 'Mahatma Gandhi National Rural Employment Guarantee Act',
    scheme_name_hindi: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम',
    scheme_name_regional: 'మహాత్మా గాంధీ జాతీయ గ్రామీణ ఉపాధి హామీ చట్టం',
    ministry_department: 'Ministry of Rural Development',
    scheme_type: 'Central',
    category: 'Employment',
    description: 'Guarantees 100 days of wage employment per year to rural households willing to do unskilled manual work.',
    description_hindi: 'अकुशल शारीरिक कार्य करने के इच्छुक ग्रामीण परिवारों को प्रति वर्ष 100 दिन के वेतन रोजगार की गारंटी देता है।',
    benefit_amount: 20900,
    benefit_type: 'Wages',
    benefit_description: '100 days guaranteed employment at ₹209/day (average)',
    eligibility: {
      min_age: 18,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['unemployed', 'daily_wage'],
      location: ['Rural Areas'],
      education_level: null,
      other_criteria: 'Must be rural household. Willing to do unskilled manual work.'
    },
    required_documents: ['Aadhaar Card', 'Bank Account', 'Address Proof'],
    application_process: 'Apply at Gram Panchayat for Job Card. Submit application for work within 15 days.',
    application_url: 'https://nrega.nic.in/',
    helpline_number: '1800-345-22-44',
    application_deadline: null,
    processing_time_days: 15,
    is_active: true,
    tags: ['employment', 'rural', 'unskilled work', 'wage employment', 'job card']
  },
  {
    scheme_id: 'SSY',
    scheme_name: 'Sukanya Samriddhi Yojana',
    scheme_name_hindi: 'सुकन्या समृद्धि योजना',
    scheme_name_regional: 'సుకన్య సమృద్ధి యోజన',
    ministry_department: 'Ministry of Finance',
    scheme_type: 'Central',
    category: 'Women Empowerment',
    description: 'Savings scheme for girl child with attractive interest rate and tax benefits.',
    description_hindi: 'बालिकाओं के लिए बचत योजना जिसमें आकर्षक ब्याज दर और कर लाभ हैं।',
    benefit_amount: 0,
    benefit_type: 'Savings + Interest',
    benefit_description: '8.2% annual interest rate with tax benefits under Section 80C',
    eligibility: {
      min_age: 0,
      max_age: 10,
      gender: 'Female',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Account opened in name of girl child under 10 years. Maximum 2 girl children per family.'
    },
    required_documents: ['Birth Certificate of Girl Child', 'Parent Aadhaar', 'Address Proof', 'Photograph'],
    application_process: 'Open account at any Post Office or authorized bank. Minimum deposit ₹250, maximum ₹1.5 lakh per year.',
    application_url: 'https://www.indiapost.gov.in/',
    helpline_number: '1800-180-1111',
    application_deadline: null,
    processing_time_days: 7,
    is_active: true,
    tags: ['savings', 'girl child', 'education', 'marriage', 'tax benefits']
  },
  {
    scheme_id: 'KCC',
    scheme_name: 'Kisan Credit Card (KCC)',
    scheme_name_hindi: 'किसान क्रेडिट कार्ड',
    scheme_name_regional: 'కిసాన్ క్రెడిట్ కార్డ్',
    ministry_department: 'Ministry of Agriculture and Farmers Welfare',
    scheme_type: 'Central',
    category: 'Agriculture',
    description: 'Provides credit to farmers for cultivation and other agricultural needs at subsidized interest rates.',
    description_hindi: 'किसानों को खेती और अन्य कृषि जरूरतों के लिए रियायती ब्याज दरों पर ऋण प्रदान करता है।',
    benefit_amount: 300000,
    benefit_type: 'Loan',
    benefit_description: 'Up to ₹3 lakh loan at 7% interest (4% with prompt repayment)',
    eligibility: {
      min_age: 18,
      max_age: 75,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['farmer', 'agricultural_worker'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Must be owner cultivator or tenant farmer. Land records required.'
    },
    required_documents: ['Aadhaar Card', 'Land Ownership Documents', 'Bank Account', 'Passport Size Photo'],
    application_process: 'Apply at nearest bank branch with land documents. Bank will assess credit limit based on landholding.',
    application_url: 'Apply at nearest bank branch',
    helpline_number: 'Bank-specific',
    application_deadline: null,
    processing_time_days: 21,
    is_active: true,
    tags: ['agriculture', 'loan', 'credit', 'farmer', 'subsidized interest']
  },
  {
    scheme_id: 'MUDRA',
    scheme_name: 'Pradhan Mantri MUDRA Yojana',
    scheme_name_hindi: 'प्रधानमंत्री मुद्रा योजना',
    scheme_name_regional: 'ప్రధాన మంత్రి ముద్ర యోజన',
    ministry_department: 'Ministry of Finance',
    scheme_type: 'Central',
    category: 'Employment',
    description: 'Provides loans up to ₹10 lakh to small businesses and entrepreneurs.',
    description_hindi: 'छोटे व्यवसायों और उद्यमियों को ₹10 लाख तक का ऋण प्रदान करता है।',
    benefit_amount: 1000000,
    benefit_type: 'Loan',
    benefit_description: 'Loans from ₹50,000 to ₹10 lakh for business',
    eligibility: {
      min_age: 18,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['small_business', 'entrepreneur', 'self_employed'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Must have viable business plan. Three categories: Shishu (up to ₹50k), Kishore (₹50k-5L), Tarun (₹5L-10L).'
    },
    required_documents: ['Aadhaar Card', 'Business Plan', 'Income Proof', 'Address Proof', 'Bank Account', 'Photograph'],
    application_process: 'Apply at nearest bank or NBFC. Submit business plan and required documents.',
    application_url: 'https://www.mudra.org.in/',
    helpline_number: '1800-180-1111',
    application_deadline: null,
    processing_time_days: 30,
    is_active: true,
    tags: ['business loan', 'MSME', 'entrepreneur', 'startup', 'self employment']
  }
];

// MongoDB connection and seed function
const seedSchemes = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scheme-saarthi';
    await mongoose.connect(MONGODB_URI);
    
    console.log('🔗 Connected to MongoDB');
    
    // Clear existing schemes
    await Scheme.deleteMany({});
    console.log('🗑️  Cleared existing schemes');
    
    // Insert sample schemes
    const inserted = await Scheme.insertMany(sampleSchemes);
    console.log(`✅ Inserted ${inserted.length} sample government schemes`);
    
    // Display summary
    console.log('\n📊 Schemes by Category:');
    const categories = await Scheme.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} schemes`);
    });
    
    console.log('\n✅ Seed completed successfully!');
    console.log('🎯 You can now test scheme search via AI agent');
    
  } catch (error) {
    console.error('❌ Error seeding schemes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedSchemes();
}

module.exports = { sampleSchemes, seedSchemes };
