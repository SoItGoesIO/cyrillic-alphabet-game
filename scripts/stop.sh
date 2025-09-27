#!/usr/bin/env bash
set -Eeuo pipefail

echo "🛑 Stopping Supabase..."
npx supabase stop
echo "✅ Supabase stopped"