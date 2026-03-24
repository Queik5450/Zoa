from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import date as dt
from models import Observation, ObservationCreate, Comment, CommentCreate, IdentifyRequest, DatasetPatch
import random

app = FastAPI(title="BioGuayana API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
observations: List[dict] = [
    {"id": 1, "species": "Ara macao", "commonName": "Guacamayo Escarlata", "lat": 6.3, "lng": -61.5, "user": "carlos_bio", "date": "2024-03-15", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Beautiful_red_macaw.jpg/640px-Beautiful_red_macaw.jpg", "likes": 24, "comments": 5, "verified": True, "likedBy": [], "notes": "Observado en Canaima.", "dataset_status": None},
    {"id": 2, "species": "Pteronura brasiliensis", "commonName": "Nutria Gigante", "lat": 7.2, "lng": -63.1, "user": "maria_eco", "date": "2024-03-20", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Pteronura_brasiliensis_-_giant_otter.jpg/640px-Pteronura_brasiliensis_-_giant_otter.jpg", "likes": 31, "comments": 8, "verified": True, "likedBy": [], "notes": "Familia de 5 individuos.", "dataset_status": None},
    {"id": 3, "species": "Morpho helenor", "commonName": "Mariposa Morpho", "lat": 5.8, "lng": -62.3, "user": "ana_nat", "date": "2024-04-01", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Beautiful_blue_morpho_butterfly.jpg/640px-Beautiful_blue_morpho_butterfly.jpg", "likes": 15, "comments": 2, "verified": False, "likedBy": [], "notes": "Especie azul iridiscente.", "dataset_status": None},
    {"id": 4, "species": "Tapirus terrestris", "commonName": "Tapir Amazónico", "lat": 6.8, "lng": -63.5, "user": "pedro_campo", "date": "2024-04-05", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Tapirus_terrestris_001.JPG/640px-Tapirus_terrestris_001.JPG", "likes": 42, "comments": 12, "verified": True, "likedBy": [], "notes": "Huellas frescas.", "dataset_status": None},
    {"id": 5, "species": "Harpia harpyja", "commonName": "Águila Arpía", "lat": 7.5, "lng": -61.8, "user": "luis_bird", "date": "2024-04-10", "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Harpia_harpyja_001.jpg/640px-Harpia_harpyja_001.jpg", "likes": 58, "comments": 18, "verified": True, "likedBy": [], "notes": "Nido activo.", "dataset_status": None},
]

comments_db: dict = {1: [], 2: [], 3: [], 4: [], 5: []}
next_id = 6


@app.get("/")
def root():
    return {"message": "BioGuayana API", "version": "1.0.0"}


@app.get("/observations", response_model=List[dict])
def list_observations(verified: Optional[bool] = None, species: Optional[str] = None):
    result = observations
    if verified is not None:
        result = [o for o in result if o["verified"] == verified]
    if species:
        result = [o for o in result if species.lower() in o["species"].lower() or species.lower() in o["commonName"].lower()]
    return result


@app.post("/observations", response_model=dict, status_code=201)
def create_observation(obs: ObservationCreate):
    global next_id
    new_obs = {
        "id": next_id,
        "species": obs.species,
        "commonName": obs.commonName,
        "lat": obs.lat,
        "lng": obs.lng,
        "user": obs.user,
        "date": obs.date or str(dt.today()),
        "image": obs.image or "",
        "notes": obs.notes or "",
        "likes": 0,
        "comments": 0,
        "verified": False,
        "likedBy": [],
        "dataset_status": None,
    }
    observations.append(new_obs)
    comments_db[next_id] = []
    next_id += 1
    return new_obs


@app.get("/observations/{obs_id}", response_model=dict)
def get_observation(obs_id: int):
    obs = next((o for o in observations if o["id"] == obs_id), None)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")
    return obs


@app.post("/observations/{obs_id}/like", response_model=dict)
def like_observation(obs_id: int, user: str = "anonymous"):
    obs = next((o for o in observations if o["id"] == obs_id), None)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")
    if user in obs["likedBy"]:
        obs["likedBy"].remove(user)
        obs["likes"] -= 1
    else:
        obs["likedBy"].append(user)
        obs["likes"] += 1
    return obs


@app.post("/observations/{obs_id}/comment", response_model=dict)
def add_comment(obs_id: int, comment: CommentCreate):
    obs = next((o for o in observations if o["id"] == obs_id), None)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")
    new_comment = {"id": len(comments_db.get(obs_id, [])) + 1, "user": comment.user, "text": comment.text, "date": str(dt.today())}
    comments_db.setdefault(obs_id, []).append(new_comment)
    obs["comments"] += 1
    return new_comment


@app.get("/observations/{obs_id}/comments", response_model=List[dict])
def get_comments(obs_id: int):
    return comments_db.get(obs_id, [])


@app.get("/species")
def list_species():
    seen = {}
    for obs in observations:
        if obs["species"] not in seen:
            seen[obs["species"]] = {"species": obs["species"], "commonName": obs["commonName"], "count": 0, "verified": obs["verified"]}
        seen[obs["species"]]["count"] += 1
    return list(seen.values())


@app.post("/identify")
def identify_species(req: IdentifyRequest):
    mock_results = [
        {"species": "Ara macao", "commonName": "Guacamayo Escarlata", "confidence": random.randint(85, 98)},
        {"species": "Ara chloropterus", "commonName": "Guacamayo Verde", "confidence": random.randint(50, 70)},
        {"species": "Amazona amazonica", "commonName": "Loro Guaro", "confidence": random.randint(20, 45)},
    ]
    return {"suggestions": sorted(mock_results, key=lambda x: x["confidence"], reverse=True)}


@app.get("/dataset")
def get_dataset():
    return [{"id": o["id"], "species": o["species"], "commonName": o["commonName"], "user": o["user"], "date": o["date"], "image": o["image"], "verified": o["verified"], "dataset_status": o.get("dataset_status")} for o in observations]


@app.patch("/dataset/{obs_id}")
def patch_dataset(obs_id: int, patch: DatasetPatch):
    if patch.status not in ("approved", "rejected", "pending"):
        raise HTTPException(status_code=400, detail="Invalid status")
    obs = next((o for o in observations if o["id"] == obs_id), None)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")
    obs["dataset_status"] = patch.status
    return obs
