# Windows PowerShell deployment script for Netlify
# Run this from the project directory

Write-Host "🚀 Starting deployment..." -ForegroundColor Green

# Check current directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Yellow

# Navigate to project directory
Set-Location "D:\claudio\cyrillic-alphabet-game\cyril"
Write-Host "Changed to: $(Get-Location)" -ForegroundColor Yellow

# List files to confirm we're in the right place
Write-Host "`n📁 Files in directory:" -ForegroundColor Cyan
Get-ChildItem | Select-Object Name, Length | Format-Table -AutoSize

# Check if netlify CLI is installed
Write-Host "`n🔍 Checking Netlify CLI..." -ForegroundColor Cyan
try {
    $netlifyVersion = netlify --version 2>&1
    Write-Host "Netlify CLI found: $netlifyVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Netlify CLI not found. Please install with: npm install -g netlify-cli" -ForegroundColor Red
    exit 1
}

# Check if we're logged in to Netlify
Write-Host "`n🔑 Checking Netlify authentication..." -ForegroundColor Cyan
try {
    $authStatus = netlify status 2>&1
    Write-Host "Auth status checked" -ForegroundColor Green
} catch {
    Write-Host "⚠️  May need to login to Netlify. Run: netlify login" -ForegroundColor Yellow
}

# Deploy to production
Write-Host "`n🚀 Deploying to production..." -ForegroundColor Green
try {
    netlify deploy --prod --dir=.
    Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your site is live at: https://magnificent-tulumba-2776d6.netlify.app" -ForegroundColor Cyan
    Write-Host "🔧 Admin panel available at: https://magnificent-tulumba-2776d6.netlify.app/admin.html" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Try manual deployment at: https://app.netlify.com/sites/magnificent-tulumba-2776d6/overview" -ForegroundColor Yellow
}

Write-Host "`n🎉 Script completed!" -ForegroundColor Green
