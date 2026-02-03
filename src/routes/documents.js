const express = require("express");
const multer = require("multer");
const {
  AnalyzeDocumentCommand,
  AnalyzeIDCommand,
} = require("@aws-sdk/client-textract");
const { getAWSClients } = require("../services/aws-config");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Analyze uploaded document (Aadhaar, Marksheet, etc.)
router.post("/analyze", upload.single("document"), async (req, res) => {
  try {
    const { documentType = "general", language = "hi" } = req.body;
    const documentBuffer = req.file?.buffer;

    if (!documentBuffer) {
      return res.status(400).json({ error: "Document file required" });
    }

    const { textract } = getAWSClients();
    let command;
    let analysisResult;

    if (documentType === "aadhaar" || documentType === "id") {
      // Use AnalyzeID for identity documents
      command = new AnalyzeIDCommand({
        Document: {
          Bytes: documentBuffer,
        },
      });
    } else {
      // Use AnalyzeDocument for other documents (marksheets, certificates)
      command = new AnalyzeDocumentCommand({
        Document: {
          Bytes: documentBuffer,
        },
        FeatureTypes: ["TABLES", "FORMS"],
      });
    }

    const response = await textract.send(command);

    if (documentType === "aadhaar" || documentType === "id") {
      analysisResult = parseIDDocument(response);
    } else {
      analysisResult = parseGeneralDocument(response);
    }

    res.json({
      success: true,
      documentType,
      extractedData: analysisResult,
      confidence: calculateAverageConfidence(response),
      message: getSuccessMessage(documentType, language),
    });
  } catch (error) {
    console.error("Document analysis error:", error);
    res.status(500).json({
      success: false,
      error: "Document analysis failed",
      message: getErrorMessage(error, req.body.language),
    });
  }
});

// Verify eligibility based on extracted document data
router.post("/verify-eligibility", async (req, res) => {
  try {
    const { extractedData, schemeRequirements, documentType } = req.body;

    if (!extractedData || !schemeRequirements) {
      return res
        .status(400)
        .json({ error: "Extracted data and scheme requirements needed" });
    }

    const verification = verifyAgainstRequirements(
      extractedData,
      schemeRequirements,
      documentType,
    );

    res.json({
      eligible: verification.eligible,
      reasons: verification.reasons,
      missingRequirements: verification.missing,
      extractedData,
      verificationScore: verification.score,
    });
  } catch (error) {
    console.error("Eligibility verification error:", error);
    res.status(500).json({ error: "Eligibility verification failed" });
  }
});

function parseIDDocument(textractResponse) {
  const identityDocuments = textractResponse.IdentityDocuments || [];

  if (identityDocuments.length === 0) {
    return { error: "No identity document detected" };
  }

  const document = identityDocuments[0];
  const fields = document.IdentityDocumentFields || [];

  const extractedData = {};

  fields.forEach((field) => {
    const type = field.Type?.Text;
    const value = field.ValueDetection?.Text;

    if (type && value) {
      switch (type.toLowerCase()) {
        case "name":
        case "first_name":
          extractedData.name = value;
          break;
        case "date_of_birth":
        case "dob":
          extractedData.dateOfBirth = value;
          extractedData.age = calculateAge(value);
          break;
        case "address":
          extractedData.address = value;
          break;
        case "id_number":
        case "aadhaar_number":
          extractedData.idNumber = value;
          break;
        case "gender":
          extractedData.gender = value;
          break;
      }
    }
  });

  return extractedData;
}

function parseGeneralDocument(textractResponse) {
  const blocks = textractResponse.Blocks || [];
  const extractedData = {
    text: [],
    tables: [],
    forms: {},
  };

  blocks.forEach((block) => {
    if (block.BlockType === "LINE") {
      extractedData.text.push(block.Text);
    } else if (block.BlockType === "TABLE") {
      // Parse table data (useful for marksheets)
      const tableData = parseTable(block, blocks);
      extractedData.tables.push(tableData);
    } else if (block.BlockType === "KEY_VALUE_SET") {
      // Parse form fields
      const formData = parseKeyValue(block, blocks);
      Object.assign(extractedData.forms, formData);
    }
  });

  // Special parsing for marksheets
  if (isMarksheet(extractedData.text)) {
    extractedData.marksheet = parseMarksheetData(extractedData);
  }

  return extractedData;
}

function parseMarksheetData(extractedData) {
  const marksheetData = {
    studentName: null,
    rollNumber: null,
    subjects: [],
    totalMarks: 0,
    obtainedMarks: 0,
    percentage: 0,
    grade: null,
  };

  // Extract marks from tables
  extractedData.tables.forEach((table) => {
    table.rows.forEach((row) => {
      if (row.length >= 2) {
        const subject = row[0];
        const marks = parseInt(row[row.length - 1]);

        if (!isNaN(marks) && marks > 0) {
          marksheetData.subjects.push({
            name: subject,
            marks: marks,
          });
          marksheetData.obtainedMarks += marks;
        }
      }
    });
  });

  // Calculate percentage
  if (marksheetData.subjects.length > 0) {
    marksheetData.totalMarks = marksheetData.subjects.length * 100; // Assuming 100 marks per subject
    marksheetData.percentage =
      (marksheetData.obtainedMarks / marksheetData.totalMarks) * 100;
  }

  return marksheetData;
}

function verifyAgainstRequirements(extractedData, requirements, documentType) {
  const verification = {
    eligible: true,
    reasons: [],
    missing: [],
    score: 1.0,
  };

  // Age verification
  if (requirements.minAge && extractedData.age) {
    if (extractedData.age < requirements.minAge) {
      verification.eligible = false;
      verification.reasons.push(
        `Age ${extractedData.age} is below minimum requirement of ${requirements.minAge}`,
      );
      verification.score -= 0.3;
    }
  }

  if (requirements.maxAge && extractedData.age) {
    if (extractedData.age > requirements.maxAge) {
      verification.eligible = false;
      verification.reasons.push(
        `Age ${extractedData.age} exceeds maximum limit of ${requirements.maxAge}`,
      );
      verification.score -= 0.3;
    }
  }

  // Marks/Percentage verification for education schemes
  if (requirements.minPercentage && extractedData.marksheet) {
    if (extractedData.marksheet.percentage < requirements.minPercentage) {
      verification.eligible = false;
      verification.reasons.push(
        `Percentage ${extractedData.marksheet.percentage.toFixed(2)}% is below requirement of ${requirements.minPercentage}%`,
      );
      verification.score -= 0.4;
    } else {
      verification.reasons.push(
        `✅ Percentage requirement met: ${extractedData.marksheet.percentage.toFixed(2)}%`,
      );
    }
  }

  // Income verification (if available in documents)
  if (requirements.maxIncome && extractedData.income) {
    if (extractedData.income > requirements.maxIncome) {
      verification.eligible = false;
      verification.reasons.push(
        `Income ₹${extractedData.income} exceeds limit of ₹${requirements.maxIncome}`,
      );
      verification.score -= 0.3;
    }
  }

  verification.score = Math.max(0, verification.score);
  return verification;
}

function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

function calculateAverageConfidence(response) {
  // Calculate average confidence from Textract response
  const blocks =
    response.Blocks ||
    response.IdentityDocuments?.[0]?.IdentityDocumentFields ||
    [];
  let totalConfidence = 0;
  let count = 0;

  blocks.forEach((block) => {
    if (block.Confidence) {
      totalConfidence += block.Confidence;
      count++;
    }
  });

  return count > 0 ? totalConfidence / count / 100 : 0;
}

function isMarksheet(textLines) {
  const marksheetKeywords = [
    "marks",
    "grade",
    "percentage",
    "result",
    "marksheet",
    "transcript",
  ];
  const text = textLines.join(" ").toLowerCase();
  return marksheetKeywords.some((keyword) => text.includes(keyword));
}

function getSuccessMessage(documentType, language) {
  const messages = {
    hi: {
      aadhaar: "✅ आधार कार्ड सफलतापूर्वक स्कैन किया गया",
      marksheet: "✅ मार्कशीट सफलतापूर्वक स्कैन की गई",
      general: "✅ दस्तावेज़ सफलतापूर्वक स्कैन किया गया",
    },
    te: {
      aadhaar: "✅ ఆధార్ కార్డ్ విజయవంతంగా స్కాన్ చేయబడింది",
      marksheet: "✅ మార్క్‌షీట్ విజయవంతంగా స్కాన్ చేయబడింది",
      general: "✅ పత్రం విజయవంతంగా స్కాన్ చేయబడింది",
    },
    en: {
      aadhaar: "✅ Aadhaar card scanned successfully",
      marksheet: "✅ Marksheet scanned successfully",
      general: "✅ Document scanned successfully",
    },
  };

  return (
    messages[language]?.[documentType] ||
    messages.en[documentType] ||
    messages.en.general
  );
}

function getErrorMessage(error, language = "en") {
  const messages = {
    hi: "❌ दस्तावेज़ स्कैन करने में त्रुटि। कृपया स्पष्ट फोटो अपलोड करें।",
    te: "❌ పత్రం స్కాన్ చేయడంలో లోపం. దయచేసి స్పష్టమైన ఫోటో అప్‌లోడ్ చేయండి.",
    en: "❌ Error scanning document. Please upload a clear photo.",
  };

  return messages[language] || messages.en;
}

// Helper functions for table and form parsing
function parseTable(tableBlock, allBlocks) {
  // Implementation for parsing table structure from Textract
  return { rows: [] }; // Simplified
}

function parseKeyValue(kvBlock, allBlocks) {
  // Implementation for parsing key-value pairs from forms
  return {}; // Simplified
}

module.exports = router;
