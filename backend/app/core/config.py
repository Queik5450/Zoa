import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()  # Cargar variables desde el archivo .env

class Settings(BaseSettings):
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://supabase-url.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "supabase-service-key")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "google-gemini-key")

settings = Settings()