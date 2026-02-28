/**
 * Comprehensive Seed Data for Scheme Saarthi
 * Indian Government Schemes Database
 * Includes: Central, State, and District level schemes
 */

const mongoose = require('mongoose');
const Scheme = require('./models/Scheme');
const Citizen = require('./models/Citizen');
const Application = require('./models/Application');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schemesaarthi';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 second timeout
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log(`📍 Database: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('\n💡 TIP: If using MongoDB Atlas, ensure:');
    console.error('   1. Your IP address is whitelisted');
    console.error('   2. Username/password are correct');
    console.error('   3. Network connection is stable');
    console.error('\n💡 Alternatively, use local MongoDB: mongodb://localhost:27017/schemesaarthi\n');
    process.exit(1);
  });

// ============================================
// COMPREHENSIVE INDIAN GOVERNMENT SCHEMES
// ============================================

const indianGovernmentSchemes = [
  // ============================================
  // AGRICULTURE SCHEMES
  // ============================================
  {
    scheme_id: 'PM-KISAN-2024',
    scheme_name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    scheme_name_hindi: 'प्रधानमंत्री किसान सम्मान निधि',
    scheme_name_regional: 'ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి',
    ministry_department: 'Ministry of Agriculture and Farmers Welfare',
    scheme_type: 'Central',
    category: 'Agriculture',
    description: 'Direct income support of ₹6,000 per year to all landholding farmer families in three equal installments of ₹2,000 each every four months.',
    description_hindi: 'सभी भूमि धारक किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता, हर चार महीने में तीन समान किस्तों में ₹2,000 प्रत्येक।',
    description_regional: 'భూమి కలిగిన అన్ని రైతు కుటుంబాలకు సంవత్సరానికి ₹6,000 ప్రత్యక్ష ఆదాయ మద్దతు, ప్రతి నాలుగు నెలలకు మూడు సమాన విడతలలో ₹2,000 చొప్పున.',
    benefit_amount: 6000,
    benefit_type: 'Direct Cash Transfer',
    benefit_description: '₹6,000 per year in three installments of ₹2,000 each directly to bank account',
    eligibility: {
      min_age: 18,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['SC', 'ST', 'OBC', 'General'],
      occupation: ['farmer', 'agricultural_worker'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Must own cultivable land. Land ownership certificates required. Not applicable to government employees.'
    },
    required_documents: ['Aadhaar Card', 'Bank Account Passbook', 'Land Ownership Documents (Patta/Khatauni)', 'Cancelled Cheque'],
    application_process: 'Apply online at pmkisan.gov.in with Aadhaar number and bank details. Village revenue officers will verify land records. Payment directly to bank account.',
    application_url: 'https://pmkisan.gov.in/',
    helpline_number: '155261 / 011-24300606',
    application_deadline: null,
    processing_time_days: 30,
    is_active: true,
    tags: ['agriculture', 'farmer', 'income support', 'DBT', 'central scheme', 'pm kisan', 'land ownership'],
    popularity_score: 95
  },
  {
    scheme_id: 'KCC-2024',
    scheme_name: 'Kisan Credit Card (KCC)',
    scheme_name_hindi: 'किसान क्रेडिट कार्ड',
    scheme_name_regional: 'కిసాన్ క్రెడిట్ కార్డ్',
    ministry_department: 'Ministry of Agriculture, Department of Financial Services',
    scheme_type: 'Central',
    category: 'Agriculture',
    description: 'Provides adequate and timely credit support from banking system for agriculture and allied activities. Loan up to ₹3 lakh at 7% interest rate.',
    description_hindi: 'कृषि और संबद्ध गतिविधियों के लिए बैंकिंग प्रणाली से पर्याप्त और समय पर ऋण सहायता प्रदान करता है। 7% ब्याज दर पर ₹3 लाख तक का ऋण।',
    description_regional: 'వ్యవసాయం మరియు సంబంధిత కార్యకలాపాలకు బ్యాంకింగ్ వ్యవస్థ నుండి తగినంత మరియు సకాల రుణ మద్దతును అందిస్తుంది. 7% వడ్డీ రేటుతో ₹3 లక్షల వరకు రుణం.',
    benefit_amount: 300000,
    benefit_type: 'Agricultural Loan',
    benefit_description: 'Credit limit up to ₹3 lakh at subsidized interest rate of 7% (or 4% with prompt repayment)',
    eligibility: {
      min_age: 18,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['farmer', 'agricultural_worker', 'fisherman', 'dairy_farmer'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Landowner farmers, tenant farmers, oral lessees, sharecroppers, and self-help groups are eligible.'
    },
    required_documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details', 'Photo', 'Address Proof'],
    application_process: 'Visit nearest bank branch (SBI, HDFC, ICICI, local cooperative banks). Submit application with land documents. Bank will assess credit limit based on landholding.',
    application_url: 'Apply at nearest bank branch or https://www.sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card',
    helpline_number: '1800-180-1111 (Bank-specific)',
    application_deadline: null,
    processing_time_days: 15,
    is_active: true,
    tags: ['agriculture', 'loan', 'credit', 'KCC', 'farmer finance', 'crop loan'],
    popularity_score: 88
  },
  {
    scheme_id: 'PMFBY-2024',
    scheme_name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    scheme_name_hindi: 'प्रधानमंत्री फसल बीमा योजना',
    scheme_name_regional: 'ప్రధాన మంత్రి ఫసల్ బీమా యోజన',
    ministry_department: 'Ministry of Agriculture and Farmers Welfare',
    scheme_type: 'Central',
    category: 'Agriculture',
    description: 'Comprehensive crop insurance covering yield losses due to non-preventable natural risks. Farmers pay only 1.5-2% premium, rest subsidized by government.',
    description_hindi: 'गैर-रोकथाम योग्य प्राकृतिक जोखिमों के कारण उपज नुकसान को कवर करने वाला व्यापक फसल बीमा। किसान केवल 1.5-2% प्रीमियम का भुगतान करते हैं, शेष सरकार द्वारा सब्सिडी दी जाती है।',
    description_regional: 'నివారించలేని ప్రాకృతిక ప్రమాదాల వల్ల పంట దిగుబడి నష్టాన్ని కవర్ చేసే సమగ్ర పంట బీమा. రైతులు కేవలం 1.5-2% ప్రీమియం చెల్లిస్తారు, మిగిలినది ప్రభుత్వం సబ్సిడీ ఇస్తుంది.',
    benefit_amount: null,
    benefit_type: 'Insurance Coverage',
    benefit_description: 'Full sum insured against crop loss. Premium: 1.5% for Rabi, 2% for Kharif crops. Claim settlement within 2 months.',
    eligibility: {
      min_age: 18,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['farmer', 'agricultural_worker'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'All farmers growing notified crops. Coverage against drought, flood, pest attacks, landslides, natural calamities.'
    },
    required_documents: ['Aadhaar Card', 'Land Records (Khatauni/ROR)', 'Sowing Certificate', 'Bank Account Details'],
    application_process: 'Enroll through bank (if availing loan) or directly through CSCs, insurance companies, or pmfby.gov.in portal within cut-off dates.',
    application_url: 'https://pmfby.gov.in/',
    helpline_number: '011-23382012',
    application_deadline: new Date('2026-07-31'), // Kharif season deadline
    processing_time_days: 60,
    is_active: true,
    tags: ['agriculture', 'insurance', 'crop protection', 'PMFBY', 'natural calamity', 'farmer security'],
    popularity_score: 82
  },

  // ============================================
  // EDUCATION SCHEMES
  // ============================================
  {
    scheme_id: 'NSP-POSTMATRIC-SC-2024',
    scheme_name: 'Post Matric Scholarship for SC Students',
    scheme_name_hindi: 'अनुसूचित जाति छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति',
    scheme_name_regional: 'SC విద్యార్థులకు పోస్ట్ మెట్రిక్ స్కాలర్‌షిప్',
    ministry_department: 'Ministry of Social Justice and Empowerment',
    scheme_type: 'Central',
    category: 'Education',
    description: 'Financial assistance to SC students studying in class 11 onwards up to PhD level. Covers tuition fees, maintenance allowance, and other expenses.',
    description_hindi: 'कक्षा 11 से पीएचडी स्तर तक पढ़ने वाले अनुसूचित जाति के छात्रों को वित्तीय सहायता। ट्यूशन फीस, रखरखाव भत्ता और अन्य खर्चों को कवर करता है।',
    description_regional: 'తరగతి 11 నుండి PhD స్థాయి వరకు చదువుతున్న SC విద్యార్థులకు ఆర్థిక సహాయం. ట్యూషన్ ఫీజులు, నిర్వహణ భత్యం మరియు ఇతర ఖర్చులను కవర్ చేస్తుంది.',
    benefit_amount: 35000,
    benefit_type: 'Scholarship',
    benefit_description: 'Tuition fees + Maintenance allowance (₹550-₹1200/month) + Book allowance + Other study expenses. Total up to ₹35,000 per year.',
    eligibility: {
      min_age: 15,
      max_age: 35,
      gender: 'All',
      income_limit: 250000,
      caste_category: ['SC'],
      occupation: ['student'],
      location: ['All States'],
      education_level: 'Class 11 and above',
      other_criteria: 'Passed previous examination. SC caste certificate mandatory. Annual family income should not exceed ₹2.5 lakh.'
    },
    required_documents: ['Aadhaar Card', 'SC Caste Certificate', 'Income Certificate (not older than 6 months)', 'Previous Year Marksheet', 'Fee Receipt', 'Bank Account Details', 'Bonafide Certificate from Institution'],
    application_process: 'Apply online at National Scholarship Portal (scholarships.gov.in). Upload all documents. Institute verification. State government approves and disburses.',
    application_url: 'https://scholarships.gov.in/',
    helpline_number: '0120-6619540',
    application_deadline: new Date('2026-10-31'),
    processing_time_days: 90,
    is_active: true,
    tags: ['education', 'scholarship', 'SC', 'post-matric', 'NSP', 'student aid', 'tuition fees'],
    popularity_score: 91
  },
  {
    scheme_id: 'NSP-POSTMATRIC-ST-2024',
    scheme_name: 'Post Matric Scholarship for ST Students',
    scheme_name_hindi: 'अनुसूचित जनजाति छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति',
    scheme_name_regional: 'ST విద్యార్థులకు పోస్ట్ మెట్రిక్ స్కాలర్‌షిప్',
    ministry_department: 'Ministry of Tribal Affairs',
    scheme_type: 'Central',
    category: 'Education',
    description: 'Scholarship for ST students from class 11 to post-graduation. Covers full tuition, maintenance, books, and study tour expenses.',
    description_hindi: 'कक्षा 11 से स्नातकोत्तर तक के अनुसूचित जनजाति छात्रों के लिए छात्रवृत्ति। पूर्ण ट्यूशन, रखरखाव, किताबें और अध्ययन दौरे के खर्च को कवर करता है।',
    description_regional: 'తరగతి 11 నుండి పోస్ట్-గ్రాడ్యుయేషన్ వరకు ST విద్యార్థులకు స్కాలర్‌షిప్. పూర్తి ట్యూషన్, నిర్వహణ, పుస్తకాలు మరియు అధ్యయన పర్యటన ఖర్చులను కవర్ చేస్తుంది.',
    benefit_amount: 40000,
    benefit_type: 'Scholarship',
    benefit_description: 'Tuition fees + Admission fees + Hostel charges + Maintenance allowance (₹750-₹1800/month) + Book grant + Study tour. Total up to ₹40,000 per year.',
    eligibility: {
      min_age: 15,
      max_age: 35,
      gender: 'All',
      income_limit: 250000,
      caste_category: ['ST'],
      occupation: ['student'],
      location: ['All States'],
      education_level: 'Class 11 and above',
      other_criteria: '50% or more marks in previous final examination. ST certificate required. No scholarship for diploma via correspondence.'
    },
    required_documents: ['Aadhaar Card', 'ST Caste Certificate from competent authority', 'Income Certificate', 'Previous Year Marksheet (minimum 50%)', 'Fee Receipt', 'Bank Account Details', 'Bonafide Certificate', 'Passport Size Photo'],
    application_process: 'Apply via National Scholarship Portal. Upload ST certificate and income proof. Institutional verification mandatory. DBT to student bank account.',
    application_url: 'https://scholarships.gov.in/',
    helpline_number: '0120-6619540',
    application_deadline: new Date('2026-10-31'),
    processing_time_days: 90,
    is_active: true,
    tags: ['education', 'scholarship', 'ST', 'tribal', 'post-matric', 'NSP', 'hostel', 'maintenance'],
    popularity_score: 89
  },
  {
    scheme_id: 'NSP-OBC-2024',
    scheme_name: 'Post Matric Scholarship for OBC Students',
    scheme_name_hindi: 'अन्य पिछड़ा वर्ग छात्रों के लिए पोस्ट मैट्रिक छात्रवृत्ति',
    scheme_name_regional: 'OBC విద్యార్థులకు పోస్ట్ మెట్రిక్ స్కాలర్‌షిప్',
    ministry_department: 'Ministry of Social Justice and Empowerment',
    scheme_type: 'Central',
    category: 'Education',
    description: 'Financial support for OBC students pursuing post-matriculation studies. Covers tuition, maintenance, and study material costs.',
    description_hindi: 'पोस्ट-मैट्रिक अध्ययन करने वाले ओबीसी छात्रों के लिए वित्तीय सहायता। ट्यूशन, रखरखाव और अध्ययन सामग्री की लागत को कवर करता है।',
    description_regional: 'పోస్ట్-మెట్రిక్యులేషన్ చదువులు చేస్తున్న OBC విద్యార్థులకు ఆర్థిక మద్దతు. ట్యూషన్, నిర్వహణ మరియు అధ్యయన సామగ్రి ఖర్చులను కవర్ చేస్తుంది.',
    benefit_amount: 30000,
    benefit_type: 'Scholarship',
    benefit_description: 'Maintenance allowance (₹230-₹1200/month) + Tuition fees + Compulsory fees. Total varies by course, up to ₹30,000/year.',
    eligibility: {
      min_age: 15,
      max_age: 35,
      gender: 'All',
      income_limit: 100000,
      caste_category: ['OBC'],
      occupation: ['student'],
      location: ['All States'],
      education_level: 'Class 11 and above',
      other_criteria: 'OBC certificate (non-creamy layer). Family annual income below ₹1 lakh. Not held back for more than one year.'
    },
    required_documents: ['Aadhaar Card', 'OBC Certificate (Non-Creamy Layer)', 'Income Certificate', 'Fee Receipt', 'Previous Year Marks Card', 'Bank Passbook', 'Self-Declaration of not availing other scholarships'],
    application_process: 'Register on scholarships.gov.in with student details. Upload OBC non-creamy layer certificate and income proof. Submit to institute for verification.',
    application_url: 'https://scholarships.gov.in/',
    helpline_number: '0120-6619540',
    application_deadline: new Date('2026-11-15'),
    processing_time_days: 75,
    is_active: true,
    tags: ['education', 'scholarship', 'OBC', 'backward class', 'post-matric', 'non-creamy layer'],
    popularity_score: 86
  },
  {
    scheme_id: 'MCM-SCHOLARSHIP-2024',
    scheme_name: 'Maulana Azad National Scholarship for Minority Students',
    scheme_name_hindi: 'मौलाना आजाद राष्ट्रीय अल्पसंख्यक छात्रवृत्ति',
    scheme_name_regional: 'మౌలానా ఆజాద్ జాతీయ మైనారిటీ స్కాలర్‌షిప్',
    ministry_department: 'Ministry of Minority Affairs',
    scheme_type: 'Central',
    category: 'Education',
    description: 'Merit-cum-means based scholarship for minority community students (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) studying class 11-12.',
    description_hindi: 'कक्षा 11-12 में पढ़ने वाले अल्पसंख्यक समुदाय के छात्रों (मुस्लिम, ईसाई, सिख, बौद्ध, जैन, पारसी) के लिए मेरिट-सह-साधन आधारित छात्रवृत्ति।',
    description_regional: 'తరగతి 11-12 చదువుతున్న మైనారిటీ కమ్యూనిటీ విద్యార్థులకు (ముస్లిం, క్రిస్టియన్, సిక్, బౌద్ధ, జైన, పార్సీ) మెరిట్-కమ్-మీన్స్ ఆధారిత స్కాలర్‌షిప్.',
    benefit_amount: 12000,
    benefit_type: 'Scholarship',
    benefit_description: '₹6,000 per year for day scholars, ₹12,000 per year for hostellers. Paid in 10 monthly installments.',
    eligibility: {
      min_age: 15,
      max_age: 22,
      gender: 'All',
      income_limit: 100000,
      caste_category: ['Minority'],
      occupation: ['student'],
      location: ['All States'],
      education_level: 'Class 11-12',
      other_criteria: '55% marks in class 10. Belongs to notified minority community. Not availing any other scholarship. Only 2 children per family eligible.'
    },
    required_documents: ['Aadhaar Card', 'Minority Community Certificate', 'Class 10 Marksheet (minimum 55%)', 'Income Certificate', 'School Bonafide Certificate', 'Bank Account Details', 'Passport Photo'],
    application_process: 'Apply online at National Scholarship Portal during announced period. Submit minority community certificate. School principal verification required.',
    application_url: 'https://scholarships.gov.in/',
    helpline_number: '011-23583788',
    application_deadline: new Date('2026-10-31'),
    processing_time_days: 60,
    is_active: true,
    tags: ['education', 'minority', 'merit scholarship', 'class 11', 'class 12', 'muslim', 'christian', 'maulana azad'],
    popularity_score: 77
  },

  // ============================================
  // HEALTH & WELLNESS SCHEMES
  // ============================================
  {
    scheme_id: 'PMJAY-2024',
    scheme_name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    scheme_name_hindi: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
    scheme_name_regional: 'ఆయుష్మాన్ భారత్ - ప్రధాన మంత్రి జన ఆరోగ్య యోజన',
    ministry_department: 'National Health Authority, Ministry of Health',
    scheme_type: 'Central',
    category: 'Health',
    description: "World's largest health insurance scheme providing ₹5 lakh per family per year for secondary and tertiary hospitalization. Cashless treatment at empanelled hospitals.",
    description_hindi: 'माध्यमिक और तृतीयक अस्पताल में भर्ती के लिए प्रति परिवार प्रति वर्ष ₹5 लाख प्रदान करने वाली दुनिया की सबसे बड़ी स्वास्थ्य बीमा योजना। सूचीबद्ध अस्पतालों में कैशलेस उपचार।',
    description_regional: 'ద్వితీయ మరియు తృతీయ ఆసుపత్రిలో చేరడం కోసం ప్రతి కుటుంబానికి సంవత్సరానికి ₹5 లక్షల విలువైన ప్రపంచంలోనే అతిపెద్ద ఆరోగ్య బీమా పథకం. నమోదిత ఆసుపత్రులలో నగదు లేని చికిత్స.',
    benefit_amount: 500000,
    benefit_type: 'Health Insurance',
    benefit_description: '₹5 lakh health cover per family per year. Covers 1,600+ procedures including hospitalization, medicines, diagnostics, and pre/post hospitalization expenses.',
    eligibility: {
      min_age: null,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['All States except Odisha, Telangana, Delhi'],
      education_level: null,
      other_criteria: 'Based on SECC 2011 database. Covers bottom 40% population. Includes deprived rural families and identified urban workers. No family size limit, age limit, or pre-existing disease restrictions.'
    },
    required_documents: ['Aadhaar Card', 'Ration Card (optional for verification)', 'SECC database entry - No other documents if eligible in database'],
    application_process: 'Check eligibility at mera.pmjay.gov.in by entering mobile and Aadhaar. If eligible, generate Ayushman card at Ayushman Mitra Help Desks, Common Service Centers, or empanelled hospitals. Completely paperless and free.',
    application_url: 'https://pmjay.gov.in/ | https://mera.pmjay.gov.in/',
    helpline_number: '14555',
    application_deadline: null,
    processing_time_days: 1, // Instant card generation
    is_active: true,
    tags: ['health', 'insurance', 'ayushman bharat', 'PMJAY', 'hospitalization', 'BPL', 'cashless', 'medical'],
    popularity_score: 98
  },
  {
    scheme_id: 'PMMVY-2024',
    scheme_name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    scheme_name_hindi: 'प्रधानमंत्री मातृ वंदना योजना',
    scheme_name_regional: 'ప్రధాన మంత్రి మాతృ వందనా యోజన',
    ministry_department: 'Ministry of Women and Child Development',
    scheme_type: 'Central',
    category: 'Health',
    description: 'Maternity benefit of ₹5,000 in three installments to pregnant women for first living child. Compensates wage loss and improves nutrition.',
    description_hindi: 'पहले जीवित बच्चे के लिए गर्भवती महिलाओं को तीन किस्तों में ₹5,000 की मातृत्व लाभ। मजदूरी हानि की क्षतिपूर्ति करता है और पोषण में सुधार करता है।',
    description_regional: 'మొదటి సజీవ బిడ్డ కోసం గర్భిణీ స్త్రీలకు మూడు విడతలలో ₹5,000 ప్రసూతి ప్రయోజనం. వేతన నష్టాన్ని భర్తీ చేస్తుంది మరియు పోషకాహారాన్ని మెరుగుపరుస్తుంది.',
    benefit_amount: 5000,
    benefit_type: 'Cash Incentive',
    benefit_description: '₹5,000 in three installments: ₹1,000 at early pregnancy registration, ₹2,000 after 6 months, ₹2,000 after childbirth and vaccination. Direct bank transfer.',
    eligibility: {
      min_age: 19,
      max_age: null,
      gender: 'Female',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Pregnant and lactating mothers for first living child only. Not applicable if receiving similar benefits under other schemes or government employees.'
    },
    required_documents: ['Aadhaar Card (Mother and Father)', 'Bank Account Passbook (Mother)', 'MCP Card (Mother and Child Protection Card)', 'Identity Proof', 'Institutional Delivery Proof'],
    application_process: 'Register at nearest Anganwadi Center (AWC) or health facility. Fill forms 1A, 1B, 1C at different stages. Link Aadhaar and bank account. Money directly credited to bank.',
    application_url: 'Apply at Anganwadi Center or https://pmmvy-cas.nic.in/',
    helpline_number: '011-23382193',
    application_deadline: null,
    processing_time_days: 30,
    is_active: true,
    tags: ['health', 'maternity', 'pregnancy', 'women', 'nutrition', 'cash benefit', 'PMMVY', 'anganwadi'],
    popularity_score: 84
  },
  {
    scheme_id: 'JSSK-2024',
    scheme_name: 'Janani Shishu Suraksha Karyakram (JSSK)',
    scheme_name_hindi: 'जननी शिशु सुरक्षा कार्यक्रम',
    scheme_name_regional: 'జననీ శిశు సురక్ష కార్యక్రమం',
    ministry_department: 'Ministry of Health and Family Welfare',
    scheme_type: 'Central',
    category: 'Health',
    description: 'Free delivery services and sick newborn care at government institutions. Zero out-of-pocket expenses for pregnant women and sick infants up to 1 year.',
    description_hindi: 'सरकारी संस्थानों में मुफ्त प्रसव सेवाएं और बीमार नवजात देखभाल। गर्भवती महिलाओं और 1 वर्ष तक के बीमार शिशुओं के लिए शून्य जेब खर्च।',
    description_regional: 'ప్రభుత్వ సంస్థలలో ఉచిత ప్రసవ సేవలు మరియు అనారోగ్యంతో ఉన్న నవజాత శిశువుల సంరక్షణ. గర్భిణీ స్త్రీలు మరియు 1 సంవత్సరం వరకు అనారోగ్య శిశువులకు జేబు ఖర్చులు సున్నా.',
    benefit_amount: null,
    benefit_type: 'Free Medical Services',
    benefit_description: 'Free: Normal/C-section delivery, medicines, diagnostics, blood, food (3 meals), transport (home to facility), newborn care. Exempts all user charges at government health facilities.',
    eligibility: {
      min_age: null,
      max_age: null,
      gender: 'Female',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'All pregnant women delivering in public health institutions. Sick newborns up to 1 year. No caste, residence, or BPL/APL restrictions.'
    },
    required_documents: ['No documents required for availing services', 'Aadhaar/Any ID for registration (optional)'],
    application_process: 'No application needed. Visit nearest government hospital/CHC/PHC for delivery. All services provided free. Transport also covered.',
    application_url: 'Visit nearest Government Hospital/CHC/PHC',
    helpline_number: '104 (State Health Helpline)',
    application_deadline: null,
    processing_time_days: 0, // Instant at facility
    is_active: true,
    tags: ['health', 'maternity', 'delivery', 'newborn care', 'free services', 'government hospital', 'JSSK'],
    popularity_score: 79
  },

  // ============================================
  // HOUSING SCHEMES
  // ============================================
  {
    scheme_id: 'PMAY-G-2024',
    scheme_name: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
    scheme_name_hindi: 'प्रधानमंत्री आवास योजना - ग्रामीण',
    scheme_name_regional: 'ప్రధాన మంత్రి ఆవాస్ యోజన - గ్రామీణ',
    ministry_department: 'Ministry of Rural Development',
    scheme_type: 'Central',
    category: 'Housing',
    description: 'Financial assistance for construction of pucca house with basic amenities for houseless or people living in kutcha/dilapidated houses in rural areas.',
    description_hindi: 'ग्रामीण क्षेत्रों में बेघर या कच्चे/जर्जर घरों में रहने वाले लोगों के लिए बुनियादी सुविधाओं के साथ पक्का घर के निर्माण के लिए वित्तीय सहायता।',
    description_regional: 'గ్రామీణ ప్రాంతాల్లో నిరాశ్రయులు లేదా కచ్చా/క్షీణించిన ఇళ్లలో నివసించే వారికి ప్రాథమిక సౌకర్యాలతో పక్కా ఇల్లు నిర్మాణానికి ఆర్థిక సహాయం.',
    benefit_amount: 120000,
    benefit_type: 'Construction Subsidy',
    benefit_description: '₹1.20 lakh for plain areas, ₹1.30 lakh for hilly/difficult states. Paid in 3 installments. Unit must have toilet, LPG connection, electricity, drinking water.',
    eligibility: {
      min_age: 18,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['Rural Areas only'],
      education_level: null,
      other_criteria: 'Must not own pucca house anywhere in India. Selected from SECC 2011 list. Priority: SC/ST, minorities, widows, disabled, ex-servicemen, women-headed households. Minimum 25 sq meter plinth area.'
    },
    required_documents: ['Aadhaar Card', 'Bank Account (with Aadhaar link)', 'Job Card (MGNREGA if applicable)', 'Caste Certificate (if SC/ST)', 'Land Ownership/Possession papers', 'Convergence application forms'],
    application_process: 'Selection based on SECC 2011 data. Selected beneficiaries contacted by Gram Panchayat. Submit documents to GP. Approval by District level. Funds transferred in 3 stages based on construction progress.',
    application_url: 'https://pmayg.nic.in/ | Contact Gram Panchayat',
    helpline_number: '1800-11-6446 | 011-23063285',
    application_deadline: null,
    processing_time_days: 90,
    is_active: true,
    tags: ['housing', 'rural', 'pucca house', 'PMAY', 'construction', 'subsidy', 'shelter', 'SC ST priority'],
    popularity_score: 93
  },
  {
    scheme_id: 'PMAY-U-2024',
    scheme_name: 'Pradhan Mantri Awas Yojana - Urban (PMAY-U)',
    scheme_name_hindi: 'प्रधानमंत्री आवास योजना - शहरी',
    scheme_name_regional: 'ప్రధాన మంత్రి ఆవాస్ యోజన - పట్టణ',
    ministry_department: 'Ministry of Housing and Urban Affairs',
    scheme_type: 'Central',
    category: 'Housing',
    description: 'Housing for all in urban areas. Provides subsidy on home loans, assistance for construction, and beneficiary-led affordable housing.',
    description_hindi: 'शहरी क्षेत्रों में सभी के लिए आवास। होम लोन पर सब्सिडी, निर्माण के लिए सहायता, और लाभार्थी-नेतृत्व वाली सस्ती आवास प्रदान करता है।',
    description_regional: 'పట్టణ ప్రాంతాల్లో అందరికీ గృహాలు. గృహ రుణాలపై సబ్సిడీ, నిర్మాణానికి సహాయం మరియు లబ్ధిదారుల నేతృత్వంలో సరసమైన గృహాలను అందిస్తుంది.',
    benefit_amount: 250000,
    benefit_type: 'Subsidy/Assistance',
    benefit_description: 'EWS: ₹2.5 lakh per unit. LIG: Interest subsidy on loans up to ₹6 lakh. Credit Linked Subsidy (4-6.5% interest subsidy). Slum rehabilitation with houses.',
    eligibility: {
      min_age: 18,
      max_age: null,
      gender: 'All',
      income_limit: null, // Different for EWS (up to 3L), LIG (3-6L), MIG-I (6-12L), MIG-II (12-18L)
      caste_category: ['All'],
      occupation: ['All'],
      location: ['Urban Areas - All cities'],
      education_level: null,
      other_criteria: 'Applicant/family should not own pucca house in India. Adult female member co-ownership mandatory. 4 components: Slum rehabilitation, Credit Linked Subsidy, Affordable Housing Partnership, Beneficiary-led construction.'
    },
    required_documents: ['Aadhaar Card', 'Income Certificate', 'Bank Account Details', 'Address Proof', 'Property Documents (if applicable)', 'Caste Certificate (if applicable)', 'Photo ID', 'Self-declaration of not owning house'],
    application_process: 'Apply online at pmaymis.gov.in. Select component based on income group. If applying for loan subsidy, apply through bank/HFC. For BLC component, apply through Urban Local Body (ULB).',
    application_url: 'https://pmaymis.gov.in/',
    helpline_number: '011-23060484',
    application_deadline: null,
    processing_time_days: 120,
    is_active: true,
    tags: ['housing', 'urban', 'home loan', 'subsidy', 'PMAY', 'EWS', 'LIG', 'affordable housing', 'slum'],
    popularity_score: 87
  },

  // ============================================
  // PENSION & SOCIAL SECURITY SCHEMES
  // ============================================
  {
    scheme_id: 'IGNOAPS-2024',
    scheme_name: 'Indira Gandhi National Old Age Pension Scheme',
    scheme_name_hindi: 'इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना',
    scheme_name_regional: 'ఇందిరా గాంధీ జాతీయ వృద్ధాప్య పెన్షన్ పథకం',
    ministry_department: 'Ministry of Rural Development',
    scheme_type:' Central',
    category: 'Social Welfare',
    description: 'Monthly pension to elderly persons aged 60+ from BPL families. Provides social security to destitute senior citizens.',
    description_hindi: 'बीपीएल परिवारों के 60+ वर्ष के बुजुर्ग व्यक्तियों को मासिक पेंशन। निराश्रित वरिष्ठ नागरिकों को सामाजिक सुरक्षा प्रदान करता है।',
    description_regional: 'BPL కుటుంబాల 60+ వయస్సు గల వృద్ధులకు నెలవారీ పెన్షన్. నిరాశ్రయ వయోవృద్ధులకు సామాజిక భద్రతను అందిస్తుంది.',
    benefit_amount: 500,
    benefit_type: 'Monthly Pension',
    benefit_description: '₹200-500/month (Central + State share, varies by state). ₹500/month for 80+ age. Paid quarterly or monthly via bank/post office.',
    eligibility: {
      min_age: 60,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Must be from BPL family. No regular income source. Not receiving similar benefits from other schemes. State governments may add top-up amounts.'
    },
    required_documents: ['Aadhaar Card', 'Age Proof (Birth Certificate/School Certificate/Voter ID)', 'BPL Ration Card', 'Bank Account/Post Office Passbook', 'Income Certificate', 'Address Proof', 'Passport Photo'],
    application_process: 'Apply at Village Panchayat/Municipal Office/Block Development Office. Fill form with age and BPL proof. Verification by concerned authority. Pension starts from approval month.',
    application_url: 'Apply at Gram Panchayat/Block Office | https://nsap.nic.in/',
    helpline_number: 'State-specific (Contact District Social Welfare Office)',
    application_deadline: null,
    processing_time_days: 45,
    is_active: true,
    tags: ['pension', 'old age', 'senior citizen', 'BPL', 'monthly income', 'IGNOAPS', 'social security', 'elderly'],
    popularity_score: 94
  },
  {
    scheme_id: 'IGNWPS-2024',
    scheme_name: 'Indira Gandhi National Widow Pension Scheme',
    scheme_name_hindi: 'इंदिरा गांधी राष्ट्रीय विधवा पेंशन योजना',
    scheme_name_regional: 'ఇందిరా గాంధీ జాతీయ వితంతువుల పెన్షన్ పథకం',
    ministry_department: 'Ministry of Rural Development',
    scheme_type: 'Central',
    category: 'Social Welfare',
    description: 'Monthly pension to widows aged 40+ from BPL families. Economic security for women who lost their husbands.',
    description_hindi: 'बीपीएल परिवारों की 40+ वर्ष की विधवाओं को मासिक पेंशन। अपने पति को खोने वाली महिलाओं के लिए आर्थिक सुरक्षा।',
    description_regional: 'BPL కుటుంబాల 40+ వయస్సు గల వితంతువులకు నెలవారీ పెన్షన్. తమ భర్తలను కోల్పోయిన మహిళలకు ఆర్థిక భద్రత.',
    benefit_amount: 300,
    benefit_type: 'Monthly Pension',
    benefit_description: '₹300/month (Central share) + State top-up (varies). Paid quarterly or monthly directly to bank account.',
    eligibility: {
      min_age: 40,
      max_age: 59,
      gender: 'Female',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Must be widow. BPL family. Age 40-59 years (IGNOAPS covers 60+). Not remarried. Not receiving pension from any other source.'
    },
    required_documents: ['Aadhaar Card', 'Widow Certificate/Death Certificate of Husband', 'Age Proof (Voter ID/Birth Certificate)', 'BPL Card', 'Bank Account Details', 'Income Certificate', 'Passport Photo'],
    application_process: 'Submit application at Village Panchayat/Block Office/Tehsil Office. Provide widow certificate and BPL proof. Gram Panchayat/ULB verification. Approved list sent to District Social Welfare Officer.',
    application_url: 'Apply at Gram Panchayat/Block Office | https://nsap.nic.in/',
    helpline_number: 'Contact District Social Welfare Office',
    application_deadline: null,
    processing_time_days: 45,
    is_active: true,
    tags: ['pension', 'widow', 'women', 'BPL', 'social security', 'IGNWPS', 'monthly income'],
    popularity_score: 81
  },
  {
    scheme_id: 'IGNDPS-2024',
    scheme_name: 'Indira Gandhi National Disability Pension Scheme',
    scheme_name_hindi: 'इंदिरा गांधी राष्ट्रीय विकलांगता पेंशन योजना',
    scheme_name_regional: 'ఇందిరా గాంధీ జాతీయ వైకల్య పెన్షన్ పథకం',
    ministry_department: 'Ministry of Rural Development',
    scheme_type: 'Central',
    category: 'Social Welfare',
    description: 'Monthly pension to persons with severe/multiple disabilities aged 18+ from BPL families. Financial support for disabled citizens.',
    description_hindi: 'बीपीएल परिवारों के 18+ वर्ष के गंभीर/एकाधिक विकलांगता वाले व्यक्तियों को मासिक पेंशन। विकलांग नागरिकों के लिए वित्तीय सहायता।',
    description_regional: 'BPL కుటుంబాల 18+ వయస్సు గల తీవ్ర/బహుళ వైకల్యం ఉన్న వ్యక్తులకు నెలవారీ పెన్షన్. వికలాంగ పౌరులకు ఆర్థిక మద్దతు.',
    benefit_amount: 300,
    benefit_type: 'Monthly Pension',
    benefit_description: '₹300/month (Central share) + State contribution (varies). ₹500/month for 80+ age. Paid quarterly or monthly.',
    eligibility: {
      min_age: 18,
      max_age: 59,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Must have 80% or more disability (severe/multiple disability). BPL family. Not receiving disability pension from any other scheme. Medical board certification required.'
    },
    required_documents: ['Aadhaar Card', 'Disability Certificate (80%+ disability from Medical Board)', 'Age Proof', 'BPL Card', 'Bank Account Details', 'Income Certificate', 'Passport Photo', 'UDID Card (if available)'],
    application_process: 'Obtain disability certificate from Medical Board (80%+ disability). Submit application at Gram Panchayat/Block Office/District Social Welfare Office. Verification and approval at district level.',
    application_url: 'Apply at Gram Panchayat/Block Office | https://nsap.nic.in/',
    helpline_number: 'Contact District Social Welfare Office',
    application_deadline: null,
    processing_time_days: 45,
    is_active: true,
    tags: ['pension', 'disability', 'PWD', 'BPL', 'social security', 'IGNDPS', 'monthly income', '80% disability'],
    popularity_score: 78
  },
  {
    scheme_id: 'APY-2024',
    scheme_name: 'Atal Pension Yojana (APY)',
    scheme_name_hindi: 'अटल पेंशन योजना',
    scheme_name_regional: 'అటల్ పెన్షన్ యోజన',
    ministry_department: 'Ministry of Finance, PFRDA',
    scheme_type: 'Central',
    category: 'Social Welfare',
    description: 'Government-backed pension scheme for unorganized sector workers. Guaranteed pension of ₹1,000 to ₹5,000 per month after 60 years based on contribution.',
    description_hindi: 'असंगठित क्षेत्र के श्रमिकों के लिए सरकार समर्थित पेंशन योजना। योगदान के आधार पर 60 वर्ष के बाद ₹1,000 से ₹5,000 प्रति माह की गारंटीकृत पेंशन।',
    description_regional: 'అసంఘటిత రంగ కార్మికుల కోసం ప్రభుత్వ మద్దతుతో కూడిన పెన్షన్ పథకం. సహకారం ఆధారంగా 60 సంవత్సరాల తర్వాత నెలకు ₹1,000 నుండి ₹5,000 వరకు హామీ పెన్షన్.',
    benefit_amount: 5000,
    benefit_type: 'Monthly Pension',
    benefit_description: 'Guaranteed monthly pension of ₹1,000/₹2,000/₹3,000/₹4,000/₹5,000 after 60 years. On death, spouse gets same pension. Nominee gets corpus on death of both.',
    eligibility: {
      min_age: 18,
      max_age: 40,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['unorganized_sector', 'daily_wage', 'self_employed'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Indian citizen aged 18-40. Bank account holder. Not income tax payer. Not covered under statutory social security schemes. Government co-contributes 50% (for 5 years) for those joining before 31st March 2016.'
    },
    required_documents: ['Aadhaar Card', 'Bank Account (Savings)', 'Mobile Number', 'Nominee Details'],
    application_process: 'Visit bank branch with Aadhaar and savings account. Fill APY registration form. Choose pension amount (₹1000-₹5000). Monthly auto-debit from account. Age-based contribution.',
    application_url: 'Apply at Bank Branch or https://npscra.nsdl.co.in/scheme-details.php',
    helpline_number: '1800-110-069',
    application_deadline: null,
    processing_time_days: 7,
    is_active: true,
    tags: ['pension', 'retirement', 'unorganized sector', 'APY', 'old age security', 'monthly income', 'government guarantee'],
    popularity_score: 85
  },

  // ============================================
  // WOMEN EMPOWERMENT SCHEMES
  // ============================================
  {
    scheme_id: 'PMUY-2024',
    scheme_name: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
    scheme_name_hindi: 'प्रधानमंत्री उज्ज्वला योजना',
    scheme_name_regional: 'ప్రధాన మంత్రి ఉజ్వల యోజన',
    ministry_department: 'Ministry of Petroleum and Natural Gas',
    scheme_type: 'Central',
    category: 'Women Empowerment',
    description: 'Free LPG connection to women from BPL families. Reduces health hazards from cooking with traditional fuels. Empowers women with clean cooking fuel.',
    description_hindi: 'बीपीएल परिवारों की महिलाओं को मुफ्त एलपीजी कनेक्शन। पारंपरिक ईंधन से खाना पकाने से होने वाले स्वास्थ्य खतरों को कम करता है। महिलाओं को स्वच्छ खाना पकाने के ईंधन से सशक्त बनाता है।',
    description_regional: 'BPL కుటుంబాల మహిళలకు ఉచిత LPG కనెక్షన్. సాంప్రదాయ ఇంధనాలతో వంట చేయడం వల్ల కలిగే ఆరోగ్య ప్రమాదాలను తగ్గిస్తుంది. స్వచ్ఛమైన వంట ఇంధనంతో మహిళలకు శక్తినిస్తుంది.',
    benefit_amount: 1600,
    benefit_type: 'In-kind Benefit',
    benefit_description: 'Free LPG connection with ₹1,600 support. Includes security deposit, pressure regulator, LPG pipe, Installation charges, necessary accessories, and first refill.',
    eligibility: {
      min_age: 18,
      max_age: null,
      gender: 'Female',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Woman should be from BPL family or from PM-JAY/SECC list. Adult woman (18+) should be head of household or decision maker. No LPG connection in the household in her or any family member\'s name.'
    },
    required_documents: ['Aadhaar Card (in woman\'s name)', 'BPL Card/PM-JAY Card/SECC list proof', 'Bank Account Details (woman\'s account)', 'Address Proof', 'Passport Size Photograph', 'Ration Card (if applicable)'],
    application_process: 'Visit nearest LPG distributor (Indane/Bharat Gas/HP Gas). Fill PMUY application form. Submit documents. KYC verification. Connection installed at home within 7-10 days.',
    application_url: 'https://www.pmuy.gov.in/ or Visit nearest LPG distributor',
    helpline_number: '1906 (Distributor-specific)',
    application_deadline: null,
    processing_time_days: 10,
    is_active: true,
    tags: ['women', 'LPG', 'cooking fuel', 'BPL', 'PMUY', 'ujjwala', 'clean energy', 'health'],
    popularity_score: 96
  },
  {
    scheme_id: 'SSY-2024',
    scheme_name: 'Sukanya Samriddhi Yojana (SSY)',
    scheme_name_hindi: 'सुकन्या समृद्धि योजना',
    scheme_name_regional: 'సుకన్య సమృద్ధి యోజన',
    ministry_department: 'Ministry of Finance, Department of Economic Affairs',
    scheme_type: 'Central',
    category: 'Women Empowerment',
    description: 'Small deposit savings scheme for girl child. High interest rate of 8.2% p.a. (2024). Tax benefits. Matures when girl turns 21.',
    description_hindi: 'बालिका के लिए छोटी जमा बचत योजना। 8.2% प्रति वर्ष (2024) की उच्च ब्याज दर। कर लाभ। लड़की के 21 साल की होने पर परिपक्व होता है।',
    description_regional: 'బాలికల కోసం చిన్న డిపాజిట్ సేవింగ్స్ పథకం. 8.2% వార్షిక (2024) అధిక వడ్డీ రేటు. పన్ను ప్రయోజనాలు. అమ్మాయి 21 సంవత్సరాల వయస్సు వచ్చినప్పుడు పూర్తవుతుంది.',
    benefit_amount: null,
    benefit_type: 'Savings Account',
    benefit_description: 'High interest rate (8.2% in 2024). Tax deduction under Sec 80C (up to ₹1.5 lakh). Interest and maturity corpus tax-free. Partial withdrawal (50%) allowed for higher education after 18 years.',
    eligibility: {
      min_age: 0,
      max_age: 10,
      gender: 'Female',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Girl child below 10 years of age. Maximum 2 girls per family (3rd allowed in case of twins). Matures when girl turns 21 or gets married after 18 (whichever is earlier).'
    },
    required_documents: ['Girl Child Birth Certificate', 'Parent/Guardian Aadhaar and PAN Card', 'Address Proof', 'Passport Size Photos (Child and Guardian)', 'Initial Deposit (minimum ₹250)'],
    application_process: 'Open account at Post Office or authorized banks (SBI, PNB, BOI, etc.). Submit birth certificate and guardian ID documents. Minimum ₹250, maximum ₹1.5 lakh per year. Can be opened till girl turns 10.',
    application_url: 'Visit nearest Post Office or Authorized Bank Branch',
    helpline_number: '1800-180-1111 (Bank/Post Office specific)',
    application_deadline: null,
    processing_time_days: 1, // Account opened immediately
    is_active: true,
    tags: ['women', 'girl child', 'savings', 'education', 'SSY', 'sukanya samriddhi', 'tax benefit', '80C', 'high interest'],
    popularity_score: 90
  },
  {
    scheme_id: 'MUDRA-2024',
    scheme_name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    scheme_name_hindi: 'प्रधानमंत्री मुद्रा योजना',
    scheme_name_regional: 'ప్రధాన మంత్రి ముద్రా యోజన',
    ministry_department: 'Ministry of Finance, MUDRA Ltd',
    scheme_type: 'Central',
    category: 'Women Empowerment',
    description: 'Loans up to ₹10 lakh to micro-enterprises and small businesses. No collateral required. Supports women entrepreneurs, especially in non-farm sectors.',
    description_hindi: 'सूक्ष्म उद्यमों और छोटे व्यवसायों के लिए ₹10 लाख तक के ऋण। कोई संपार्श्विक की आवश्यकता नहीं। महिला उद्यमियों का समर्थन करता है, विशेष रूप से गैर-कृषि क्षेत्रों में।',
    description_regional: 'సూక్ష్మ సంస్థలు మరియు చిన్న వ్యాపారాలకు ₹10 లక్షల వరకు రుణాలు. తాకట్టు అవసరం లేదు. మహిళా వ్యవసాయేతరులకు, ముఖ్యంగా వ్యవసాయేతర రంగాల్లో మద్దతు ఇస్తుంది.',
    benefit_amount: 1000000,
    benefit_type: 'Business Loan',
    benefit_description: 'Shishu (up to ₹50,000), Kishore (₹50,001 to ₹5 lakh), Tarun (₹5,00,001 to ₹10 lakh). Collateral-free. Interest rate: 8-12% (bank-dependent). No processing fee.',
    eligibility: {
      min_age: 18,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['self_employed', 'small_business', 'shopkeeper', 'vendor', 'artisan', 'manufacturer'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Any individual/business engaged in income-generating activities. Covers manufacturing, trading, services. SMEs, micro-enterprises, shopkeepers, vendors, artisans, food processors, truck operators, beauticians, etc.'
    },
    required_documents: ['Aadhaar Card', 'PAN Card', 'Business Plan/Project Report', 'Address Proof', 'Bank Statements (6 months)', 'Quotations (for equipment/machinery)', 'Business Registration (if applicable)'],
    application_process: 'Prepare business plan. Visit bank/MFI/NBFC with documents. Fill loan application. Bank assesses creditworthiness. No collateral for loans up to ₹10 lakh. Loan disbursed after approval.',
    application_url: 'https://www.mudra.org.in/ or Apply at any Bank/MFI',
    helpline_number: '1800-180-1111 (Bank-specific) | 180030027777',
    application_deadline: null,
    processing_time_days: 15,
    is_active: true,
    tags: ['women', 'entrepreneur', 'MUDRA', 'business loan', 'self-employment', 'collateral-free', 'small business', 'startup'],
    popularity_score: 87
  },

  // ============================================
  // EMPLOYMENT & SKILL DEVELOPMENT
  // ============================================
  {
    scheme_id: 'MGNREGA-2024',
    scheme_name: 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)',
    scheme_name_hindi: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम',
    scheme_name_regional: 'మహాత్మా గాంధీ జాతీయ గ్రామీణ ఉపాధి హామీ చట్టం',
    ministry_department: 'Ministry of Rural Development',
    scheme_type: 'Central',
    category: 'Employment',
    description: 'Guarantees 100 days of wage employment per year to rural households. Work within 15 days or unemployment allowance. Currently ₹245-374 per day.',
    description_hindi: 'ग्रामीण परिवारों को प्रति वर्ष 100 दिनों के वेतन रोजगार की गारंटी देता है। 15 दिनों के भीतर काम या बेरोजगारी भत्ता। वर्तमान में ₹245-374 प्रति दिन।',
    description_regional: 'గ్రామీణ కుటుంబాలకు సంవత్సరానికి 100 రోజుల వేతన ఉపాధికి హామీ ఇస్తుంది. 15 రోజుల్లోగా పని లేదా నిరుద్యోగ భృతి. ప్రస్తుతం రోజుకు ₹245-374.',
    benefit_amount: 24500,
    benefit_type: 'Wage Employment',
    benefit_description: '100 days guaranteed wage employment. ₹245-374 per day (state-wise). Payment within 15 days directly to bank account. Minimum 1/3rd women beneficiaries.',
    eligibility: {
      min_age: 18,
      max_age: null,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['All'],
      location: ['Rural Areas only'],
      education_level: null,
      other_criteria: 'Adult members (18+) of rural households willing to do unskilled manual work. Job Card required. Work provided within 5km or additional wages. Priority to women and vulnerable groups.'
    },
    required_documents: ['Aadhaar Card', 'Bank Account/Post Office Account (with Aadhaar link)', 'Passport Size Photo', 'Address Proof (Ration Card/Voter ID)'],
    application_process: 'Apply for Job Card at Gram Panchayat with photo and address proof. Job card issued within 15 days. Demand work in writing. Work allotted within 15 days or unemployment allowance paid.',
    application_url: 'Apply at Gram Panchayat | https://nrega.nic.in/',
    helpline_number: '1800-345-22-44',
    application_deadline: null,
    processing_time_days: 15, // For job card issuance
    is_active: true,
    tags: ['employment', 'MGNREGA', 'rural', 'wage', '100 days', 'job card', 'manual work', 'women priority'],
    popularity_score: 97
  },
  {
    scheme_id: 'PMKVY-2024',
    scheme_name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
    scheme_name_hindi: 'प्रधानमंत्री कौशल विकास योजना',
    scheme_name_regional: 'ప్రధాన మంత్రి కౌశల్ వికాస్ యోజన',
    ministry_department: 'Ministry of Skill Development and Entrepreneurship',
    scheme_type: 'Central',
    category: 'Employment',
    description: 'Free skill training program to enable youth to take up industry-relevant skills. Average honorarium ₹8,000 per candidate. Certification recognized nationwide.',
    description_hindi: 'युवाओं को उद्योग-प्रासंगिक कौशल लेने में सक्षम बनाने के लिए मुफ्त कौशल प्रशिक्षण कार्यक्रम। प्रति उम्मीदवार औसत मानदेय ₹8,000। देशव्यापी मान्यता प्राप्त प्रमाणन।',
    description_regional: 'యువతకు పరిశ్రమ-సంబంధిత నైపుణ్యాలను తీసుకోవడానికి ఉచిత నైపుణ్య శిక్షణా కార్యక్రమం. అభ్యర్థికి సరాసరి గౌరవధనం ₹8,000. దేశవ్యాప్తంగా గుర్తింపు పొందిన ధృవీకరణ.',
    benefit_amount: 8000,
    benefit_type: 'Skill Training',
    benefit_description: 'Free training (150-300 hours) in job role of choice. Average monetary reward ₹8,000 per candidate after assessment and certification. Government-recognized certificate.',
    eligibility: {
      min_age: 15,
      max_age: 45,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['unemployed', 'school_dropout', 'student'],
      location: ['All States'],
      education_level: null,
      other_criteria: 'Indian citizen. Able to read and write. Unemployed or college dropout. Should have Aadhaar and bank account. Third-party assessment after training.'
    },
    required_documents: ['Aadhaar Card', 'Education Certificates (if applicable)', 'Bank Account Details', 'Passport Size Photos', 'Address Proof'],
    application_process: 'Register on PMKVY portal (pmkvyofficial.org). Choose training center and job role. Enroll and complete training. Pass assessment. Receive certificate and placement assistance.',
    application_url: 'https://www.pmkvyofficial.org/',
    helpline_number: '08800055555',
    application_deadline: null,
    processing_time_days: 90, // Training duration
    is_active: true,
    tags: ['skill development', 'training', 'PMKVY', 'employment', 'youth', 'certification', 'placement', 'free courses'],
    popularity_score: 83
  },
  {
    scheme_id: 'DDU-GKY-2024',
    scheme_name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
    scheme_name_hindi: 'दीन दयाल उपाध्याय ग्रामीण कौशल्य योजना',
    scheme_name_regional: 'దీన్ దయాళ్ ఉపాధ్యాయ గ్రామీణ కౌశల్య యోజన',
    ministry_department: 'Ministry of Rural Development',
    scheme_type: 'Central',
    category: 'Employment',
    description: 'Skill training and placement for rural poor youth (15-35 years). Minimum 70% placement target. Free residential training with stipend.',
    description_hindi: 'ग्रामीण गरीब युवाओं (15-35 वर्ष) के लिए कौशल प्रशिक्षण और नियुक्ति। न्यूनतम 70% नियुक्ति लक्ष्य। छात्रवृत्ति के साथ मुफ्त आवासीय प्रशिक्षण।',
    description_regional: 'గ్రామీణ పేద యువతకు (15-35 సంవత్సరాలు) నైపుణ్య శిక్షణ మరియు ఉద్యోగ స్థానం. కనీసం 70% నియామక లక్ష్యం. స్టైపెండ్‌తో ఉచిత నివాస శిక్షణ.',
    benefit_amount: null,
    benefit_type: 'Skill Training + Placement',
    benefit_description: 'Free residential skills training (576 hours minimum). Stipend during training. Placement assistance with minimum 70% target. Post-placement support for 1 year.',
    eligibility: {
      min_age: 15,
      max_age: 35,
      gender: 'All',
      income_limit: null,
      caste_category: ['All'],
      occupation: ['unemployed', 'rural_youth'],
      location: ['Rural Areas'],
      education_level: null,
      other_criteria: 'Rural poor youth from BPL families or identified through participatory identification. Minimum age 15 years. Focus on SC/ST, minorities, women, persons with disabilities.'
    },
    required_documents: ['Aadhaar Card', 'Age Proof (Birth Certificate/School Certificate)', 'BPL/SECC proof', 'Caste Certificate (if SC/ST)', 'Bank Account Details', 'Address Proof', 'Photos'],
    application_process: 'Contact DDU-GKY project implementing agencies (PIAs) in your district. Participate in mobilization camps. Selection through counseling. Undergo training. Placement support provided after certification.',
    application_url: 'Contact District Mission Management Unit (DMMU) | https://ddugky.gov.in/',
    helpline_number: '011-23465805',
    application_deadline: null,
    processing_time_days: 90, // Training duration
    is_active: true,
    tags: ['skill training', 'rural youth', 'employment', 'DDU-GKY', 'placement guarantee', 'BPL', 'residential training', 'stipend'],
    popularity_score: 76
  }
];

// ============================================
// SEED FUNCTION
// ============================================

async function seedDatabase() {
  try {
    console.log('🌱 Starting Scheme Saarthi Database Seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing schemes...');
    await Scheme.deleteMany({});
    console.log('✅ Existing schemes cleared\n');

    // Insert government schemes
    console.log(`📦 Inserting ${indianGovernmentSchemes.length} government schemes...`);
    await Scheme.insertMany(indianGovernmentSchemes);
    console.log(`✅ Successfully inserted ${indianGovernmentSchemes.length} schemes\n`);

    // Display summary
    console.log('📊 SEEDING SUMMARY');
    console.log('==========================================');
    console.log(`Total Schemes: ${indianGovernmentSchemes.length}`);
    
    const categoryBreakdown = indianGovernmentSchemes.reduce((acc, scheme) => {
      acc[scheme.category] = (acc[scheme.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📋 Category Breakdown:');
    Object.entries(categoryBreakdown).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} schemes`);
    });

    console.log('\n✅ Database seeding completed successfully!');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
