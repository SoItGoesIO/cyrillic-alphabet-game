# Push local schema to LIVE Supabase (safe)

Push database migrations from local to production environment.

## 1. Load LIVE Environment

```bash
set -a; source .env.private; set +a
```

## 2. Show Pending Migrations

```bash
ls -1 database/migrations/
```

## 3. Link to LIVE Project (if needed)

```bash
npx supabase link --project-ref "$SUPABASE_PROJECT_REF"
```

## 4. Push Schema Changes

```bash
npx supabase db push
```

## 5. Verify LIVE REST API

```bash
curl -i "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/profiles" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

**Notes:**

- Secrets are read from environment, never printed
- Stop immediately on SQL errors
- Show failing statement if push fails
