const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { Server } = require("socket.io");

// Load environment variables
dotenv.config();

// Import routes and services
const voiceRoutes = require("./routes/voice");
const documentRoutes = require("./routes/documents");
const schemeRoutes = require("./routes/schemes");
const { initializeAWS } = require("./services/aws-config");
const sipService = require("./services/sip-service");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));

// Initialize AWS services
initializeAWS();

// Initialize SIP service for human escalation
sipService.initializeSIP();

// Routes
app.use("/api/voice", voiceRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/schemes", schemeRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Scheme Saarthi API",
    timestamp: new Date().toISOString(),
  });
});

// Socket.io for real-time voice communication
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("voice-input", async (data) => {
    try {
      // Handle real-time voice processing
      const { audioData, language = "hi-IN" } = data;
      // Process through voice service
      socket.emit("voice-response", { message: "Processing your request..." });
    } catch (error) {
      console.error("Voice processing error:", error);
      socket.emit("error", { message: "Voice processing failed" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Scheme Saarthi server running on port ${PORT}`);
  console.log(`📱 Voice interface ready for multilingual support`);
  console.log(`🔍 MCP integration active for scheme discovery`);
});
