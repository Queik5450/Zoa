from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints

app = FastAPI(title="Zoa API - GuayanaDex Backend", version="1.0.0")

origins = [
    "http://localhost:5173", # Vite puerto por defecto
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # POST, GET, PUT etc.
    allow_headers=["*"],
)

app.include_router(endpoints.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Zoa Backend Running - Scanning Guayana's Biodiversity."}