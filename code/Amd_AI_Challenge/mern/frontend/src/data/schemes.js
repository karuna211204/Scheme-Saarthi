export const SCHEMES_DATA = [
  {
    scheme_id: "PM-KISAN-001",
    scheme_name: "PM-KISAN (किसान सम्मान निधि)",
    category: "Agriculture",
    eligibilityShort: "Farmer families, land up to 2 hectares",
    benefitShort: "₹6,000 per year in 3 installments",
    description: "PM-KISAN provides income support of ₹6,000 per year to all farmer families in India. The amount is paid in three equal installments of ₹2,000 each every four months directly to bank accounts.",
    eligibility: [
      "All farmer families (landholding farmers - single farmer, joint ownership, or ownership by members of joint family)",
      "Small and marginal farmers with combined land holding up to 2 hectares",
      "Must have Aadhaar card",
      "Must have bank account with Aadhaar seeding"
    ],
    documents: [
      "Aadhaar Card",
      "Land Ownership Records", 
      "Bank Account Details with IFSC code",
      "Mobile Number"
    ],
    applicationProcess: [
      "Visit PM-KISAN portal (https://pmkisan.gov.in) or nearest Common Service Centre (CSC)",
      "Fill registration form with Aadhaar number",
      "Upload land ownership documents",
      "Submit bank account details",
      "Receive confirmation SMS",
      "First installment credited within 2-4 weeks"
    ],
    benefits: [
      "₹6,000 annual income support",
      "Direct Benefit Transfer (DBT) to bank account",
      "No application fee",
      "Coverage across all states and UTs"
    ],
    helpline: "155261 / 011-24300606",
    website: "https://pmkisan.gov.in"
  },
  {
    scheme_id: "PMAY-G-002", 
    scheme_name: "PM Awas Yojana - Gramin (Housing Scheme)",
    category: "Housing",
    eligibilityShort: "Rural houseless families, BPL cardholders",
    benefitShort: "₹1.2-1.3 lakh for house construction",
    description: "PMAY-G aims to provide pucca houses to all houseless and households living in dilapidated houses in rural areas.",
    eligibility: [
      "Must be BPL/AAY cardholder OR appear in SECC-2011 data",
      "Household should not own a pucca house", 
      "No member should have received central assistance under housing schemes",
      "Age: 18 years or above",
      "Annual income below ₹1 lakh (for plain areas), ₹1.2 lakh (for hilly/difficult areas)"
    ],
    documents: [
      "Aadhaar Card",
      "Income Certificate",
      "Bank Account Details",
      "BPL/AAY Ration Card", 
      "Landholding Documents",
      "Job Card (for MGNREGA workers)",
      "Caste Certificate (if applicable)"
    ],
    benefits: [
      "₹1,20,000 for plain areas",
      "₹1,30,000 for hilly states, difficult areas, IAP districts",
      "90/95 days of unskilled labour through MGNREGA",
      "Assistance for toilet construction (₹12,000 from Swachh Bharat Mission)"
    ],
    helpline: "1800-11-6446",
    website: "https://pmayg.nic.in"
  },
  {
    scheme_id: "PMUY-003",
    scheme_name: "PM Ujjwala Yojana (Ujjwala Scheme)", 
    category: "Energy",
    eligibilityShort: "BPL women above 18 years",
    benefitShort: "Free LPG connection worth ₹1,600",
    description: "PMUY provides LPG connections to women from Below Poverty Line (BPL) households to ensure clean cooking fuel.",
    eligibility: [
      "Woman should be at least 18 years old",
      "Must be from BPL family (SECC-2011 list)",
      "Should not have an LPG connection in the household",
      "Must have Aadhaar card and bank account"
    ],
    documents: [
      "BPL Ration Card OR SECC-2011 data",
      "Aadhaar Card of the woman applicant",
      "Bank Account Details (preferably with Aadhaar link)",
      "Address Proof (Ration Card, Voter ID, or Electricity Bill)",
      "Recent passport-size photograph"
    ],
    benefits: [
      "Free LPG connection (worth ₹1,600)",
      "Deposit-free LPG connection", 
      "EMI facility for stove and first refill",
      "First refill free (under PMUY 2.0)"
    ],
    helpline: "1906",
    website: "https://www.pmuy.gov.in"
  },
  {
    scheme_id: "NSP-SC-004",
    scheme_name: "SC/ST Pre-Matric Scholarship (छात्रवृत्ति)",
    category: "Education", 
    eligibilityShort: "SC/ST students in Classes 9-10",
    benefitShort: "₹225-525 per month + books allowance",
    description: "Provides financial assistance to SC/ST students studying in classes 9 and 10 to prevent dropouts.",
    eligibility: [
      "Student must belong to SC/ST category",
      "Studying in Class 9 or 10 in a recognized school",
      "Parental annual income below ₹2.5 lakh",
      "Minimum 50% marks in previous class (relaxed to 45% for differently-abled)",
      "Age: Typically 13-18 years"
    ],
    documents: [
      "Caste Certificate (SC/ST)",
      "Income Certificate (below ₹2.5 lakh)",
      "Previous year marksheet",
      "Aadhaar Card",
      "Bank Account Details",
      "School Bonafide Certificate"
    ],
    benefits: [
      "Day Scholar: ₹225 per month (Class 9-10)",
      "Hosteller: ₹525 per month (Class 9-10)", 
      "Books and stationery: ₹750 per year",
      "Admission fee: Actual (maximum ₹500)"
    ],
    helpline: "0120-6619540",
    website: "https://scholarships.gov.in"
  },
  {
    scheme_id: "NSP-OBC-005",
    scheme_name: "Post-Matric OBC Scholarship (ओबीसी छात्रवृत्ति)",
    category: "Education",
    eligibilityShort: "OBC students Class 11 onwards",
    benefitShort: "Full fee + ₹230-1200 monthly allowance", 
    description: "Financial assistance for OBC students pursuing higher education (Class 11 onwards) to reduce dropout rates.",
    eligibility: [
      "Student must belong to OBC category (non-creamy layer)",
      "Studying in Class 11 onwards (including graduation, post-graduation, professional courses)",
      "Parental annual income below ₹1 lakh",
      "Must have secured admission through merit/entrance exam",
      "Age: 16-35 years (up to PhD)"
    ],
    documents: [
      "OBC Certificate (non-creamy layer, within 1 year validity)",
      "Income Certificate (annual income below ₹1 lakh)",
      "Previous year marksheet (60% for renewal, 50% for first time)",
      "Aadhaar Card",
      "Bank Account Details (with Aadhaar linking)",
      "Admission letter/Fee receipt from institute"
    ],
    benefits: [
      "Full tuition fee reimbursement",
      "Day Scholar: ₹230-550/month based on course",
      "Hosteller: ₹570-1,200/month based on course",
      "Book allowance: ₹1,000-5,000/year"
    ],
    helpline: "0120-6619540", 
    website: "https://scholarships.gov.in"
  },
  {
    scheme_id: "MUDRA-006",
    scheme_name: "PM MUDRA Yojana (MUDRA Scheme)",
    category: "Women Empowerment",
    eligibilityShort: "Small businesses, no collateral needed",
    benefitShort: "Loans up to ₹10 lakh for business",
    description: "PMMY provides loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises for income-generating activities.",
    eligibility: [
      "Age: 18-65 years",
      "Indian citizen", 
      "Should have a viable business plan",
      "No existing loan default",
      "Business should be non-farm"
    ],
    documents: [
      "Aadhaar Card",
      "PAN Card (mandatory for loans above ₹1 lakh)",
      "Address proof (Voter ID, Driving License, Passport)",
      "Business plan/Project report",
      "Past 6 months bank statements",
      "Income proof (ITR/Form 16/Business statements)"
    ],
    benefits: [
      "SHISHU: Loans up to ₹50,000 (7-12% interest)",
      "KISHORE: Loans ₹50,001 to ₹5 lakh (9-14% interest)", 
      "TARUN: Loans ₹5 lakh to ₹10 lakh (10-16% interest)",
      "NO collateral required, NO processing fee"
    ],
    helpline: "1800-180-11-11",
    website: "https://www.mudra.org.in"
  },
  {
    scheme_id: "PMJAY-007",
    scheme_name: "Ayushman Bharat (आयुष्मान भारत)",
    category: "Healthcare", 
    eligibilityShort: "Bottom 40% families as per SECC-2011",
    benefitShort: "₹5 lakh health cover per family per year",
    description: "World's largest health insurance scheme providing health cover of ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
    eligibility: [
      "Bottom 40% poorest families as per SECC-2011 data",
      "Automatic eligibility (no application required if in SECC list)",
      "Rural families under 7 deprivation categories",
      "Urban families under 11 occupational categories"
    ],
    documents: [
      "Aadhaar Card (mandatory)",
      "Ration Card (BPL/AAY/PHH)", 
      "SECC-2011 data verification",
      "Mobile number (for SMS alerts)"
    ],
    benefits: [
      "Health cover: ₹5 lakh per family per year",
      "Covers: 1,943 medical procedures",
      "Includes: Secondary and tertiary care hospitalization",
      "100% cashless treatment at 15,000+ hospitals"
    ],
    helpline: "14555",
    website: "https://pmjay.gov.in"
  },
  {
    scheme_id: "IGNOAPS-008",
    scheme_name: "Old Age Pension (वृद्धावस्था पेंशन)",
    category: "Senior Citizens",
    eligibilityShort: "Senior citizens above 60, BPL families", 
    benefitShort: "₹200-500 per month + state addition",
    description: "IGNOAPS provides monthly pension to senior citizens living below the poverty line to ensure income security in old age.",
    eligibility: [
      "Age: 60 years or above",
      "Must be living below poverty line (BPL)",
      "Annual household income below ₹1 lakh (varies by state)",
      "Should not be receiving pension from any other source",
      "Should not be receiving family pension"
    ],
    documents: [
      "Age Proof (Birth Certificate, Aadhaar Card, Voter ID)",
      "Income Certificate (issued by Tehsildar/Revenue Officer)",
      "BPL Certificate (ration card or SECC-2011 data)",
      "Bank Account Details (with Aadhaar seeding)",
      "Aadhaar Card (mandatory)",
      "Recent passport-size photograph"
    ],
    benefits: [
      "Age 60-79 years: ₹200 per month (Central)",
      "Age 80+ years: ₹500 per month (Central)",
      "State addition: ₹100-₹1,000 (varies by state)",
      "Total pension typically: ₹300-₹1,500 per month"
    ],
    helpline: "1800-180-1551",
    website: "https://nsap.nic.in"
  },
  {
    scheme_id: "IGNDPS-009", 
    scheme_name: "Disability Pension (दिव्यांग पेंशन)",
    category: "Differently Abled",
    eligibilityShort: "80%+ disability, 18+ years, BPL",
    benefitShort: "₹300-500 per month + state addition",
    description: "IGNDPS provides monthly pension to persons with severe or multiple disabilities living below poverty line.",
    eligibility: [
      "Age: 18 years or above", 
      "Disability: Minimum 80% disability (certified by medical board)",
      "Must be living below poverty line (BPL)",
      "Annual household income below ₹1 lakh",
      "Not receiving pension/salary from any other source"
    ],
    documents: [
      "Disability Certificate (minimum 80%, from Medical Board)",
      "Age Proof (Birth Certificate, Aadhaar, School Certificate)",
      "Income Certificate (from Tehsildar)",
      "BPL Certificate (ration card or SECC-2011 data)",
      "Aadhaar Card (mandatory)",
      "Bank Account Details (with Aadhaar seeding)"
    ],
    benefits: [
      "Age 18-79 years: ₹300 per month (Central)",
      "Age 80+ years: ₹500 per month (Central)",
      "State addition: ₹200-₹1,500 per month",
      "Total typically: ₹500-₹2,000 per month"
    ],
    helpline: "1800-233-5956",
    website: "https://nsap.nic.in"
  },
  {
    scheme_id: "PMKVY-010",
    scheme_name: "PM Kaushal Vikas Yojana (कौशल विकास)",
    category: "Skill Development",
    eligibilityShort: "Youth 15-45 years, minimum Class 8", 
    benefitShort: "Free skill training + ₹2,000-10,000 reward",
    description: "PMKVY is India's flagship skill training scheme providing free training and certification to youth for improving employability.",
    eligibility: [
      "Age: 15-45 years (relaxed for specially-abled)",
      "Indian citizen",
      "Minimum Class 8 pass (varies by course)",
      "Unemployed or willing to upskill",
      "Should be able to read, write, and understand local language"
    ],
    documents: [
      "Aadhaar Card (mandatory)",
      "Educational certificates (highest qualification)",
      "Bank Account Details (for stipend)",
      "Passport-size photographs (3 copies)",
      "Caste Certificate (if applicable for reserved categories)"
    ],
    benefits: [
      "Free training (150-300 hours)",
      "Industry-recognized certification",
      "Monetary reward: ₹2,000 to ₹10,000",
      "Transportation allowance: ₹150-300/month",
      "70% placement assistance"
    ],
    helpline: "08800055555",
    website: "https://www.pmkvyofficial.org"
  }
];

export const SCHEME_CATEGORIES = [
  "All Categories",
  "Agriculture", 
  "Housing",
  "Energy",
  "Education",
  "Women Empowerment", 
  "Healthcare",
  "Senior Citizens",
  "Differently Abled",
  "Skill Development"
];

export const searchSchemes = (query, category = "All Categories") => {
  let filteredSchemes = SCHEMES_DATA;
  
  // Filter by category
  if (category !== "All Categories") {
    filteredSchemes = filteredSchemes.filter(scheme => scheme.category === category);
  }
  
  // Filter by search query
  if (query && query.trim() !== "") {
    const searchTerm = query.toLowerCase().trim();
    filteredSchemes = filteredSchemes.filter(scheme => 
      scheme.scheme_name.toLowerCase().includes(searchTerm) ||
      scheme.category.toLowerCase().includes(searchTerm) ||
      scheme.eligibilityShort.toLowerCase().includes(searchTerm) ||
      scheme.benefitShort.toLowerCase().includes(searchTerm) ||
      scheme.description.toLowerCase().includes(searchTerm)
    );
  }
  
  return filteredSchemes;
};

export const getSchemeById = (schemeId) => {
  return SCHEMES_DATA.find(scheme => scheme.scheme_id === schemeId);
};