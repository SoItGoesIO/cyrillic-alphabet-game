#!/usr/bin/env bash
set -Eeuo pipefail

echo "🛑 Stopping Supabase..."
npx supabase stop

echo "🗑️  Resetting database..."
npx supabase db reset

echo "🚀 Starting Supabase..."
npx supabase start

echo "📊 Creating environment file..."
npx supabase status -o env | tee .env.local

echo "✅ Reset complete!"