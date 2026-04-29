from supabase import create_client, Client
from app.core.config import settings

# This uses the Service Role Key for backend admin operations,
# enabling the backend to bypass RLS locally or inject data properly as a server.
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)