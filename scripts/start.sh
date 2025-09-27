#!/usr/bin/env bash
set -Eeuo pipefail

echo "🚀 Starting Supabase..."
npx supabase start

echo "📊 Creating environment file..."
npx supabase status -o env | tee .env.local

echo "✅ Supabase is ready!"
echo "📍 Studio: http://localhost:54323"
echo "🗄️  Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres"