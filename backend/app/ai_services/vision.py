import uuid
import json
import io
from typing import Dict
from PIL import Image
import google.generativeai as genai
from app.core.config import settings

# Configurar la API Key de Gemini
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-google-gemini-key":
    genai.configure(api_key=settings.GEMINI_API_KEY)

def analyze_image_with_ai(image_bytes: bytes) -> Dict:
    """
    Este es el 'Cerebro' de Zoa impulsado por Google Gemini. 
    Recibe la imagen y utiliza un prompt especializado para devolver
    toda la información en formato JSON estructurado.
    """
    unique_id = str(uuid.uuid4())
    
    # Si aún no has configurado tu Llave, usa un mock para que no se caiga la app
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your-google-gemini-key":
        return {
            "id": unique_id,
            "common_name": "Rana dardo venenosa (Modo Prueba)",
            "scientific_name": "Dendrobates leucomelas",
            "confidence_score": 0.94,
            "description": "Por favor, configura tu GEMINI_API_KEY real en el archivo .env. Esta es una rana prueba. Pequeña y negra con bandas amarillas.",
            "category": "fauna"
        }

    try:
        # Convertir bytes a un formato legible por Gemini (PIL Image)
        img = Image.open(io.BytesIO(image_bytes))
        
        # Usamos Gemini 1.5 Flash: Es el más rápido y gratis para imágenes
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # El Prompt maestro que le dice a la IA cómo comportarse
        prompt = """
        Eres un biólogo experto especializado en la flora y fauna de la Guayana Venezolana y el Neotrópico.
        Analiza esta imagen y dime qué especie es.
        
        Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura, sin texto extra, sin markdown (sin ```json):
        {
            "common_name": "Nombre común en español",
            "scientific_name": "Nombre científico",
            "confidence_score": un número decimal entre 0 y 1 representando tu nivel de certeza,
            "description": "Una descripción de 2 párrafos corta, clara e interesante, perfecta para ser leída en voz alta por un sistema de Texto-a-Voz. Debe incluir el nombre y curiosidades.",
            "category": "Escribe 'fauna' si es un animal, o 'flora' si es una planta"
        }
        """
        
        # Enviar petición a la IA
        response = model.generate_content([prompt, img])
        
        # Limpiar la respuesta y convertirla a un Diccionario en Python
        response_text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(response_text)
        
        # Añadimos el ID interno
        data["id"] = unique_id
        return data

    except Exception as e:
        print(f"Error al analizar con Gemini: {e}")
        # Fallback de emergencia si la IA de Google falla
        return {
            "id": unique_id,
            "common_name": "Especie no identificada",
            "scientific_name": "Unknown",
            "confidence_score": 0.0,
            "description": f"Ocurrió un error en el escáner: {str(e)}",
            "category": "unknown"
        }
