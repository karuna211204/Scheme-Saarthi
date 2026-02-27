# Quick Test Script for Scheme Saarthi Backend APIs
# PowerShell version

$BACKEND_URL = "http://localhost:5000"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🧪 Testing Scheme Saarthi Backend APIs" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host ""
Write-Host "1️⃣  Testing Health Check..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method Get | ConvertTo-Json -Depth 10

# Test 2: Get All Schemes
Write-Host ""
Write-Host "2️⃣  Testing Get All Schemes..." -ForegroundColor Yellow
$schemes = Invoke-RestMethod -Uri "$BACKEND_URL/api/schemes" -Method Get
Write-Host "Found $($schemes.Count) schemes"
$schemes | Select-Object -First 2 | ConvertTo-Json -Depth 10

# Test 3: Get Scheme by ID
Write-Host ""
Write-Host "3️⃣  Testing Get Scheme by ID (PM-KISAN)..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BACKEND_URL/api/schemes/PM-KISAN" -Method Get | ConvertTo-Json -Depth 10

# Test 4: Search Schemes
Write-Host ""
Write-Host "4️⃣  Testing Search Schemes (Farmer eligibility)..." -ForegroundColor Yellow
$searchBody = @{
    age = 45
    occupation = "farmer"
    income = 100000
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BACKEND_URL/api/schemes/search" -Method Post -Body $searchBody -ContentType "application/json" | ConvertTo-Json -Depth 10

# Test 5: Create Citizen
Write-Host ""
Write-Host "5️⃣  Testing Create Citizen..." -ForegroundColor Yellow
$citizenBody = @{
    phone = "+919876543210"
    name = "Ramesh Kumar"
    age = 45
    gender = "Male"
    occupation = "farmer"
    annual_income = 100000
    state = "Andhra Pradesh"
    district = "Guntur"
    language_preference = "Telugu"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$BACKEND_URL/api/citizens" -Method Post -Body $citizenBody -ContentType "application/json" | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Citizen may already exist (this is okay)" -ForegroundColor Gray
}

# Test 6: Get Citizen by Phone
Write-Host ""
Write-Host "6️⃣  Testing Get Citizen by Phone..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BACKEND_URL/api/citizens/phone/+919876543210" -Method Get | ConvertTo-Json -Depth 10

# Test 7: Check Eligibility
Write-Host ""
Write-Host "7️⃣  Testing Check Eligibility..." -ForegroundColor Yellow
$eligibilityBody = @{
    phone = "+919876543210"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BACKEND_URL/api/applications/check-eligibility" -Method Post -Body $eligibilityBody -ContentType "application/json" | ConvertTo-Json -Depth 10

# Test 8: Create Application
Write-Host ""
Write-Host "8️⃣  Testing Create Application..." -ForegroundColor Yellow
$applicationBody = @{
    phone = "+919876543210"
    scheme_id = "PM-KISAN"
    documents_submitted = @("aadhaar", "land_records")
    status = "draft"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BACKEND_URL/api/applications" -Method Post -Body $applicationBody -ContentType "application/json" | ConvertTo-Json -Depth 10

# Test 9: Get Applications by Phone
Write-Host ""
Write-Host "9️⃣  Testing Get Applications by Phone..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BACKEND_URL/api/applications/phone/+919876543210" -Method Get | ConvertTo-Json -Depth 10

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ All tests completed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
