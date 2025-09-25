# Quick Deploy Script - Run this in PowerShell
Write-Host "🚀 Quick Deploy Script" -ForegroundColor Green

# Change to project directory
Set-Location "D:\claudio\cyrillic-alphabet-game\cyril"
Write-Host "📍 Current location: $(Get-Location)" -ForegroundColor Yellow

# Show files
Write-Host "`n📁 Files to deploy:" -ForegroundColor Cyan
Get-ChildItem -Name | Where-Object { $_ -like "*.html" -or $_ -like "*.js" -or $_ -like "*.css" } | Sort-Object

# Check Netlify
Write-Host "`n🔍 Netlify CLI Status:" -ForegroundColor Cyan
& netlify --version

Write-Host "`n🚀 Starting deployment..." -ForegroundColor Green
Write-Host "If this hangs, press Ctrl+C and deploy manually at:" -ForegroundColor Yellow
Write-Host "https://app.netlify.com/sites/magnificent-tulumba-2776d6/overview" -ForegroundColor Cyan

# Deploy
& netlify deploy --prod --dir=.
