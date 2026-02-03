const express = require("express");
const multer = require("multer");
const voiceService = require("../services/voice-service");
const bedrockService = require("../services/bedrock-service");
const sipService = require("../services/sip-service");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Process voice input
router.post("/process", upload.single("audio"), async (req, res) => {
  try {
    const { language = "hi", sessionId } = req.body;
    const audioBuffer = req.file?.buffer;

    if (!audioBuffer) {
      return res.status(400).json({ error: "Audio file required" });
    }

    // Transcribe audio
    const transcription = await voiceService.transcribeAudio(
      audioBuffer,
      language,
    );

    // Process with AI
    const response = await bedrockService.processConversation(
      [{ role: "user", content: transcription.text }],
      req.session?.userProfile || {},
    );

    // Check if escalation is needed
    const conversationContext = {
      lastMessage: transcription.text,
      messageCount: req.session?.messageCount || 1,
      failedAttempts: req.session?.failedAttempts || 0,
      hasResolution: false,
    };

    const shouldEscalate =
      sipService.shouldEscalateToHuman(conversationContext);

    if (shouldEscalate) {
      const escalationResult = await sipService.escalateToHuman(
        req.session?.userPhone,
        conversationContext,
        language,
      );

      if (escalationResult.success) {
        return res.json({
          text: escalationResult.message,
          escalated: true,
          callId: escalationResult.callId,
        });
      }
    }

    // Generate voice response
    const audioResponse = await voiceService.synthesizeSpeech(
      response,
      language,
    );

    res.json({
      text: response,
      transcription: transcription.text,
      language: transcription.language,
      audioUrl: `/api/voice/audio/${sessionId}`, // Would serve the generated audio
      escalated: false,
    });
  } catch (error) {
    console.error("Voice processing error:", error);
    res.status(500).json({ error: "Voice processing failed" });
  }
});

// Escalate to human customer care
router.post("/escalate", async (req, res) => {
  try {
    const { userPhone, conversationContext, language = "hi" } = req.body;

    if (!userPhone) {
      return res.status(400).json({ error: "User phone number required" });
    }

    const result = await sipService.escalateToHuman(
      userPhone,
      conversationContext,
      language,
    );
    res.json(result);
  } catch (error) {
    console.error("Escalation error:", error);
    res.status(500).json({ error: "Escalation failed" });
  }
});

// End escalated call
router.post("/end-call/:callId", async (req, res) => {
  try {
    const { callId } = req.params;
    const result = await sipService.endCall(callId);

    res.json({ success: result });
  } catch (error) {
    console.error("End call error:", error);
    res.status(500).json({ error: "Failed to end call" });
  }
});

// Get call context for customer care agents
router.get("/call-context/:callId", async (req, res) => {
  try {
    const { callId } = req.params;
    const context = sipService.getActiveCallContext(callId);

    if (!context) {
      return res.status(404).json({ error: "Call context not found" });
    }

    res.json(context);
  } catch (error) {
    console.error("Get call context error:", error);
    res.status(500).json({ error: "Failed to get call context" });
  }
});

module.exports = router;
