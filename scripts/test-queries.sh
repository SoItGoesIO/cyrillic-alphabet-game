#!/usr/bin/env bash
set -Eeuo pipefail

DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

echo "🧪 Running sample test queries..."

echo ""
echo "📊 1. Check XP level computation:"
PGPASSWORD=postgres psql "$DB_URL" -c "
SELECT
  xp,
  compute_level(xp) as level
FROM (VALUES (0), (50), (100), (250), (500), (900), (1400), (2000)) AS t(xp)
ORDER BY xp;"

echo ""
echo "📋 2. Check existing tables and data:"
PGPASSWORD=postgres psql "$DB_URL" -c "
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename;"

echo ""
echo "🔍 3. Sample query templates (modify as needed):"
cat << 'EOF'

-- Create a test user profile:
INSERT INTO profiles (user_id, total_xp, level)
VALUES ('00000000-0000-0000-0000-000000000001', 0, 1)
ON CONFLICT (user_id) DO NOTHING;

-- Create test Cyrillic alphabet items:
INSERT INTO items (id, user_id, letter, status, xp_reward) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'А', 'created', 10),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Б', 'created', 10),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'В', 'in_progress', 10);

-- Complete an item and see XP/level update:
SELECT * FROM complete_item('11111111-1111-1111-1111-111111111111');

-- Check user progress:
SELECT
  p.total_xp,
  p.level,
  count(i.*) as total_letters,
  count(CASE WHEN i.status = 'completed' THEN 1 END) as completed_letters
FROM profiles p
LEFT JOIN items i ON i.user_id = p.user_id
WHERE p.user_id = '00000000-0000-0000-0000-000000000001'
GROUP BY p.user_id, p.total_xp, p.level;

EOF

echo ""
echo "✅ Test queries ready! Use 'make db-shell' to run them interactively."