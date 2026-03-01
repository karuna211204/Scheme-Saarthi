/**
 * Dummy Indian Government Documents Generator
 * For testing OCR and document verification
 * Includes: Aadhaar, PAN, Voter ID, Ration Card, Income Certificate, Caste Certificate
 */

const fs = require('fs');
const path = require('path');

// Helper functions
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Indian Names Database
const firstNames = {
  male: ['Rajesh', 'Amit', 'Vijay', 'Suresh', 'Ramesh', 'Anil', 'Krishna', 'Prakash', 'Mahesh', 'Venkat', 
         'Ravi', 'Kumar', 'Srinivas', 'Ganesh', 'Naresh', 'Mohan', 'Kiran', 'Sanjay', 'Prasad', 'Ashok',
         'Dinesh', 'Harish', 'Naveen', 'Raghav', 'Varun', 'Arjun', 'Rohan', 'Nikhil', 'Akash', 'Rahul'],
  female: ['Priya', 'Sneha', 'Lakshmi', 'Divya', 'Kavitha', 'Meera', 'Shalini', 'Anita', 'Deepa', 'Swathi',
           'Sailaja', 'Madhavi', 'Jyothi', 'Revathi', 'Padma', 'Uma', 'Rani', 'Nisha', 'Latha', 'Sandhya',
           'Pooja', 'Rekha', 'Suma', 'Anusha', 'Shilpa', 'Neha', 'Anjali', 'Preeti', 'Kavita', 'Sunita']
};

const lastNames = ['Kumar', 'Reddy', 'Sharma', 'Rao', 'Patel', 'Gupta', 'Singh', 'Nair', 'Iyer', 'Choudhary',
  'Verma', 'Prasad', 'Naidu', 'Joshi', 'Desai', 'Mishra', 'Menon', 'Pillai', 'Agarwal', 'Malhotra',
  'Krishnan', 'Srinivasan', 'Mukherjee', 'Chatterjee', 'Das', 'Bose', 'Sen', 'Pandey', 'Tiwari', 'Yadav'];

const fatherPrefixes = ['S/O', 'D/O', 'W/O', 'C/O'];

// Indian States and Districts
const statesAndDistricts = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Mahbubnagar', 'Nalgonda', 'Medak'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Shimoga', 'Tumkur'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Anand'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur', 'Ajmer', 'Bharatpur', 'Alwar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Darjeeling'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Satna', 'Ratlam'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Malappuram', 'Kannur'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Baripada'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot'],
  'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal']
};

const streets = ['Gandhi Road', 'MG Road', 'Nehru Street', 'Anna Nagar', 'Rajiv Gandhi Road', 'Market Road', 
  'Station Road', 'Main Bazaar', 'Temple Street', 'Park Road', 'Lake View', 'River Side', 'Agricultural Road'];

// Occupation types
const occupations = {
  farmer: ['Farmer', 'Agricultural Worker', 'Landowner Farmer', 'Tenant Farmer'],
  student: ['Student', 'Graduate Student', 'PhD Scholar', 'Undergraduate'],
  employed: ['Private Employee', 'Government Employee', 'Teacher', 'Engineer', 'Doctor', 'Accountant'],
  self_employed: ['Self Employed', 'Business Owner', 'Shop Owner', 'Vendor', 'Contractor'],
  daily_wage: ['Daily Wage Worker', 'Construction Worker', 'Manual Labourer', 'Helper'],
  unemployed: ['Unemployed', 'Housewife', 'Homemaker']
};

// Generate Aadhaar Number (12 digits)
function generateAadhaar() {
  let aadhaar = '';
  for (let i = 0; i < 12; i++) {
    aadhaar += getRandomInt(0, 9);
  }
  return aadhaar.match(/.{1,4}/g).join(' '); // Format: 1234 5678 9012
}

// Generate PAN Number (Format: ABCDE1234F)
function generatePAN() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let pan = '';
  for (let i = 0; i < 5; i++) pan += letters[getRandomInt(0, 25)];
  for (let i = 0; i < 4; i++) pan += getRandomInt(0, 9);
  pan += letters[getRandomInt(0, 25)];
  return pan;
}

// Generate Voter ID (Format: ABC1234567)
function generateVoterID(state) {
  const stateCode = state.substring(0, 3).toUpperCase();
  let voterId = stateCode;
  for (let i = 0; i < 7; i++) {
    voterId += getRandomInt(0, 9);
  }
  return voterId;
}

// Generate Ration Card Number
function generateRationCard(state) {
  const stateCode = state.substring(0, 2).toUpperCase();
  let rationCard = stateCode + '/';
  for (let i = 0; i < 9; i++) {
    rationCard += getRandomInt(0, 9);
  }
  return rationCard;
}

// Generate dummy documents
function generateDummyDocuments(count = 50) {
  const documents = [];

  for (let i = 0; i < count; i++) {
    const gender = getRandomElement(['Male', 'Female']);
    const firstName = getRandomElement(firstNames[gender.toLowerCase()]);
    const lastName = getRandomElement(lastNames);
    const fullName = `${firstName} ${lastName}`;
    
    const fatherFirstName = getRandomElement(firstNames.male);
    const fatherLastName = getRandomElement(lastNames);
    const fatherName = `${fatherFirstName} ${fatherLastName}`;

    const state = getRandomElement(Object.keys(statesAndDistricts));
    const district = getRandomElement(statesAndDistricts[state]);
    const street = getRandomElement(streets);
    const houseNo = `${getRandomInt(1, 500)}-${getRandomInt(1, 100)}`;
    const pincode = `${getRandomInt(500000, 799999)}`;
    
    const dob = getRandomDate(new Date('1960-01-01'), new Date('2005-12-31'));
    const age = 2026 - dob.getFullYear();
    
    const aadhaarNumber = generateAadhaar();
    const panNumber = generatePAN();
    const voterID = generateVoterID(state);
    const rationCard = generateRationCard(state);
    
    const annualIncome = getRandomElement([
      getRandomInt(10000, 50000),    // Very Low
      getRandomInt(50001, 100000),   // Low
      getRandomInt(100001, 250000),  // Medium
      getRandomInt(250001, 500000),  // Above Medium
      getRandomInt(500001, 1000000)  // High
    ]);

    const incomeCategory = annualIncome <= 50000 ? 'BPL' : 
                          annualIncome <= 100000 ? 'APL' :
                          annualIncome <= 250000 ? 'EWS' :
                          annualIncome <= 500000 ? 'Middle' : 'Upper';

    const casteCategory = getRandomElement(['SC', 'ST', 'OBC', 'General']);
    
    const occupationType = getRandomElement(Object.keys(occupations));
    const occupation = getRandomElement(occupations[occupationType]);

    const educationLevels = [
      'No Formal Education',
      'Primary School (1-5)',
      'Middle School (6-8)',
      'High School (9-10)',
      'Intermediate/+2 (11-12)',
      'Graduate (BA/BSc/BCom)',
      'Post Graduate (MA/MSc/MCom)',
      'Professional Degree (BTech/MBBS/MBA)',
      'PhD/Doctorate'
    ];
    const education = getRandomElement(educationLevels);

    const document = {
      // Basic Info
      name: fullName,
      father_name: fatherName,
      gender: gender,
      date_of_birth: dob.toISOString().split('T')[0],
      age: age,
      
      // Identity Documents
      aadhaar_number: aadhaarNumber,
      pan_number: panNumber,
      voter_id: voterID,
      ration_card_number: rationCard,
      ration_card_type: incomeCategory === 'BPL' ? 'BPL' : incomeCategory === 'APL' ? 'APL' : 'AAY',
      
      // Address
      address: {
        house_no: houseNo,
        street: street,
        village_city: district,
        district: district,
        state: state,
        pincode: pincode,
        full_address: `${houseNo}, ${street}, ${district}, ${state} - ${pincode}`
      },
      
      // Contact
      mobile: `9${getRandomInt(100000000, 999999999)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(['gmail.com', 'yahoo.com', 'outlook.com'])}`,
      
      // Socio-Economic Details
      occupation: occupation,
      occupation_type: occupationType,
      annual_income: annualIncome,
      income_category: incomeCategory,
      caste_category: casteCategory,
      education_level: education,
      
      // Family Details
      family_size: getRandomInt(2, 8),
      marital_status: age >= 21 ? getRandomElement(['Married', 'Unmarried', 'Widowed']) : 'Unmarried',
      
      // Bank Details (for DBT)
      bank_account_number: `${getRandomInt(10000000, 99999999)}${getRandomInt(1000, 9999)}`,
      bank_name: getRandomElement(['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank']),
      bank_ifsc: `${getRandomElement(['SBIN', 'HDFC', 'ICIC', 'PUNB', 'BARB', 'CNRB', 'UBIN'])}0${getRandomInt(100000, 999999)}`,
      
      // Document Issue Details
      aadhaar_issue_date: getRandomDate(new Date('2010-01-01'), new Date('2024-12-31')).toISOString().split('T')[0],
      pan_issue_date: getRandomDate(new Date('2005-01-01'), new Date('2024-12-31')).toISOString().split('T')[0],
      voter_id_issue_date: age >= 18 ? getRandomDate(new Date(dob.getFullYear() + 18, 0, 1), new Date('2024-12-31')).toISOString().split('T')[0] : null,
      
      // Verification Status (for testing)
      verification_status: {
        aadhaar_verified: getRandomElement([true, true, true, false]), // 75% verified
        pan_verified: getRandomElement([true, true, false]), // 66% verified
        address_verified: getRandomElement([true, true, true, false]),
        income_verified: getRandomElement([true, true, false])
      },
      
      // Document Image Paths (Simulated)
      document_images: {
        aadhaar_front: `/documents/aadhaar_${aadhaarNumber.replace(/ /g, '')}_front.jpg`,
        aadhaar_back: `/documents/aadhaar_${aadhaarNumber.replace(/ /g, '')}_back.jpg`,
        pan_card: `/documents/pan_${panNumber}.jpg`,
        voter_id: `/documents/voter_${voterID}.jpg`,
        ration_card: `/documents/ration_${rationCard.replace(/\//g, '_')}.jpg`,
        income_certificate: `/documents/income_cert_${i + 1}.pdf`,
        caste_certificate: casteCategory !== 'General' ? `/documents/caste_cert_${i + 1}.pdf` : null,
        bank_passbook: `/documents/bank_passbook_${i + 1}.jpg`
      },
      
      // OCR Confidence Scores (for testing)
      ocr_confidence: {
        aadhaar: getRandomInt(85, 99),
        pan: getRandomInt(85, 99),
        voter_id: getRandomInt(80, 98),
        income_cert: getRandomInt(75, 95)
      },
      
      // Notes
      notes: `Dummy document ${i + 1} for testing. Generated automatically for Scheme Saarthi.`,
      generated_at: new Date().toISOString()
    };

    documents.push(document);
  }

  return documents;
}

// Generate Income Certificates
function generateIncomeCertificates(documents) {
  return documents.map((doc, index) => ({
    certificate_number: `IC/${doc.address.state.substring(0, 2).toUpperCase()}/${doc.address.district.substring(0, 3).toUpperCase()}/${new Date().getFullYear()}/${String(index + 1).padStart(6, '0')}`,
    applicant_name: doc.name,
    father_name: doc.father_name,
    address: doc.address.full_address,
    annual_income: doc.annual_income,
    income_source: doc.occupation,
    issue_date: getRandomDate(new Date('2024-01-01'), new Date('2026-02-28')).toISOString().split('T')[0],
    valid_upto: getRandomDate(new Date('2026-03-01'), new Date('2027-02-28')).toISOString().split('T')[0],
    issuing_authority: `Tehsildar, ${doc.address.district}`,
    issuing_office: `Tehsil Office, ${doc.address.district}, ${doc.address.state}`,
    seal: 'Government Seal',
    signature: 'Authorized Signatory',
    remarks: doc.annual_income <= 100000 ? 'Below Income Tax Slab' : 'Income Tax Applicable'
  }));
}

// Generate Caste Certificates
function generateCasteCertificates(documents) {
  return documents
    .filter(doc => doc.caste_category !== 'General')
    .map((doc, index) => ({
      certificate_number: `CC/${doc.address.state.substring(0, 2).toUpperCase()}/${doc.address.district.substring(0, 3).toUpperCase()}/${new Date().getFullYear()}/${String(index + 1).padStart(6, '0')}`,
      applicant_name: doc.name,
      father_name: doc.father_name,
      caste: doc.caste_category,
      sub_caste: getRandomElement(['Sub-caste A', 'Sub-caste B', 'Sub-caste C']),
      address: doc.address.full_address,
      issue_date: getRandomDate(new Date('2020-01-01'), new Date('2025-12-31')).toISOString().split('T')[0],
      issuing_authority: `Revenue Divisional Officer, ${doc.address.district}`,
      issuing_office: `Collectorate, ${doc.address.district}, ${doc.address.state}`,
      purpose: 'For Government Scheme Application',
      seal: 'Government Seal',
      signature: 'RDO Signature'
    }));
}

// Generate Land Records (for farmers)
function generateLandRecords(documents) {
  return documents
    .filter(doc => doc.occupation_type === 'farmer')
    .map((doc, index) => ({
      khata_number: `${getRandomInt(100, 999)}/${getRandomInt(1000, 9999)}`,
      survey_number: `${getRandomInt(100, 500)}/${getRandomInt(1, 50)}`,
      owner_name: doc.name,
      father_name: doc.father_name,
      village: doc.address.village_city,
      district: doc.address.district,
      state: doc.address.state,
      land_area_acres: (getRandomInt(50, 500) / 100).toFixed(2), // 0.5 to 5 acres
      land_type: getRandomElement(['Agricultural', 'Irrigated', 'Dry Land', 'Mixed']),
      crops_grown: getRandomElement(['Paddy', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Mixed Crops']),
      ownership_type: getRandomElement(['Owner', 'Lease', 'Partnership']),
      revenue_paid: getRandomElement([true, true, true, false]),
      encumbrance_status: 'Free from encumbrances',
      document_path: `/documents/land_record_${index + 1}.pdf`
    }));
}

// Save to JSON files
function saveDummyData() {
  const outputDir = path.join(__dirname, 'dummy_data');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🌱 Generating Dummy Indian Government Documents...\n');

  // Generate documents
  const documents = generateDummyDocuments(100);
  const incomeCerts = generateIncomeCertificates(documents);
  const casteCerts = generateCasteCertificates(documents);
  const landRecords = generateLandRecords(documents);

  // Save to files
  fs.writeFileSync(
    path.join(outputDir, 'citizens_with_documents.json'),
    JSON.stringify(documents, null, 2)
  );
  console.log(`✅ Generated ${documents.length} citizen documents → citizens_with_documents.json`);

  fs.writeFileSync(
    path.join(outputDir, 'income_certificates.json'),
    JSON.stringify(incomeCerts, null, 2)
  );
  console.log(`✅ Generated ${incomeCerts.length} income certificates → income_certificates.json`);

  fs.writeFileSync(
    path.join(outputDir, 'caste_certificates.json'),
    JSON.stringify(casteCerts, null, 2)
  );
  console.log(`✅ Generated ${casteCerts.length} caste certificates → caste_certificates.json`);

  fs.writeFileSync(
    path.join(outputDir, 'land_records.json'),
    JSON.stringify(landRecords, null, 2)
  );
  console.log(`✅ Generated ${landRecords.length} land records → land_records.json`);

  // Generate summary statistics
  const summary = {
    total_citizens: documents.length,
    gender_distribution: {
      male: documents.filter(d => d.gender === 'Male').length,
      female: documents.filter(d => d.gender === 'Female').length
    },
    income_categories: {
      BPL: documents.filter(d => d.income_category === 'BPL').length,
      APL: documents.filter(d => d.income_category === 'APL').length,
      EWS: documents.filter(d => d.income_category === 'EWS').length,
      Middle: documents.filter(d => d.income_category === 'Middle').length,
      Upper: documents.filter(d => d.income_category === 'Upper').length
    },
    caste_categories: {
      SC: documents.filter(d => d.caste_category === 'SC').length,
      ST: documents.filter(d => d.caste_category === 'ST').length,
      OBC: documents.filter(d => d.caste_category === 'OBC').length,
      General: documents.filter(d => d.caste_category === 'General').length
    },
    occupation_types: {
      farmer: documents.filter(d => d.occupation_type === 'farmer').length,
      student: documents.filter(d => d.occupation_type === 'student').length,
      employed: documents.filter(d => d.occupation_type === 'employed').length,
      self_employed: documents.filter(d => d.occupation_type === 'self_employed').length,
      daily_wage: documents.filter(d => d.occupation_type === 'daily_wage').length,
      unemployed: documents.filter(d => d.occupation_type === 'unemployed').length
    },
    age_groups: {
      'below_18': documents.filter(d => d.age < 18).length,
      '18_30': documents.filter(d => d.age >= 18 && d.age <= 30).length,
      '31_45': documents.filter(d => d.age >= 31 && d.age <= 45).length,
      '46_60': documents.filter(d => d.age >= 46 && d.age <= 60).length,
      'above_60': documents.filter(d => d.age > 60).length
    },
    states_covered: Object.keys(statesAndDistricts).length,
    verification_rate: {
      aadhaar: ((documents.filter(d => d.verification_status.aadhaar_verified).length / documents.length) * 100).toFixed(1) + '%',
      pan: ((documents.filter(d => d.verification_status.pan_verified).length / documents.length) * 100).toFixed(1) + '%',
      income: ((documents.filter(d => d.verification_status.income_verified).length / documents.length) * 100).toFixed(1) + '%'
    }
  };

  fs.writeFileSync(
    path.join(outputDir, 'summary_statistics.json'),
    JSON.stringify(summary, null, 2)
  );
  console.log(`✅ Generated summary statistics → summary_statistics.json`);

  console.log('\n📊 SUMMARY STATISTICS');
  console.log('==========================================');
  console.log(`Total Citizens: ${summary.total_citizens}`);
  console.log(`\nGender Distribution:`);
  console.log(`  Male: ${summary.gender_distribution.male}`);
  console.log(`  Female: ${summary.gender_distribution.female}`);
  console.log(`\nIncome Categories:`);
  Object.entries(summary.income_categories).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
  console.log(`\nCaste Categories:`);
  Object.entries(summary.caste_categories).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
  console.log(`\nOccupation Types:`);
  Object.entries(summary.occupation_types).forEach(([occ, count]) => {
    console.log(`  ${occ}: ${count}`);
  });
  console.log('\n✅ All dummy data generated successfully!');
  console.log(`📁 Output directory: ${outputDir}`);
  console.log('==========================================\n');
}

// Run the generator
saveDummyData();

module.exports = {
  generateDummyDocuments,
  generateIncomeCertificates,
  generateCasteCertificates,
  generateLandRecords
};
