const {
  BedrockRuntimeClient,
  BedrockAgentRuntimeClient,
} = require("@aws-sdk/client-bedrock-runtime");
const { TranscribeClient } = require("@aws-sdk/client-transcribe");
const { PollyClient } = require("@aws-sdk/client-polly");
const { TextractClient } = require("@aws-sdk/client-textract");
const { S3Client } = require("@aws-sdk/client-s3");

let awsClients = {};

const initializeAWS = () => {
  const region = process.env.AWS_REGION || "ap-south-1";

  const config = {
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  };

  // Initialize all AWS clients
  awsClients = {
    bedrock: new BedrockRuntimeClient(config),
    bedrockAgent: new BedrockAgentRuntimeClient(config),
    transcribe: new TranscribeClient(config),
    polly: new PollyClient(config),
    textract: new TextractClient(config),
    s3: new S3Client(config),
  };

  console.log("✅ AWS services initialized for region:", region);
  return awsClients;
};

const getAWSClients = () => {
  if (!awsClients.bedrock) {
    throw new Error("AWS clients not initialized. Call initializeAWS() first.");
  }
  return awsClients;
};

module.exports = {
  initializeAWS,
  getAWSClients,
};
