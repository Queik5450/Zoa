# Zoa - Biodiversidad de la Guayana Venezolana

Zoa es una plataforma de Ciencia Ciudadana georreferenciada para el registro, identificación mediante Inteligencia Artificial y la curaduría de la biodiversidad (flora y fauna) en la región de la Guayana Venezolana.

## 🚀 Arquitectura
- Frontend: React + Vite + TailwindCSS
- Backend: Python 3.12 + FastAPI
- Base de Datos & Storage: Supabase (PostgreSQL + PostGIS)
- IA de Identificación: Google Gemini 2.5 Flash (Vision)

### 📝 Notas adicionales y Reglas del Repo
- Si instalas una nueva librería en el frontend, usa `npm install <paquete>` dentro de `./frontend`.
- Si instalas una nueva librería de Python en el backend, hazlo con el entorno virtual activo que está en `./backend` y luego ejecuta `pip freeze > requirements.txt` para actualizar la lista.

### 🗄️ Base de Datos Supabase
- El esquema inicial vive en [backend/supabase/schema.sql](backend/supabase/schema.sql).
- Ábrelo en Supabase SQL editor y ejecútalo antes de probar auth, publicaciones y mapa.
- El schema crea `profiles`, `species`, `locations`, `publications`, `publication_media`, vistas de stats y mapa, índices y RLS base.
- `profiles` se sincroniza automáticamente cuando entra un usuario nuevo en `auth.users`.
