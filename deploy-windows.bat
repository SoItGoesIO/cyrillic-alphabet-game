@echo off
echo 🚀 Starting deployment...

cd /d "D:\claudio\cyrillic-alphabet-game\cyril"
echo Changed to: %CD%

echo.
echo 📁 Files in directory:
dir /b

echo.
echo 🔍 Checking Netlify CLI...
netlify --version
if errorlevel 1 (
    echo ❌ Netlify CLI not found. Install with: npm install -g netlify-cli
    pause
    exit /b 1
)

echo.
echo 🚀 Deploying to production...
netlify deploy --prod --dir=.

if errorlevel 1 (
    echo ❌ Deployment failed
    echo 💡 Try manual deployment at: https://app.netlify.com/sites/magnificent-tulumba-2776d6/overview
) else (
    echo.
    echo ✅ Deployment successful!
    echo 🌐 Your site: https://magnificent-tulumba-2776d6.netlify.app
    echo 🔧 Admin panel: https://magnificent-tulumba-2776d6.netlify.app/admin.html
)

echo.
echo 🎉 Script completed!
pause
