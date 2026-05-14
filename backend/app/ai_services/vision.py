import uuid
import json
import io
import mimetypes

from typing import Dict
from PIL import Image
from google import genai
from google.genai import types
from app.core.config import settings

# Configurar la API Key de Gemini
client = None
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "google-gemini-key":
    client = genai.Client(api_key=settings.GEMINI_API_KEY)


def _parse_json_response(response_text: str) -> Dict:
    cleaned = (response_text or "").replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)

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
        data = _parse_json_response(response.text)
        
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


def analyze_audio_with_ai(audio_bytes: bytes, file_name: str = "recording.webm") -> Dict:
    unique_id = str(uuid.uuid4())

    if client is None:
        return {
            "id": unique_id,
            "common_name": "Audio no identificado",
            "scientific_name": "Sin análisis",
            "confidence_score": 0.0,
            "description": "No hay API key de Gemini configurada para analizar audio.",
            "category": "unknown",
        }

    mime_type, _ = mimetypes.guess_type(file_name)
    if not mime_type:
        mime_type = "audio/webm"

    prompt = """
    Eres un bioacústico experto en aves y fauna del Neotrópico, especialmente de la Guayana Venezolana.
    Escucha este audio y analiza los sonidos.

    Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura, sin texto extra, sin markdown:
    {
      "common_name": "Nombre común probable de la especie en español",
      "scientific_name": "Nombre científico probable",
      "confidence_score": número decimal entre 0 y 1,
      "description": "Resumen corto en español del audio, qué se escucha y por qué se infiere la especie. Si no hay certeza, dilo claramente.",
      "category": "fauna"
    }

    Si no puedes identificar especie con confianza, usa:
    - common_name: "Sonido no identificado"
    - scientific_name: "No determinado"
    - confidence_score: <= 0.35
    - category: "unknown"
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
                prompt,
            ],
        )

        data = _parse_json_response(response.text)
        data["id"] = unique_id

        # Defensive defaults in case model omits any field.
        data.setdefault("common_name", "Sonido no identificado")
        data.setdefault("scientific_name", "No determinado")
        data.setdefault("confidence_score", 0.0)
        data.setdefault("description", "No se pudo obtener una descripción del audio.")
        data.setdefault("category", "unknown")

        return data
    except Exception as e:
        print(f"Error al analizar audio con Gemini: {e}")
        return {
            "id": unique_id,
            "common_name": "Audio no identificado",
            "scientific_name": "Error de análisis",
            "confidence_score": 0.0,
            "description": f"Hubo un error al analizar el audio: {str(e)}",
            "category": "unknown",
        }