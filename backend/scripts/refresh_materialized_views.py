#!/usr/bin/env python3
"""Refresh materialized views helper.

Usage:
  REFRESH_ADMIN_KEY or SUPABASE_KEY must be set in env (used by the supabase client).
  python scripts/refresh_materialized_views.py

This script uses the existing `app.core.db.supabase` client, so ensure
`backend/app/core/config.py` is configured to read the correct env vars.
"""
import time
import sys
from app.core.db import supabase


def main():
    t0 = time.time()
    try:
        resp = supabase.rpc("refresh_materialized_views").execute()
        print("Refresh response:", getattr(resp, 'data', resp))
    except Exception as exc:
        print("Failed to refresh materialized views:", exc)
        sys.exit(2)
    duration_ms = int((time.time() - t0) * 1000)
    print(f"Refreshed materialized views in {duration_ms} ms")


if __name__ == "__main__":
    main()
