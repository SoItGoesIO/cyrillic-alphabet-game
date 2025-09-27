# Test authentication flow

Verify that the authentication system is working properly.

## 1. Check Auth Configuration

```bash
curl -s "http://127.0.0.1:54321/auth/v1/settings" \
  -H "apikey: $(npx supabase status -o env | grep ANON_KEY | cut -d'=' -f2 | tr -d '"')"
```

## 2. Test Profile Creation Flow

```bash
PGPASSWORD=postgres psql "host=127.0.0.1 port=54322 user=postgres dbname=postgres" -c "
SELECT
  count(*) as total_profiles,
  count(*) FILTER (WHERE total_xp > 0) as active_profiles
FROM public.profiles;
"
```

## 3. Verify RLS Policies

```bash
PGPASSWORD=postgres psql "host=127.0.0.1 port=54322 user=postgres dbname=postgres" -c "
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
"
```

## 4. Test XP Functions

```bash
PGPASSWORD=postgres psql "host=127.0.0.1 port=54322 user=postgres dbname=postgres" -c "
SELECT compute_level(xp) as level, xp
FROM (VALUES (0), (100), (250), (500), (900), (1400)) AS t(xp);
"
```
