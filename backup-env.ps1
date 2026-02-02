# Backup .env.local to clipboard (for transferring to Cursor Web)
# Run this script: .\backup-env.ps1

$envPath = ".env.local"

if (-not (Test-Path $envPath)) {
    Write-Host "Error: .env.local not found" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envPath -Raw

Write-Host "✓ .env.local copied to clipboard!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open Cursor Web"
Write-Host "2. Clone your ai-orchestrator repository"
Write-Host "3. Create a new file: .env.local"
Write-Host "4. Paste (Ctrl+V) the clipboard contents"
Write-Host "5. Save the file"
Write-Host "6. Run: npm install"
Write-Host "7. Run: npm run dev"
Write-Host ""

# Copy to clipboard
$envContent | Set-Clipboard

Write-Host "Your API keys are now in the clipboard." -ForegroundColor Cyan
Write-Host "⚠️  WARNING: Don't paste this anywhere public!" -ForegroundColor Red
