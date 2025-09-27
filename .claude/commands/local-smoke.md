# Local development smoke test

Validate that local Supabase stack is running and accessible.

## 1. Check Supabase Status

```bash
npx supabase status
```

## 2. Verify Database Connection

```bash
PGPASSWORD=postgres psql "host=127.0.0.1 port=54322 user=postgres dbname=postgres" -c "\dt public.*"
```

## 3. Test REST API

```bash
curl -s "http://127.0.0.1:54321/rest/v1/profiles" \
  -H "apikey: $(npx supabase status -o env | grep ANON_KEY | cut -d'=' -f2 | tr -d '"')" \
  -H "Authorization: Bearer $(npx supabase status -o env | grep ANON_KEY | cut -d'=' -f2 | tr -d '"')"
```

## 4. Check Studio Access

```bash
echo "Studio available at: http://localhost:54323"
```

If any step fails, run `make status` for detailed diagnostics.
