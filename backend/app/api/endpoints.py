from fastapi import APIRouter, File, UploadFile, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.db import supabase
from app.ai_services.vision import analyze_image_with_ai

# Router para todos los endpoints de IA // GuayanaDex
router = APIRouter()

class ScanResult(BaseModel):
    id: str
    common_name: str
    scientific_name: str
    confidence_score: float
    description: str
    category: str

@router.post("/scan", response_model=ScanResult)
async def analyze_species(file: UploadFile = File(...)):
    """
    Recibe la imagen del frontend.
    Envía la imagen a un modelo de IA local o externo, y luego almacena en 
    la base de datos y Storage de Supabase.
    """
    
    # 1. Leer el archivo visual convertido en bytes
    img_bytes = await file.read()
    
    # 2. Llamada a tu archivo de IA en `app/ai_services/vision.py`
    ai_result = analyze_image_with_ai(img_bytes)
    
    # 3. Subir foto a Supabase Storage (Buckets)
    path = f"scans/{ai_result['id']}.jpg"
    res = supabase.storage.from_("zoa_media").upload(path, img_bytes)
    public_url = supabase.storage.from_("zoa_media").get_public_url(path)

    # 4. Registrar el evento en la BD de Supabase (SQL)
    # Puedes crear una tabla llamada "guayanadex_records" en tu panel web de Supabase
    try:
        # Esto fallará si aún no has puesto tu URL y Key en un archivo .env
        # pero el código ya está listo para cuando tengas tu base de datos lista.
        record_data = {
            "id": ai_result["id"],
            "user_id": "usuario_anonimo", # Cambiar cuando tengas un sistema de login
            "common_name": ai_result["common_name"],
            "scientific_name": ai_result["scientific_name"],
            # "image_url": public_url,
            "confidence": ai_result["confidence_score"],
            "description": ai_result["description"]
        }
        # Descomenta esto cuando tu tabla "guayanadex_records" esté creada 
        # y tus contraseñas configuradas:
        # supabase.table("guayanadex_records").insert(record_data).execute()
        pass
    except Exception as e:
        print(f"La base de datos aún no está configurada o dio error: {e}")

    return ai_result

@router.get("/guayanadex/{user_id}")
async def get_user_records(user_id: str):
    """
    Devuelve los animales/plantas registrados por este usuario.
    """
    # Query lista para cuando configures tu Database 
    try:
        # response = supabase.table("guayanadex_records").select("*").eq("user_id", user_id).execute()
        # return response.data
        pass
    except Exception as e:
        print(f"Supabase Client no configurado: {e}")
        
    # Datos de ejemplo de Guayana mientras pruebas el UI
    return [
         {"id": "reg_001", "common_name": "Cardenalito", "scientific_name": "Spinus cucullatus", "photo_url": "url_to_img.jpg", "category": "fauna"},
         {"id": "reg_002", "common_name": "Oso Palmero", "scientific_name": "Myrmecophaga tridactyla", "photo_url": "url_to_img2.jpg", "category": "fauna"}
    ]
