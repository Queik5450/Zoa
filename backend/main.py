from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import observations, dataset, species

app = FastAPI(title="BioGuayana API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(observations.router)
app.include_router(dataset.router)
app.include_router(species.router)

@app.get("/")
def root():
    return {"message": "BioGuayana API", "version": "1.0.0"}
