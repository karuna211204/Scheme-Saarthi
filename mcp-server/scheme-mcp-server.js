#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} = require("@aws-sdk/client-bedrock-agent-runtime");

class SchemeMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "scheme-saarthi-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.bedrockClient = new BedrockAgentRuntimeClient({
      region: process.env.AWS_REGION || "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.knowledgeBaseId = process.env.BEDROCK_KNOWLEDGE_BASE_ID;
    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "search_schemes",
            description:
              "Search government schemes based on user query and profile",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description:
                    'Search query for schemes (e.g., "scholarship for SC students")',
                },
                userProfile: {
                  type: "object",
                  properties: {
                    age: { type: "number" },
                    income: { type: "number" },
                    category: { type: "string" },
                    state: { type: "string" },
                    education: { type: "string" },
                    occupation: { type: "string" },
                  },
                  description: "User profile for eligibility matching",
                },
                language: {
                  type: "string",
                  enum: ["hi", "te", "ta", "en"],
                  description: "Response language preference",
                },
              },
              required: ["query"],
            },
          },
          {
            name: "get_scheme_details",
            description: "Get detailed information about a specific scheme",
            inputSchema: {
              type: "object",
              properties: {
                schemeName: {
                  type: "string",
                  description: "Name or ID of the scheme",
                },
                language: {
                  type: "string",
                  enum: ["hi", "te", "ta", "en"],
                  description: "Response language preference",
                },
              },
              required: ["schemeName"],
            },
          },
          {
            name: "check_eligibility",
            description: "Check eligibility for schemes based on user profile",
            inputSchema: {
              type: "object",
              properties: {
                userProfile: {
                  type: "object",
                  properties: {
                    age: { type: "number" },
                    income: { type: "number" },
                    category: { type: "string" },
                    state: { type: "string" },
                    education: { type: "string" },
                    occupation: { type: "string" },
                    gender: { type: "string" },
                    maritalStatus: { type: "string" },
                  },
                  required: ["age", "income", "state"],
                },
                schemeTypes: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "Types of schemes to check (scholarship, subsidy, loan, etc.)",
                },
                language: {
                  type: "string",
                  enum: ["hi", "te", "ta", "en"],
                  description: "Response language preference",
                },
              },
              required: ["userProfile"],
            },
          },
          {
            name: "get_application_process",
            description: "Get step-by-step application process for a scheme",
            inputSchema: {
              type: "object",
              properties: {
                schemeName: {
                  type: "string",
                  description: "Name of the scheme",
                },
                userState: {
                  type: "string",
                  description: "User state for state-specific processes",
                },
                language: {
                  type: "string",
                  enum: ["hi", "te", "ta", "en"],
                  description: "Response language preference",
                },
              },
              required: ["schemeName"],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "search_schemes":
            return await this.searchSchemes(args);
          case "get_scheme_details":
            return await this.getSchemeDetails(args);
          case "check_eligibility":
            return await this.checkEligibility(args);
          case "get_application_process":
            return await this.getApplicationProcess(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async searchSchemes(args) {
    const { query, userProfile = {}, language = "en" } = args;

    const enhancedQuery = `
    Search for government schemes matching: ${query}
    
    User Profile: ${JSON.stringify(userProfile)}
    
    Please provide:
    1. List of matching schemes with names and brief descriptions
    2. Eligibility criteria for each scheme
    3. Benefit amounts or types
    4. Application deadlines if any
    5. Required documents
    
    Respond in ${this.getLanguageName(language)} language.
    `;

    const result = await this.queryKnowledgeBase(enhancedQuery);

    return {
      content: [
        {
          type: "text",
          text: result.answer,
        },
      ],
    };
  }

  async getSchemeDetails(args) {
    const { schemeName, language = "en" } = args;

    const query = `
    Provide detailed information about the scheme: ${schemeName}
    
    Include:
    1. Full scheme name and description
    2. Eligibility criteria (age, income, category, etc.)
    3. Required documents
    4. Application process and deadlines
    5. Benefit amount and disbursement method
    6. Contact information for queries
    7. Official website or application portal
    
    Respond in ${this.getLanguageName(language)} language.
    `;

    const result = await this.queryKnowledgeBase(query);

    return {
      content: [
        {
          type: "text",
          text: result.answer,
        },
      ],
    };
  }

  async checkEligibility(args) {
    const { userProfile, schemeTypes = [], language = "en" } = args;

    const query = `
    Check eligibility for user with profile: ${JSON.stringify(userProfile)}
    ${schemeTypes.length > 0 ? `Focus on scheme types: ${schemeTypes.join(", ")}` : ""}
    
    Provide:
    1. List of schemes the user is eligible for
    2. Schemes they are NOT eligible for with reasons
    3. Schemes they might be eligible for with additional requirements
    4. Recommended next steps
    
    Be specific about eligibility criteria matching.
    Respond in ${this.getLanguageName(language)} language.
    `;

    const result = await this.queryKnowledgeBase(query);

    return {
      content: [
        {
          type: "text",
          text: result.answer,
        },
      ],
    };
  }

  async getApplicationProcess(args) {
    const { schemeName, userState, language = "en" } = args;

    const query = `
    Provide step-by-step application process for scheme: ${schemeName}
    ${userState ? `For state: ${userState}` : ""}
    
    Include:
    1. Step-by-step application process
    2. Required documents checklist
    3. Online portal links
    4. Offline application centers
    5. Processing time
    6. Status tracking methods
    7. Common mistakes to avoid
    
    Respond in ${this.getLanguageName(language)} language.
    `;

    const result = await this.queryKnowledgeBase(query);

    return {
      content: [
        {
          type: "text",
          text: result.answer,
        },
      ],
    };
  }

  async queryKnowledgeBase(query) {
    try {
      const command = new RetrieveAndGenerateCommand({
        input: {
          text: query,
        },
        retrieveAndGenerateConfiguration: {
          type: "KNOWLEDGE_BASE",
          knowledgeBaseConfiguration: {
            knowledgeBaseId: this.knowledgeBaseId,
            modelArn: `arn:aws:bedrock:${process.env.AWS_REGION}::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0`,
          },
        },
      });

      const response = await this.bedrockClient.send(command);

      return {
        answer: response.output.text,
        sources: response.citations || [],
      };
    } catch (error) {
      console.error("Knowledge base query error:", error);
      throw new Error("Failed to query scheme knowledge base");
    }
  }

  getLanguageName(code) {
    const languages = {
      hi: "Hindi",
      te: "Telugu",
      ta: "Tamil",
      en: "English",
    };
    return languages[code] || "English";
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Scheme Saarthi MCP Server running on stdio");
  }
}

// Run the server
if (require.main === module) {
  const server = new SchemeMCPServer();
  server.run().catch(console.error);
}

module.exports = SchemeMCPServer;
