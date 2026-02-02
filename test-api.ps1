# Test script for AI Orchestrator API
# Make sure the server is running (npm run dev) before running this script

$baseUrl = "http://localhost:4000"

Write-Host "=== Testing AI Orchestrator API ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✓ Health check passed" -ForegroundColor Green
    $health | ConvertTo-Json
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "---" 
Write-Host ""

# Test 2: Cache Stats
Write-Host "2. Testing Cache Stats..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/cache/stats" -Method Get
    Write-Host "✓ Cache stats retrieved" -ForegroundColor Green
    $stats | ConvertTo-Json
} catch {
    Write-Host "✗ Cache stats failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "---"
Write-Host ""

# Test 3: Research Endpoint (only if API keys are configured)
Write-Host "3. Testing Research Endpoint..." -ForegroundColor Yellow
Write-Host "Note: This requires valid API keys in .env.local" -ForegroundColor Gray

$body = @{
    topic = "quantum computing"
    depth = "basic"
} | ConvertTo-Json

try {
    Write-Host "Sending research request (this may take 10-20 seconds)..." -ForegroundColor Gray
    $research = Invoke-RestMethod -Uri "$baseUrl/research" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✓ Research completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Topic: $($research.data.topic)" -ForegroundColor Cyan
    Write-Host "Cached: $($research.data.cached)" -ForegroundColor Cyan
    Write-Host "Timestamp: $($research.data.timestamp)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Combined Insights Preview (first 500 chars):" -ForegroundColor Cyan
    Write-Host $research.data.combinedInsights.Substring(0, [Math]::Min(500, $research.data.combinedInsights.Length))
    Write-Host "..."
} catch {
    Write-Host "✗ Research failed: $_" -ForegroundColor Red
    Write-Host "Make sure you have set your API keys in .env.local" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Tests Complete ===" -ForegroundColor Cyan
