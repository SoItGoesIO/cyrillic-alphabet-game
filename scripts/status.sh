#!/usr/bin/env bash
set -Eeuo pipefail

echo "📊 Supabase Status:"
npx supabase status

echo ""
echo "🔗 Quick Links:"
echo "  Studio: http://localhost:54323"
echo "  API URL: http://localhost:54321"
echo ""
echo "🗄️  Database Connection:"
echo "  Host: 127.0.0.1"
echo "  Port: 54322"
echo "  User: postgres"
echo "  Database: postgres"