const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const livekitRoutes=require('./routes/LivekitRoutes')
const consultationRoutes=require('./routes/ConsultationRoutes')
const citizenRoutesOld=require('./routes/CitizenRoutes_old')
const applicationRoutesOld=require('./routes/ApplicationRoutes_old')
const schemeInquiryRoutesOld=require('./routes/SchemeInquiryRoutes_old')
const transcriptRoutes=require('./routes/TranscriptRoutes')
const authRoutes=require('./routes/AuthRoutes');
const exportRoutes=require('./routes/ExportRoutes');
const phoneUpdateController=require('./controllers/PhoneUpdateController');

// Scheme Saarthi Routes
const applicationRoutes=require('./routes/ApplicationRoutes');
const citizenRoutes=require('./routes/CitizenRoutes');
const schemeRoutes=require('./routes/SchemeRoutes');
const schemeInquiryRoutes=require('./routes/SchemeInquiryRoutes');
const mongoose = require('mongoose');
dotenv.config();

const app = express();

// Trust proxy for deployment behind load balancers
app.set('trust proxy', 1);

// Increased timeouts for long-running connections
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
});

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/livekit',livekitRoutes)
app.use('/api/consultations',consultationRoutes)
app.use('/api/customers',citizenRoutesOld)
app.use('/api/warranties',applicationRoutesOld)
app.use('/api/salesleads',schemeInquiryRoutesOld)
app.use('/api/transcripts',transcriptRoutes)
app.use('/api/auth', authRoutes);
app.use('/api/export', exportRoutes);
app.post('/api/auth/update-phone', phoneUpdateController.updatePhoneByUserId);

// Scheme Saarthi Endpoints
app.use('/api/applications', applicationRoutes);
app.use('/api/citizens', citizenRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/scheme-inquiries', schemeInquiryRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: 'schemesaarthi-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Ping endpoint to keep server alive
app.get('/ping', (req, res) => {
  res.send('pong');
});

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schemesaarthi';
  
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Connection pool settings to prevent timeouts
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      // Keep connections alive
      keepAlive: true,
      keepAliveInitialDelay: 300000, // 5 minutes
    });
    console.log('✅ MongoDB connected successfully');
    
    // Monitor connection events
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    // Don't exit immediately, retry after delay
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
});

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  console.error(err.stack);
  // Don't exit - log and continue
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - log and continue
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Process ID: ${process.pid}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  connectDB();
});

// Set server timeouts
server.keepAliveTimeout = 65000; // Slightly higher than ALB idle timeout (60s)
server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout

console.log('⏰ Server configured with:');
console.log('   - Keep-Alive Timeout: 65s');
console.log('   - Headers Timeout: 66s');
console.log('   - Request/Response Timeout: 5 minutes');