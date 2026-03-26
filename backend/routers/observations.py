from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import date as dt
from models import Observation, ObservationCreate, CommentCreate
from store import observations, comments_db, get_next_id

router = APIRouter(prefix="/observations", tags=["observations"])

@router.get("", response_model=List[dict])
def list_observations(verified: Optional[bool] = None, species: Optional[str] = None):
    result = observations
    if verified is not None:
        result = [o for o in result if o["verified"] == verified]
    if species:
        result = [o for o in result if species.lower() in o["species"].lower() or species.lower() in o["commonName"].lower()]
    return result

@router.post("", response_model=dict, status_code=201)
def create_observation(obs: ObservationCreate):
    new_id = get_next_id()
    new_obs = {
        "id": new_id,
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
    comments_db[new_id] = []
    return new_obs

@router.get("/{obs_id}", response_model=dict)
def get_observation(obs_id: int):
    obs = next((o for o in observations if o["id"] == obs_id), None)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")
    return obs

@router.post("/{obs_id}/like", response_model=dict)
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

@router.post("/{obs_id}/comment", response_model=dict)
def add_comment(obs_id: int, comment: CommentCreate):
    obs = next((o for o in observations if o["id"] == obs_id), None)
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")
    new_comment = {"id": len(comments_db.get(obs_id, [])) + 1, "user": comment.user, "text": comment.text, "date": str(dt.today())}
    comments_db.setdefault(obs_id, []).append(new_comment)
    obs["comments"] += 1
    return new_comment

@router.get("/{obs_id}/comments", response_model=List[dict])
def get_comments(obs_id: int):
    return comments_db.get(obs_id, [])
