from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class CommentCreate(BaseModel):
    user: str
    text: str


class Comment(BaseModel):
    id: int
    user: str
    text: str
    date: str


class ObservationCreate(BaseModel):
    species: str
    commonName: str
    lat: float
    lng: float
    user: str
    notes: Optional[str] = None
    image: Optional[str] = None
    date: Optional[str] = None


class Observation(BaseModel):
    id: int
    species: str
    commonName: str
    lat: float
    lng: float
    user: str
    date: str
    image: Optional[str] = None
    notes: Optional[str] = None
    likes: int = 0
    comments: int = 0
    verified: bool = False
    likedBy: List[str] = []


class IdentifyRequest(BaseModel):
    image_url: Optional[str] = None


class DatasetPatch(BaseModel):
    status: str  # "approved" or "rejected"
