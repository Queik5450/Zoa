from app.core.db import supabase

print('TEST_START')
# Test 1: simple publications select
try:
    r = supabase.table('publications').select('id').limit(1).execute()
    print('publications_ok', bool(getattr(r, 'data', None)), getattr(r, 'data', None))
except Exception as e:
    print('publications_err', repr(e))

# Test 2: check materialized view presence
try:
    r2 = supabase.table('map_publications_mat').select('id').limit(1).execute()
    print('map_mat_ok', bool(getattr(r2, 'data', None)), getattr(r2, 'data', None))
except Exception as e:
    print('map_mat_err', repr(e))

# Test 3: check user_stats_mat presence
try:
    r3 = supabase.table('user_stats_mat').select('user_id').limit(1).execute()
    print('user_stats_mat_ok', bool(getattr(r3, 'data', None)), getattr(r3, 'data', None))
except Exception as e:
    print('user_stats_mat_err', repr(e))

print('TEST_END')
