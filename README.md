# Zoa - Biodiversidad de la Guayana Venezolana 🌿🐆

Zoa es una plataforma de **Ciencia Ciudadana** georreferenciada para el registro, identificación mediante Inteligencia Artificial y la curaduría de la biodiversidad (flora y fauna) en la región de la Guayana Venezolana.

## 🚀 Arquitectura
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Python + FastAPI
- **Base de Datos & Storage:** Supabase (PostgreSQL + PostGIS)
- **IA de Identificación:** Google Gemini 1.5 Flash (Vision)

---

## 🛠️ Instalación y Configuración para el Equipo de Desarrollo

### Requisitos Previos
- [Node.js](https://nodejs.org/) instalando su última versión LTS (Para el Frontend)
- [Python 3.12](https://www.python.org/downloads/) configurado en el PATH (Para el Backend)
- Cuenta en [Supabase](https://supabase.com/) y [Google AI Studio](https://aistudio.google.com/)

---

### Paso 1: Configuración del Backend (IA y API)
Abre tu primera terminal y navega hasta la carpeta del backend:

```bash
cd backend
```

Crea tu entorno virtual asegurándote de usar Python 3.12:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

Instala las dependencias del proyecto:
```bash
pip install -r requirements.txt
```

**Variables de entorno:**
Haz una copia de `.env.example`, llámalo `.env` y pega allí tus credenciales reales (URL de Supabase, Key y tu API de Google Gemini).

Arranca el servidor local:
```bash
uvicorn app.main:app --reload --port 8000
```
> La documentación del API y la IA estará disponible en: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Paso 2: Configuración del Frontend (UI y Escáner)
Abre **otra** pestaña en tu terminal y navega a la carpeta frontend:

```bash
cd frontend
```

Instala las dependencias de React:
```bash
npm install
```

Arranca el servidor de desarrollo:
```bash
npm run dev
```
> La aplicación web Zoa estará visible en [http://localhost:5173](http://localhost:5173). Podrás ver tus cambios de código al instante.

---

### 📝 Notas adicionales y Reglas del Repo
- **¡No subas tus contraseñas (*.env* o *.env.local*) a GitHub!** Ya han sido omitidas en el archivo `.gitignore` global que configuramos.
- Si instalas una nueva librería en el frontend, usa `npm install <paquete>` dentro de `./frontend`.
- Si instalas una nueva librería de Python en el backend, hazlo con el entorno virtual activo que está en `./backend` y luego ejecuta `pip freeze > requirements.txt` para actualizar la lista.
