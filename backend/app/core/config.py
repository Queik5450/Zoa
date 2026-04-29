import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your-supabase-url.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "your-supabase-service-key")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "your-google-gemini-key")

settings = Settings()