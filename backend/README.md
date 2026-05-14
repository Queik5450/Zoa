# Backend notes — materialized views & refresh

This file documents the schema changes and how to refresh the new materialized views.

## Migrations

- Apply `backend/supabase/schema.sql` using Supabase SQL editor or `psql`.

Example (psql):

```bash
# connect to your Postgres/Supabase DB and run:
psql "$SUPABASE_DB_URL" -f backend/supabase/schema.sql
```

## Initial refresh

After deploying the schema, populate the materialized views:

```bash
# Option A: use the helper script (server env must include SUPABASE_KEY)
python backend/scripts/refresh_materialized_views.py

# Option B: call the admin endpoint (ensure REFRESH_ADMIN_KEY is set on server)
curl -X POST "https://your-backend.example.com/api/admin/refresh-materialized-views?x_refresh_admin_key=$REFRESH_ADMIN_KEY"
```

Notes:
- `REFRESH MATERIALIZED VIEW CONCURRENTLY` requires unique indexes on the materialized views (created in the schema).
- If `CONCURRENTLY` fails (rare), refresh without it during maintenance windows.

## Scheduled refresh (example)

You can schedule periodic refreshes with a cron job, GitHub Actions, or cloud scheduler. See `.github/workflows/refresh-materialized-views.yml` for an example GitHub Actions job that calls the admin endpoint.

## Secrets

- `REFRESH_ADMIN_KEY` — used by the admin endpoint. Set this in your environment or CI secrets.
- `SUPABASE_KEY` — the service role key used by the backend; keep it secret.
