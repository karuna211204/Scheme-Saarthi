# ============================================
# SCHEME SAARTHI - QUICK SETUP SCRIPT (PowerShell)
# ============================================
# This script sets up the entire SchemeSaarthi application
# Run with: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SCHEME SAARTHI - QUICK SETUP" -ForegroundColor Cyan
Write-Host "  AI-Powered Universal Citizen Gateway" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Python
$pythonVersion = python --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Python not found. Please install Python 3.9+ from https://python.org/" -ForegroundColor Red
    exit 1
}

# Check MongoDB connection
Write-Host ""
Write-Host "📦 Checking MongoDB connection..." -ForegroundColor Yellow
$mongoUri = $env:MONGODB_URI
if (-not $mongoUri) {
    Write-Host "⚠️  MONGODB_URI not set in .env file" -ForegroundColor Yellow
    Write-Host "   Please update .env with your MongoDB connection string" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  STEP 1: Backend Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

cd code\Amazon_AI_Challenge\mern\backend

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "📊 Seeding database with dummy data..." -ForegroundColor Yellow

Write-Host "  → Seeding government schemes..." -ForegroundColor Cyan
node seedGovernmentSchemes.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Scheme seeding had issues (this is okay if MongoDB is not yet connected)" -ForegroundColor Yellow
}

Write-Host "  → Seeding government documents..." -ForegroundColor Cyan
node seedGovernmentDocuments.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Document seeding had issues (this is okay if MongoDB is not yet connected)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  STEP 2: AI Agent Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

cd ..\..\ai-agent

Write-Host "📦 Installing AI agent dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AI agent dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ AI agent dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  STEP 3: RAG Server Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

cd ..\rag-server

Write-Host "📦 Installing RAG server dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ RAG server dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ RAG server dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Update .env files with your credentials:" -ForegroundColor White
Write-Host "   - GOOGLE_API_KEY (for Gemini AI)" -ForegroundColor Gray
Write-Host "   - MONGODB_URI (for database)" -ForegroundColor Gray
Write-Host "   - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN (for SMS)" -ForegroundColor Gray
Write-Host "   - LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET (for voice)" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Start the services:" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 - Backend:" -ForegroundColor Cyan
Write-Host "   cd code\Amazon_AI_Challenge\mern\backend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""

Write-Host "   Terminal 2 - RAG Server:" -ForegroundColor Cyan
Write-Host "   cd code\Amazon_AI_Challenge\rag-server" -ForegroundColor Gray
Write-Host "   python mcp_rag_server.py" -ForegroundColor Gray
Write-Host ""

Write-Host "   Terminal 3 - MCP Server:" -ForegroundColor Cyan
Write-Host "   cd code\Amazon_AI_Challenge\ai-agent" -ForegroundColor Gray
Write-Host "   python mcp_server1.py" -ForegroundColor Gray
Write-Host ""

Write-Host "   Terminal 4 - AI Agent:" -ForegroundColor Cyan
Write-Host "   cd code\Amazon_AI_Challenge\ai-agent" -ForegroundColor Gray
Write-Host "   python main.py" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Test the system:" -ForegroundColor White
Write-Host "   curl http://localhost:5000/health" -ForegroundColor Gray
Write-Host "   curl http://localhost:5000/api/schemes" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 For detailed documentation, see SETUP_GUIDE.md" -ForegroundColor Yellow
Write-Host ""

Write-Host "🇮🇳 Made with ❤️ for Bharat" -ForegroundColor Green
Write-Host ""
