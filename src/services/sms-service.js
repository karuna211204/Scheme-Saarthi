const twilio = require("twilio");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getAWSClients } = require("./aws-config");

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendSchemeEligibilityPDF(userPhone, eligibilityData, language = "hi") {
    try {
      // Generate PDF
      const pdfBuffer = await this.generateEligibilityPDF(
        eligibilityData,
        language,
      );

      // Upload to S3
      const pdfUrl = await this.uploadPDFToS3(
        pdfBuffer,
        eligibilityData.userId,
      );

      // Generate short URL or QR code
      const shortUrl = await this.generateShortUrl(pdfUrl);

      // Send SMS with PDF link
      const message = await this.sendSMS(
        userPhone,
        shortUrl,
        eligibilityData,
        language,
      );

      return {
        success: true,
        messageId: message.sid,
        pdfUrl: shortUrl,
        message: "PDF sent successfully via SMS",
      };
    } catch (error) {
      console.error("SMS PDF sending error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async generateEligibilityPDF(eligibilityData, language = "hi") {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header
        doc
          .fontSize(20)
          .fillColor("#1e40af")
          .text("Scheme Saarthi - योजना सारथी", { align: "center" });

        doc.moveDown();
        doc
          .fontSize(16)
          .fillColor("#000")
          .text(
            language === "hi"
              ? "योजना पात्रता रिपोर्ट"
              : language === "te"
                ? "స్కీమ్ అర్హత నివేదిక"
                : "Scheme Eligibility Report",
            { align: "center" },
          );

        doc.moveDown(2);

        // User Information
        doc
          .fontSize(14)
          .fillColor("#374151")
          .text(
            language === "hi"
              ? "व्यक्तिगत जानकारी:"
              : language === "te"
                ? "వ్యక్తిగత సమాచారం:"
                : "Personal Information:",
            { underline: true },
          );

        doc.moveDown(0.5);
        doc.fontSize(12);

        if (eligibilityData.userProfile) {
          const profile = eligibilityData.userProfile;
          doc.text(
            `${language === "hi" ? "नाम" : language === "te" ? "పేరు" : "Name"}: ${profile.name || "N/A"}`,
          );
          doc.text(
            `${language === "hi" ? "फोन" : language === "te" ? "ఫోన్" : "Phone"}: ${profile.phone || "N/A"}`,
          );
          doc.text(
            `${language === "hi" ? "आयु" : language === "te" ? "వయస్సు" : "Age"}: ${profile.age || "N/A"}`,
          );
          doc.text(
            `${language === "hi" ? "आय" : language === "te" ? "ఆదాయం" : "Income"}: ₹${profile.income || "N/A"}`,
          );
          doc.text(
            `${language === "hi" ? "राज्य" : language === "te" ? "రాష్ట్రం" : "State"}: ${profile.state || "N/A"}`,
          );
        }

        doc.moveDown(2);

        // Eligible Schemes
        doc
          .fontSize(14)
          .fillColor("#374151")
          .text(
            language === "hi"
              ? "पात्र योजनाएं:"
              : language === "te"
                ? "అర్హ స్కీమ్‌లు:"
                : "Eligible Schemes:",
            { underline: true },
          );

        doc.moveDown(0.5);
        doc.fontSize(12);

        if (
          eligibilityData.eligibleSchemes &&
          eligibilityData.eligibleSchemes.length > 0
        ) {
          eligibilityData.eligibleSchemes.forEach((scheme, index) => {
            doc
              .fillColor("#059669")
              .text(`${index + 1}. ${scheme.name}`, { continued: false });

            doc
              .fillColor("#000")
              .fontSize(10)
              .text(
                `   ${language === "hi" ? "लाभ" : language === "te" ? "ప్రయోజనం" : "Benefit"}: ${scheme.benefit}`,
              )
              .text(
                `   ${language === "hi" ? "आवेदन लिंक" : language === "te" ? "దరఖాస్తు లింక్" : "Application Link"}: ${scheme.applicationUrl}`,
              )
              .moveDown(0.5);

            doc.fontSize(12);
          });
        } else {
          doc.text(
            language === "hi"
              ? "कोई योजना नहीं मिली"
              : language === "te"
                ? "ఎటువంటి స్కీమ్ కనుగొనబడలేదు"
                : "No schemes found",
          );
        }

        doc.moveDown(2);

        // Required Documents
        if (eligibilityData.requiredDocuments) {
          doc
            .fontSize(14)
            .fillColor("#374151")
            .text(
              language === "hi"
                ? "आवश्यक दस्तावेज:"
                : language === "te"
                  ? "అవసరమైన పత్రాలు:"
                  : "Required Documents:",
              { underline: true },
            );

          doc.moveDown(0.5);
          doc.fontSize(12);

          eligibilityData.requiredDocuments.forEach((doc_name, index) => {
            doc.text(`${index + 1}. ${doc_name}`);
          });
        }

        doc.moveDown(2);

        // Footer
        doc
          .fontSize(10)
          .fillColor("#6b7280")
          .text(
            `${
              language === "hi"
                ? "रिपोर्ट जेनरेट की गई"
                : language === "te"
                  ? "నివేదిక రూపొందించబడింది"
                  : "Report generated"
            }: ${new Date().toLocaleString()}`,
            { align: "center" },
          );

        doc.text("Scheme Saarthi - AI-Powered Government Benefits Assistant", {
          align: "center",
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async uploadPDFToS3(pdfBuffer, userId) {
    try {
      const { s3 } = getAWSClients();
      const key = `eligibility-reports/${userId}/${Date.now()}-eligibility.pdf`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: pdfBuffer,
          ContentType: "application/pdf",
          Metadata: {
            "generated-by": "scheme-saarthi",
            "user-id": userId,
            type: "eligibility-report",
          },
        }),
      );

      // Generate presigned URL (valid for 7 days)
      const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      return url;
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new Error("Failed to upload PDF");
    }
  }

  async generateShortUrl(longUrl) {
    // In production, use a URL shortener service
    // For now, return the original URL
    return longUrl;
  }

  async sendSMS(phoneNumber, pdfUrl, eligibilityData, language = "hi") {
    try {
      const messages = {
        hi: `🎉 आपकी योजना पात्रता रिपोर्ट तैयार है!\n\n${eligibilityData.eligibleSchemes?.length || 0} योजनाएं मिलीं।\n\nPDF डाउनलोड करें: ${pdfUrl}\n\n- Scheme Saarthi टीम`,
        te: `🎉 మీ స్కీమ్ అర్హత నివేదిక సిద్ధంగా ఉంది!\n\n${eligibilityData.eligibleSchemes?.length || 0} స్కీమ్‌లు దొరికాయి।\n\nPDF డౌన్‌లోడ్ చేయండి: ${pdfUrl}\n\n- Scheme Saarthi బృందం`,
        en: `🎉 Your scheme eligibility report is ready!\n\nFound ${eligibilityData.eligibleSchemes?.length || 0} schemes.\n\nDownload PDF: ${pdfUrl}\n\n- Scheme Saarthi Team`,
      };

      const message = await this.client.messages.create({
        body: messages[language] || messages.en,
        from: this.fromNumber,
        to: phoneNumber,
      });

      console.log(`SMS sent successfully: ${message.sid}`);
      return message;
    } catch (error) {
      console.error("SMS sending error:", error);
      throw new Error("Failed to send SMS");
    }
  }

  async sendApplicationStatusSMS(
    phoneNumber,
    applicationData,
    language = "hi",
  ) {
    try {
      const messages = {
        hi: `📋 आवेदन स्थिति अपडेट\n\nयोजना: ${applicationData.schemeName}\nस्थिति: ${applicationData.status}\nआवेदन ID: ${applicationData.applicationId}\n\n- Scheme Saarthi`,
        te: `📋 దరఖాస్తు స్థితి నవీకరణ\n\nస్కీమ్: ${applicationData.schemeName}\nస్థితి: ${applicationData.status}\nదరఖాస్తు ID: ${applicationData.applicationId}\n\n- Scheme Saarthi`,
        en: `📋 Application Status Update\n\nScheme: ${applicationData.schemeName}\nStatus: ${applicationData.status}\nApplication ID: ${applicationData.applicationId}\n\n- Scheme Saarthi`,
      };

      const message = await this.client.messages.create({
        body: messages[language] || messages.en,
        from: this.fromNumber,
        to: phoneNumber,
      });

      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error("Application status SMS error:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSService();
