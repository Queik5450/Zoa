import uuid
import json
import io

from typing import Dict
from PIL import Image
from google import genai
from google.genai import types
from app.core.config import settings

# Configurar la API Key de Gemini
client = None
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "google-gemini-key":
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

def analyze_image_with_ai(image_bytes: bytes) -> Dict:

    unique_id = str(uuid.uuid4())

    try:
        img = Image.open(io.BytesIO(image_bytes))
        
        prompt = """
        Eres un biólogo experto especializado en la flora y fauna de la Guayana Venezolana y el Neotrópico.
        Analiza esta imagen y dime qué especie es.
        
        Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura, sin texto extra, sin markdown (sin `json):
        {
            "common_name": "Nombre común en español",
            "scientific_name": "Nombre científico",
            "confidence_score": un número decimal entre 0 y 1 representando tu nivel de certeza,
            "description": "Una descripción de 2 párrafos corta, clara e interesante, perfecta para ser leída en voz alta por un sistema de Texto-a-Voz. Debe incluir el nombre y curiosidades.",
            "category": "Escribe 'fauna' si es un animal, o 'flora' si es una planta"
        }
        """
        
        # Enviar petición a la IA con el nuevo SDK de Google Genai
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[img, prompt]
        )
        
        # Limpiar la respuesta y convertirla a un Diccionario en Python
        response_text = response.text.replace("`json", "").replace("`", "").strip()
        data = json.loads(response_text)
        
        # Añadimos el ID interno
        data["id"] = unique_id
        return data

    except Exception as e:
        print(f"Error al analizar con Gemini: {e}")
        return {
            "id": unique_id,
            "common_name": "Espécimen no identificado",
            "scientific_name": "Error de Conexión",
            "confidence_score": 0.0,
            "description": f"Hubo un error de conexión con la IA de Google: {str(e)}. Probablemente el internet falló o la API está cargando.",
            "category": "unknown"
        }