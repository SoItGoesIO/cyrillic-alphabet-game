# Database migration analysis (read-only)

Analyze pending database changes without applying them.

## 1. List Migration Files

```bash
ls -1 database/migrations/
```

## 2. Show Recent Migration Content

```bash
ls -t database/migrations/*.sql | head -3 | xargs -I {} sh -c 'echo "=== {} ==="; head -20 "{}"'
```

## 3. Analysis

Explain in prose:

- What schema changes are pending
- Potential RLS policy impacts
- Backward compatibility considerations
- Risk assessment for production deployment

## Important

This is analysis-only. Do NOT run `db push`, `db pull`, or apply migrations.
