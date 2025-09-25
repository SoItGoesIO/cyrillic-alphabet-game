#!/bin/bash
# Comprehensive Git Upload Script

cd /d/claudio/cyrillic-alphabet-game/cyril

echo "🔄 Current Git Status:"
git status --short

echo ""
echo "📁 Adding all new and modified files..."
git add .

echo ""
echo "📝 Committing changes..."
git commit -m "🚀 Complete gamified Cyrillic learning system with Supabase

- ✅ Enhanced HTML with Supabase authentication (email/password + magic link)
- ✅ Database schema with profiles, items, quiz sessions
- ✅ Working authentication and test functionality  
- ✅ Ready for full gamification features
- 🎮 Original Cyrillic alphabet game preserved
- 📊 Database schemas (minimal and full versions)
- 📚 Comprehensive documentation (README, SETUP, DEPLOY guides)
- 🎯 Netlify deployment configuration
- 🔧 Supabase client configuration"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Upload complete!"
echo "🌐 GitHub: https://github.com/SoItGoesIO/cyrillic-alphabet-game"
echo "🚀 Live app: https://magnificent-tulumba-2776d6.netlify.app"
