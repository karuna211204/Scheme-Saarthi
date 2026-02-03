const express = require("express");
const bedrockService = require("../services/bedrock-service");
const smsService = require("../services/sms-service");

const router = express.Router();

// Search for schemes
router.post("/search", async (req, res) => {
  try {
    const { query, userProfile, language = "hi" } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Search query required" });
    }

    const result = await bedrockService.searchSchemes(query, userProfile);
    res.json(result);
  } catch (error) {
    console.error("Scheme search error:", error);
    res.status(500).json({ error: "Scheme search failed" });
  }
});

// Generate and send eligibility PDF via SMS
router.post("/send-eligibility-pdf", async (req, res) => {
  try {
    const { userPhone, eligibilityData, language = "hi" } = req.body;

    if (!userPhone || !eligibilityData) {
      return res
        .status(400)
        .json({ error: "User phone and eligibility data required" });
    }

    const result = await smsService.sendSchemeEligibilityPDF(
      userPhone,
      eligibilityData,
      language,
    );
    res.json(result);
  } catch (error) {
    console.error("PDF SMS error:", error);
    res.status(500).json({ error: "Failed to send PDF via SMS" });
  }
});

// Send application status update via SMS
router.post("/send-status-sms", async (req, res) => {
  try {
    const { userPhone, applicationData, language = "hi" } = req.body;

    if (!userPhone || !applicationData) {
      return res
        .status(400)
        .json({ error: "User phone and application data required" });
    }

    const result = await smsService.sendApplicationStatusSMS(
      userPhone,
      applicationData,
      language,
    );
    res.json(result);
  } catch (error) {
    console.error("Status SMS error:", error);
    res.status(500).json({ error: "Failed to send status SMS" });
  }
});

// Get scheme details by ID
router.get("/:schemeId", async (req, res) => {
  try {
    const { schemeId } = req.params;
    const { language = "hi" } = req.query;

    // This would fetch from your scheme database or knowledge base
    const schemeDetails = await bedrockService.searchSchemes(
      `scheme ID ${schemeId}`,
      {},
    );

    res.json(schemeDetails);
  } catch (error) {
    console.error("Get scheme details error:", error);
    res.status(500).json({ error: "Failed to get scheme details" });
  }
});

// Check eligibility for multiple schemes
router.post("/check-eligibility", async (req, res) => {
  try {
    const { userProfile, schemeIds = [], language = "hi" } = req.body;

    if (!userProfile) {
      return res.status(400).json({ error: "User profile required" });
    }

    const eligibilityPrompt = `
    Check eligibility for user with profile: ${JSON.stringify(userProfile)}
    ${schemeIds.length > 0 ? `For specific schemes: ${schemeIds.join(", ")}` : "For all available schemes"}
    
    Provide:
    1. List of eligible schemes with reasons
    2. Required documents for each
    3. Application process steps
    4. Benefit amounts
    `;

    const result = await bedrockService.searchSchemes(
      eligibilityPrompt,
      userProfile,
    );

    res.json({
      eligibleSchemes: result.answer,
      sources: result.sources,
      userProfile,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Eligibility check error:", error);
    res.status(500).json({ error: "Eligibility check failed" });
  }
});

module.exports = router;
