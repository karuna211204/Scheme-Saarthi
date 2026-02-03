const {
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const {
  RetrieveAndGenerateCommand,
} = require("@aws-sdk/client-bedrock-agent-runtime");
const { getAWSClients } = require("./aws-config");

class BedrockService {
  constructor() {
    this.modelId =
      process.env.BEDROCK_MODEL_ID ||
      "anthropic.claude-3-5-sonnet-20241022-v2:0";
    this.knowledgeBaseId = process.env.BEDROCK_KNOWLEDGE_BASE_ID;
  }

  async invokeModel(prompt, systemPrompt = null, maxTokens = 4000) {
    try {
      const { bedrock } = getAWSClients();

      const messages = [
        {
          role: "user",
          content: prompt,
        },
      ];

      const body = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: maxTokens,
        messages,
        temperature: 0.7,
        top_p: 0.9,
      };

      if (systemPrompt) {
        body.system = systemPrompt;
      }

      const command = new InvokeModelCommand({
        modelId: this.modelId,
        body: JSON.stringify(body),
        contentType: "application/json",
        accept: "application/json",
      });

      const response = await bedrock.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return responseBody.content[0].text;
    } catch (error) {
      console.error("Bedrock invocation error:", error);
      throw new Error("Failed to get AI response");
    }
  }

  async searchSchemes(query, userContext = {}) {
    try {
      const { bedrockAgent } = getAWSClients();

      if (!this.knowledgeBaseId) {
        throw new Error("Knowledge Base ID not configured");
      }

      const command = new RetrieveAndGenerateCommand({
        input: {
          text: query,
        },
        retrieveAndGenerateConfiguration: {
          type: "KNOWLEDGE_BASE",
          knowledgeBaseConfiguration: {
            knowledgeBaseId: this.knowledgeBaseId,
            modelArn: `arn:aws:bedrock:${process.env.AWS_REGION}::foundation-model/${this.modelId}`,
            generationConfiguration: {
              promptTemplate: {
                textPromptTemplate: `You are Scheme Saarthi, an AI assistant helping Indian citizens find government benefits. 
                
User Context: ${JSON.stringify(userContext)}

Based on the retrieved scheme information, provide:
1. Eligible schemes for this user
2. Required documents
3. Application process
4. Eligibility criteria match

Query: $query$

Retrieved Information: $search_results$

Respond in a helpful, conversational tone. If the user provided their language preference, respond in that language.`,
              },
            },
          },
        },
      });

      const response = await bedrockAgent.send(command);
      return {
        answer: response.output.text,
        sources: response.citations || [],
      };
    } catch (error) {
      console.error("Knowledge base search error:", error);
      throw new Error("Failed to search schemes");
    }
  }

  async processConversation(messages, userProfile = {}) {
    const systemPrompt = `You are Scheme Saarthi, an AI-powered government benefit assistant for India. Your role is to help citizens discover and apply for government schemes they're eligible for.

Key capabilities:
1. Understand queries in Hindi, Telugu, Tamil, and English
2. Match user profiles with scheme eligibility criteria
3. Guide through application processes
4. Verify documents using OCR analysis

User Profile: ${JSON.stringify(userProfile)}

Guidelines:
- Be conversational and helpful
- Ask clarifying questions to understand eligibility
- Explain complex processes in simple terms
- Respond in the user's preferred language
- Focus on actionable next steps`;

    const conversationText = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    return await this.invokeModel(conversationText, systemPrompt);
  }
}

module.exports = new BedrockService();
