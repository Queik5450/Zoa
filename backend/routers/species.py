from fastapi import APIRouter
from models import IdentifyRequest
from store import observations
import random

router = APIRouter(tags=["species"])

@router.get("/species")
def list_species():
    seen = {}
    for obs in observations:
        if obs["species"] not in seen:
            seen[obs["species"]] = {"species": obs["species"], "commonName": obs["commonName"], "count": 0, "verified": obs["verified"]}
        seen[obs["species"]]["count"] += 1
    return list(seen.values())

@router.post("/identify")
def identify_species(req: IdentifyRequest):
    mock_results = [
        {"species": "Ara macao", "commonName": "Guacamayo Escarlata", "confidence": random.randint(85, 98)},
        {"species": "Ara chloropterus", "commonName": "Guacamayo Verde", "confidence": random.randint(50, 70)},
        {"species": "Amazona amazonica", "commonName": "Loro Guaro", "confidence": random.randint(20, 45)},
    ]
    return {"suggestions": sorted(mock_results, key=lambda x: x["confidence"], reverse=True)}