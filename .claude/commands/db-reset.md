# Reset local development database

Completely reset the local Supabase database and reload schema.

## 1. Confirm Reset Operation

Ask user for confirmation before proceeding - this will destroy all local data.

## 2. Reset Database

```bash
make reset
```

## 3. Verify Clean State

```bash
PGPASSWORD=postgres psql "host=127.0.0.1 port=54322 user=postgres dbname=postgres" -c "\dt"
```

## 4. Optional: Load Sample Data

```bash
make test-queries
```

**Warning:** This destroys all local development data. Use only for testing.
