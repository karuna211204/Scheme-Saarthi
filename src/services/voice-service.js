const {
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
} = require("@aws-sdk/client-transcribe");
const { SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");
const { getAWSClients } = require("./aws-config");

class VoiceService {
  constructor() {
    this.supportedLanguages = {
      hi: { transcribe: "hi-IN", polly: "hi-IN", voice: "Aditi" },
      te: { transcribe: "te-IN", polly: "te-IN", voice: "Aditi" }, // Fallback to Hindi voice
      ta: { transcribe: "ta-IN", polly: "ta-IN", voice: "Aditi" }, // Fallback to Hindi voice
      en: { transcribe: "en-IN", polly: "en-IN", voice: "Raveena" },
    };
  }

  async transcribeAudio(audioBuffer, language = "hi") {
    try {
      const { transcribe, s3 } = getAWSClients();

      // Upload audio to S3 first (required for Transcribe)
      const audioKey = `audio/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.wav`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: audioKey,
          Body: audioBuffer,
          ContentType: "audio/wav",
        }),
      );

      const jobName = `transcribe-${Date.now()}`;
      const languageCode =
        this.supportedLanguages[language]?.transcribe || "hi-IN";

      const command = new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        LanguageCode: languageCode,
        Media: {
          MediaFileUri: `s3://${process.env.S3_BUCKET_NAME}/${audioKey}`,
        },
        OutputBucketName: process.env.S3_BUCKET_NAME,
      });

      await transcribe.send(command);

      // Poll for completion
      let jobStatus = "IN_PROGRESS";
      let transcript = "";

      while (jobStatus === "IN_PROGRESS") {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const statusCommand = new GetTranscriptionJobCommand({
          TranscriptionJobName: jobName,
        });

        const statusResponse = await transcribe.send(statusCommand);
        jobStatus = statusResponse.TranscriptionJob.TranscriptionJobStatus;

        if (jobStatus === "COMPLETED") {
          // Get transcript from S3
          const transcriptUri =
            statusResponse.TranscriptionJob.Transcript.TranscriptFileUri;
          // Parse and extract transcript text
          transcript = await this.extractTranscriptText(transcriptUri);
        }
      }

      return {
        text: transcript,
        language: languageCode,
        confidence: 0.95, // Placeholder
      };
    } catch (error) {
      console.error("Transcription error:", error);
      throw new Error("Failed to transcribe audio");
    }
  }

  async synthesizeSpeech(text, language = "hi") {
    try {
      const { polly } = getAWSClients();

      const langConfig =
        this.supportedLanguages[language] || this.supportedLanguages["hi"];

      const command = new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: "mp3",
        VoiceId: langConfig.voice,
        LanguageCode: langConfig.polly,
        Engine: "neural", // Use neural voices for better quality
      });

      const response = await polly.send(command);

      return {
        audioStream: response.AudioStream,
        contentType: "audio/mpeg",
      };
    } catch (error) {
      console.error("Speech synthesis error:", error);
      throw new Error("Failed to synthesize speech");
    }
  }

  async extractTranscriptText(transcriptUri) {
    // This would fetch and parse the JSON transcript from S3
    // Simplified implementation
    try {
      const response = await fetch(transcriptUri);
      const data = await response.json();
      return data.results.transcripts[0].transcript;
    } catch (error) {
      console.error("Transcript extraction error:", error);
      return "";
    }
  }

  detectLanguage(text) {
    // Simple language detection based on script
    if (/[\u0900-\u097F]/.test(text)) return "hi"; // Devanagari (Hindi)
    if (/[\u0C00-\u0C7F]/.test(text)) return "te"; // Telugu
    if (/[\u0B80-\u0BFF]/.test(text)) return "ta"; // Tamil
    return "en"; // Default to English
  }
}

module.exports = new VoiceService();
