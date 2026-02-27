/**
 * Sales Lead Qualification Service
 * Implements autonomous lead qualification and enrichment
 */

const mongoose = require('mongoose');
const Citizen = mongoose.models.Citizen || require('../models/Citizen');
const Consultation = mongoose.models.Consultation || require('../models/Consultation');
const Application = mongoose.models.Application || require('../models/Application');

/**
 * Ideal Customer Profile (ICP) Configuration
 * Customize this based on Guntur Electronics' ideal customers
 */
const ICP_CRITERIA = {
  // Past purchase history
  min_past_purchases: 1,
  preferred_past_purchases: 3,
  min_total_spent: 10000, // ₹10,000
  preferred_total_spent: 50000, // ₹50,000

  // Engagement
  min_engagement_score: 30,
  preferred_engagement_score: 70,

  // Product interest categories (high-value products)
  high_value_products: ['Air Conditioner', 'Refrigerator', 'Washing Machine', 'LED TV', 'Home Theater'],
  medium_value_products: ['Microwave', 'Mixer Grinder', 'Vacuum Cleaner', 'Water Purifier'],

  // Warranty/AMC indicators (good repeat customers)
  has_active_warranty: true,
  has_amc: true,

  // Recency (last interaction within X days)
  max_days_since_last_interaction: 180, // 6 months
};

/**
 * Calculate Lead Score (0-100)
 * Based on past purchases, engagement, and ICP match
 */
async function calculateLeadScore(leadData, customerHistory = null) {
  let score = 0;

  try {
    // If we have customer history (existing customer)
    if (customerHistory) {
      // Past purchases (max 30 points)
      const purchaseCount = customerHistory.past_purchases_count || 0;
      score += Math.min(purchaseCount * 10, 30);

      // Total spent (max 25 points)
      const totalSpent = customerHistory.total_spent || 0;
      if (totalSpent > ICP_CRITERIA.preferred_total_spent) score += 25;
      else if (totalSpent > ICP_CRITERIA.min_total_spent) score += 15;

      // Has active warranty/AMC (max 15 points)
      if (customerHistory.has_active_warranty) score += 10;
      if (customerHistory.has_amc) score += 5;

      // Recency of last interaction (max 15 points)
      if (customerHistory.last_interaction_date) {
        const daysSinceLastInteraction = Math.floor(
          (new Date() - new Date(customerHistory.last_interaction_date)) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastInteraction <= 30) score += 15;
        else if (daysSinceLastInteraction <= 90) score += 10;
        else if (daysSinceLastInteraction <= 180) score += 5;
      }

      // Engagement score (max 15 points)
      const engagementScore = customerHistory.engagement_score || 0;
      score += Math.floor(engagementScore * 0.15);
    } else {
      // New lead (no history) - more generous base score for manual leads
      score = 35; // Increased from 20 to give new leads a better chance

      // Lead type bonus for specific campaigns
      if (leadData.lead_type === 'inbound_inquiry') score += 10; // Customer reached out
      if (leadData.lead_type === 'festival_offer') score += 5;
      if (leadData.lead_type === 'new_purchase') score += 10;
    }

    // Product interest value (max 20 points)
    if (leadData.product_interest) {
      if (ICP_CRITERIA.high_value_products.some(p => leadData.product_interest.toLowerCase().includes(p.toLowerCase()))) {
        score += 20;
      } else if (ICP_CRITERIA.medium_value_products.some(p => leadData.product_interest.toLowerCase().includes(p.toLowerCase()))) {
        score += 12;
      } else {
        score += 8; // Any product interest is better than none
      }
    }

    // Budget range bonus (shows serious intent)
    if (leadData.budget_range) {
      score += 5;
    }

    // Email provided (easier to follow up)
    if (leadData.email) {
      score += 3;
    }

    // Company provided (potential B2B)
    if (leadData.company) {
      score += 7;
    }

    // Lead source bonus
    if (leadData.source === 'referral') score += 10;
    if (leadData.source === 'website') score += 8;
    if (leadData.source === 'phone') score += 5;

  } catch (error) {
    console.error('Error calculating lead score:', error);
  }

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Calculate ICP Match Score (0-100)
 * How well does this lead match our Ideal Customer Profile?
 */
function calculateICPMatchScore(leadData, customerHistory = null) {
  let matchScore = 0;
  let criteria_met = 0;
  let total_criteria = 7;

  if (customerHistory) {
    // Past purchases criteria
    if ((customerHistory.past_purchases_count || 0) >= ICP_CRITERIA.preferred_past_purchases) criteria_met++;
    else if ((customerHistory.past_purchases_count || 0) >= ICP_CRITERIA.min_past_purchases) criteria_met += 0.5;

    // Total spent criteria
    if ((customerHistory.total_spent || 0) >= ICP_CRITERIA.preferred_total_spent) criteria_met++;
    else if ((customerHistory.total_spent || 0) >= ICP_CRITERIA.min_total_spent) criteria_met += 0.5;

    // Engagement criteria
    if ((customerHistory.engagement_score || 0) >= ICP_CRITERIA.preferred_engagement_score) criteria_met++;
    else if ((customerHistory.engagement_score || 0) >= ICP_CRITERIA.min_engagement_score) criteria_met += 0.5;

    // Warranty/AMC criteria
    if (customerHistory.has_active_warranty) criteria_met++;
    if (customerHistory.has_amc) criteria_met++;

    // Recency criteria
    if (customerHistory.last_interaction_date) {
      const daysSinceLastInteraction = Math.floor(
        (new Date() - new Date(customerHistory.last_interaction_date)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastInteraction <= ICP_CRITERIA.max_days_since_last_interaction) criteria_met++;
    }
  } else {
    // New lead - give credit for having key information
    total_criteria = 3;

    // Product interest in high-value category
    if (leadData.product_interest && ICP_CRITERIA.high_value_products.some(p =>
      leadData.product_interest.toLowerCase().includes(p.toLowerCase())
    )) {
      criteria_met += 1;
    } else if (leadData.product_interest) {
      criteria_met += 0.5; // Any product interest is good
    }

    // Has budget range (shows intent)
    if (leadData.budget_range) {
      criteria_met += 1;
    }

    // Has complete contact info
    if (leadData.email && leadData.phone) {
      criteria_met += 1;
    } else if (leadData.phone) {
      criteria_met += 0.5;
    }
  }

  // Product interest value
  if (leadData.product_interest && ICP_CRITERIA.high_value_products.some(p =>
    leadData.product_interest.toLowerCase().includes(p.toLowerCase())
  )) {
    criteria_met++;
  }
  total_criteria++;

  matchScore = Math.round((criteria_met / total_criteria) * 100);
  return matchScore;
}

/**
 * Get customer engagement history
 * Cross-references appointments, warranties, past purchases
 */
async function getCustomerEngagementHistory(phone) {
  try {
    // Find citizen by phone
    const citizen = await Citizen.findOne({ phone });

    if (!citizen) {
      return null; // New lead, no history
    }

    // Get consultations (service history)
    const consultations = await Consultation.find({ phone });

    // Get applications (purchase history)
    const applications = await Application.find({ phone });

    // Calculate engagement metrics
    const past_purchases_count = applications.length;
    const total_spent = applications.reduce((sum, w) => sum + (w.purchase_amount || 0), 0);
    const last_interaction_date = Math.max(
      ...consultations.map(a => new Date(a.created_at).getTime()),
      ...applications.map(w => new Date(w.created_at).getTime())
    );

    // Check active warranty/AMC
    const now = new Date();
    const has_active_warranty = applications.some(w =>
      w.warranty_expiry && new Date(w.warranty_expiry) > now
    );
    const has_amc = applications.some(w => w.amc_enrolled === true);

    // Calculate engagement score (0-100)
    let engagement_score = 0;
    engagement_score += Math.min(consultations.length * 5, 30); // Max 30 for consultations
    engagement_score += Math.min(past_purchases_count * 10, 40); // Max 40 for purchases
    if (has_active_warranty) engagement_score += 15;
    if (has_amc) engagement_score += 15;
    engagement_score = Math.min(engagement_score, 100);

    return {
      customer_id: citizen._id,
      customer_name: citizen.name,
      email: citizen.email,
      past_purchases_count,
      total_spent,
      last_interaction_date: new Date(last_interaction_date),
      has_active_warranty,
      has_amc,
      engagement_score,
      appointments_count: appointments.length,
      warranties_count: warranties.length
    };

  } catch (error) {
    console.error('Error fetching customer engagement history:', error);
    return null;
  }
}

/**
 * Determine qualification status based on lead score
 */
function determineQualificationStatus(leadScore, icpMatchScore) {
  // More lenient thresholds for new leads
  if (leadScore >= 65 && icpMatchScore >= 65) return 'high_priority';
  if (leadScore >= 45 && icpMatchScore >= 40) return 'qualified';
  if (leadScore < 25) return 'disqualified'; // Only truly bad leads
  return 'unqualified'; // Needs nurturing
}

/**
 * Main function: Qualify and Enrich Lead
 * This is called when a new lead is created or updated
 */
async function qualifyAndEnrichLead(leadData) {
  try {
    console.log(`[Lead Qualification] Processing lead: ${leadData.customer_name} (${leadData.phone})`);

    // Step 1: Get customer engagement history (past interactions)
    const customerHistory = await getCustomerEngagementHistory(leadData.phone);

    // Step 2: Calculate lead score
    const lead_score = await calculateLeadScore(leadData, customerHistory);

    // Step 3: Calculate ICP match score
    const icp_match_score = calculateICPMatchScore(leadData, customerHistory);

    // Step 4: Determine qualification status
    const qualification_status = determineQualificationStatus(lead_score, icp_match_score);

    // Step 5: Prepare enrichment data
    const enrichment_data = {
      enriched_at: new Date()
    };

    // If customer exists, add their data
    if (customerHistory) {
      enrichment_data.company_size = 'individual'; // For B2C
      enrichment_data.location = 'Guntur'; // Default
    }

    // Step 6: Prepare engagement data
    const engagement_data = customerHistory ? {
      engagement_score: customerHistory.engagement_score,
      past_purchases_count: customerHistory.past_purchases_count,
      total_spent: customerHistory.total_spent,
      last_interaction_date: customerHistory.last_interaction_date
    } : {
      engagement_score: 0,
      past_purchases_count: 0,
      total_spent: 0,
      last_interaction_date: null
    };

    const result = {
      lead_score,
      icp_match_score,
      qualification_status,
      enrichment_data,
      ...engagement_data,
      customer_id: customerHistory ? customerHistory.customer_id : null
    };

    console.log(`[Lead Qualification] Result: Score=${lead_score}, ICP=${icp_match_score}, Status=${qualification_status}`);

    return result;

  } catch (error) {
    console.error('[Lead Qualification] Error:', error);
    throw error;
  }
}

module.exports = {
  qualifyAndEnrichLead,
  calculateLeadScore,
  calculateICPMatchScore,
  getCustomerEngagementHistory,
  ICP_CRITERIA
};
