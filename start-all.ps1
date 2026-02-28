# ============================================
# SCHEME SAARTHI - START ALL SERVICES
# ============================================
# This script starts all SchemeSaarthi services
# Run with: powershell -ExecutionPolicy Bypass -File start-all.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SCHEME SAARTHI - STARTING ALL SERVICES" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Please run setup.ps1 first" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Starting all services..." -ForegroundColor Yellow
Write-Host ""

# Start Backend
Write-Host "📊 Starting Backend API (Port 5000)..." -ForegroundColor Cyan
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\code\Amazon_AI_Challenge\mern\backend'; Write-Host '🔥 Backend API Starting...' -ForegroundColor Green; npm start" -PassThru
Start-Sleep -Seconds 3

# Start RAG Server
Write-Host "🔍 Starting RAG Server (Port 8002)..." -ForegroundColor Cyan
$ragServer = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\code\Amazon_AI_Challenge\rag-server'; Write-Host '🔥 RAG Server Starting...' -ForegroundColor Green; python mcp_rag_server.py" -PassThru
Start-Sleep -Seconds 3

# Start MCP Server
Write-Host "⚙️  Starting MCP Server (Port 8001)..." -ForegroundColor Cyan
$mcpServer = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\code\Amazon_AI_Challenge\ai-agent'; Write-Host '🔥 MCP Server Starting...' -ForegroundColor Green; python mcp_server1.py" -PassThru
Start-Sleep -Seconds 3

# Start AI Agent
Write-Host "🤖 Starting AI Agent..." -ForegroundColor Cyan
$aiAgent = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\code\Amazon_AI_Challenge\ai-agent'; Write-Host '🔥 AI Agent Starting...' -ForegroundColor Green; python main.py" -PassThru

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  ALL SERVICES STARTED!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Backend API:    http://localhost:5000" -ForegroundColor Green
Write-Host "✅ RAG Server:     http://localhost:8002" -ForegroundColor Green
Write-Host "✅ MCP Server:     http://localhost:8001" -ForegroundColor Green
Write-Host "✅ AI Agent:       LiveKit Room Connected" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Quick Tests:" -ForegroundColor Yellow
Write-Host "   curl http://localhost:5000/health" -ForegroundColor Gray
Write-Host "   curl http://localhost:5000/api/schemes" -ForegroundColor Gray
Write-Host ""

Write-Host "🛑 To stop all services, close all PowerShell windows or press Ctrl+C in each" -ForegroundColor Yellow
Write-Host ""

Write-Host "Press any key to continue monitoring..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
