from fastapi import APIRouter, HTTPException
from models import DatasetPatch
from store import observations

router = APIRouter(prefix="/dataset", tags=["dataset"])

@router.get("")
def get_dataset():
    return [{"id": o["id"], "species": o["species"], "commonName": o["commonName"], "user": o["user"], "date": o["date"], "image": o["image"], "verified": o["verified"], "dataset_status": o.get("dataset_status")} for o in observations]

@router.patch("/{obs_id}")
def patch_dataset(obs_id: int, patch: DatasetPatch):
    if patch.status not in ("approved", "rejected", "pending"):
        raise HTTPException(status_code=400, detail="Invalid status")
    obs = next((o for o in observations if o["id"] == obs_id), None)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")
    obs["dataset_status"] = patch.status
    return obs