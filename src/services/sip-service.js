const sip = require("node-sip");

class SIPService {
  constructor() {
    this.sipConfig = {
      host: process.env.SIP_SERVER_HOST,
      port: process.env.SIP_SERVER_PORT || 5060,
      username: process.env.SIP_USERNAME,
      password: process.env.SIP_PASSWORD,
    };
    this.customerCareNumber = process.env.CUSTOMER_CARE_NUMBER;
    this.activeCalls = new Map();
  }

  async initializeSIP() {
    try {
      // Initialize SIP client
      this.sipClient = sip.create({
        host: this.sipConfig.host,
        port: this.sipConfig.port,
        username: this.sipConfig.username,
        password: this.sipConfig.password,
      });

      console.log("✅ SIP service initialized for customer care escalation");
      return true;
    } catch (error) {
      console.error("SIP initialization error:", error);
      return false;
    }
  }

  async escalateToHuman(userPhone, conversationContext, language = "hi") {
    try {
      const callId = `escalation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare context for human agent
      const escalationContext = {
        userPhone,
        language,
        conversationSummary: conversationContext.summary,
        userProfile: conversationContext.userProfile,
        eligibleSchemes: conversationContext.eligibleSchemes,
        documentsUploaded: conversationContext.documents,
        escalationReason:
          conversationContext.escalationReason ||
          "User requested human assistance",
        timestamp: new Date().toISOString(),
      };

      // Store context for the human agent
      this.activeCalls.set(callId, escalationContext);

      // Initiate call to customer care
      const callResult = await this.initiateCall(userPhone, callId);

      if (callResult.success) {
        // Send context to customer care system
        await this.sendContextToAgent(callId, escalationContext);

        return {
          success: true,
          callId,
          message:
            language === "hi"
              ? "आपको हमारे ग्राहक सेवा प्रतिनिधि से जोड़ा जा रहा है। कृपया प्रतीक्षा करें।"
              : language === "te"
                ? "మిమ్మల్ని మా కస్టమర్ కేర్ ప్రతినిధితో కనెక్ట్ చేస్తున్నాము. దయచేసి వేచి ఉండండి."
                : "Connecting you to our customer care representative. Please wait.",
          estimatedWaitTime: "2-3 minutes",
        };
      } else {
        throw new Error("Failed to initiate call");
      }
    } catch (error) {
      console.error("Human escalation error:", error);
      return {
        success: false,
        message:
          "Unable to connect to customer care at the moment. Please try again later.",
      };
    }
  }

  async initiateCall(userPhone, callId) {
    try {
      // Create SIP call
      const call = this.sipClient.invite(this.customerCareNumber, {
        headers: {
          "X-Call-ID": callId,
          "X-User-Phone": userPhone,
          "X-Service": "scheme-saarthi-escalation",
        },
      });

      return new Promise((resolve) => {
        call.on("accepted", () => {
          console.log(`Call accepted for escalation: ${callId}`);
          resolve({ success: true, callId });
        });

        call.on("rejected", (reason) => {
          console.log(`Call rejected: ${reason}`);
          resolve({ success: false, reason });
        });

        call.on("failed", (error) => {
          console.log(`Call failed: ${error}`);
          resolve({ success: false, error });
        });

        // Timeout after 30 seconds
        setTimeout(() => {
          resolve({ success: false, reason: "timeout" });
        }, 30000);
      });
    } catch (error) {
      console.error("SIP call initiation error:", error);
      return { success: false, error: error.message };
    }
  }

  async sendContextToAgent(callId, context) {
    try {
      // This would integrate with your customer care system
      // For now, we'll log the context and could send via webhook
      console.log(
        `Context for call ${callId}:`,
        JSON.stringify(context, null, 2),
      );

      // In production, send to customer care dashboard
      // await axios.post(`${process.env.CUSTOMER_CARE_API}/context`, {
      //   callId,
      //   context
      // });

      return true;
    } catch (error) {
      console.error("Error sending context to agent:", error);
      return false;
    }
  }

  async endCall(callId) {
    try {
      if (this.activeCalls.has(callId)) {
        this.activeCalls.delete(callId);
        console.log(`Call ${callId} ended and context cleared`);
      }
      return true;
    } catch (error) {
      console.error("Error ending call:", error);
      return false;
    }
  }

  getActiveCallContext(callId) {
    return this.activeCalls.get(callId);
  }

  // Check if escalation is needed based on conversation
  shouldEscalateToHuman(conversationContext) {
    const escalationTriggers = [
      "human",
      "agent",
      "person",
      "representative",
      "मानव",
      "व्यक्ति",
      "प्रतिनिधि",
      "మనిషి",
      "వ్యక్తి",
      "ప్రతినిధి",
    ];

    const lastMessage = conversationContext.lastMessage?.toLowerCase() || "";
    const hasEscalationKeyword = escalationTriggers.some((trigger) =>
      lastMessage.includes(trigger),
    );

    const complexityScore = this.calculateComplexityScore(conversationContext);

    return hasEscalationKeyword || complexityScore > 0.8;
  }

  calculateComplexityScore(context) {
    let score = 0;

    // Multiple failed attempts
    if (context.failedAttempts > 2) score += 0.3;

    // Long conversation without resolution
    if (context.messageCount > 10 && !context.hasResolution) score += 0.2;

    // Complex document verification issues
    if (context.documentVerificationFailed) score += 0.4;

    // Multiple scheme eligibility confusion
    if (context.multipleSchemeQueries > 3) score += 0.2;

    return Math.min(score, 1.0);
  }
}

module.exports = new SIPService();
