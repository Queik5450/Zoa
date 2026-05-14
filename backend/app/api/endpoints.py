from __future__ import annotations

import os
import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from pydantic import BaseModel

from app.ai_services.vision import analyze_image_with_ai
from app.core.db import supabase

router = APIRouter()

MEDIA_BUCKET = "zoa_media"
PUBLICATION_TABLE = "publications"
SPECIES_TABLE = "species"
LOCATION_TABLE = "locations"
PROFILE_TABLE = "profiles"
MAP_PUBLICATIONS_MAT = "map_publications_mat"
USER_STATS_MAT = "user_stats_mat"


class ScanResult(BaseModel):
    id: str
    common_name: str
    scientific_name: str
    confidence_score: float
    description: str
    category: str
    public_url: Optional[str] = None


class ProfileSyncRequest(BaseModel):
    user_id: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _to_float(value: Any) -> Optional[float]:
    if value is None or value == "":
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _format_coordinates(latitude: Any, longitude: Any) -> str:
    lat = _to_float(latitude)
    lon = _to_float(longitude)

    if lat is None or lon is None:
        return "Ubicación no disponible"

    return f"Latitud {lat:.6f}, Longitud {lon:.6f}"


def _safe_query(query):
    try:
        return query.execute()
    except Exception as exc:
        # Log and re-raise so callers (and FastAPI) can observe the error.
        print(f"Supabase query failed: {exc}")
        raise


def _shape_publication(row: Dict[str, Any]) -> Dict[str, Any]:
    display_name = row.get("display_name") or row.get("user_email") or "usuario"
    avatar_label = (display_name[:2] or "ZO").upper()
    latitude = _to_float(row.get("latitude"))
    longitude = _to_float(row.get("longitude"))

    return {

        "id": row.get("id"),
        "name": row.get("common_name") or row.get("species_name") or "Desconocido",
        "species": row.get("common_name") or row.get("species_name") or "Especie",
        "scientificName": row.get("scientific_name") or "",
        "authorName": f"@{display_name}",
        "avatarLabel": avatar_label,
        "description": row.get("description") or "Sin descripción disponible.",
        "location": _format_coordinates(latitude, longitude) if latitude is not None and longitude is not None else (row.get("location_label") or "Ubicación no disponible"),
        "likes": row.get("likes_count") or 0,
        "comments": row.get("comments_count") or 0,
        "image": row.get("media_url") or row.get("public_url") or "",
        "mediaType": row.get("media_type") or "photo",
        "userId": row.get("user_id"),
        "speciesId": row.get("species_id"),
        "locationId": row.get("location_id"),
        "latitude": latitude,
        "longitude": longitude,
        "category": row.get("category"),
        "publishedAt": row.get("created_at"),
    }


def _get_or_create_species_id(ai_result: Dict[str, Any]) -> Optional[str]:
    scientific_name = (ai_result.get("scientific_name") or "").strip()
    common_name = (ai_result.get("common_name") or "").strip()
    category = (ai_result.get("category") or "unknown").strip()
    description = (ai_result.get("description") or "").strip()

    lookup_name = scientific_name or common_name or "Especie no identificada"
    existing = _safe_query(
        supabase.table(SPECIES_TABLE)
        .select("id")
        .eq("scientific_name", lookup_name)
        .limit(1)
    )
    if existing and existing.data:
        species_id = existing.data[0]["id"]
        _safe_query(
            supabase.table(SPECIES_TABLE)
            .update(
                {
                    "common_name": common_name or lookup_name,
                    "scientific_name": lookup_name,
                    "category": category,
                    "description": description,
                    "confidence_score": ai_result.get("confidence_score"),
                    "updated_at": _now_iso(),
                }
            )
            .eq("id", species_id)
        )
        return species_id

    species_id = str(uuid4())
    _safe_query(
        supabase.table(SPECIES_TABLE).insert(
            {
                "id": species_id,
                "common_name": common_name or lookup_name,
                "scientific_name": lookup_name,
                "category": category,
                "description": description,
                "confidence_score": ai_result.get("confidence_score"),
                "created_at": _now_iso(),
                "updated_at": _now_iso(),
            }
        )
    )
    return species_id


def _create_location(location_label: Optional[str], latitude: Optional[float], longitude: Optional[float]) -> Optional[str]:
    has_coordinates = latitude is not None and longitude is not None
    if not location_label and not has_coordinates:
        return None

    location_id = str(uuid4())
    _safe_query(
        supabase.table(LOCATION_TABLE).insert(
            {
                "id": location_id,
                "label": location_label or "Ubicación sin nombre",
                "latitude": latitude,
                "longitude": longitude,
                "created_at": _now_iso(),
            }
        )
    )
    return location_id


def _sync_profile(user_id: str, email: Optional[str], display_name: Optional[str], avatar_url: Optional[str] = None, bio: Optional[str] = None) -> Dict[str, Any]:
    payload = {
        "id": user_id,
        "email": email,
        "display_name": display_name,
        "avatar_url": avatar_url,
        "bio": bio,
        "updated_at": _now_iso(),
    }
    _safe_query(supabase.table(PROFILE_TABLE).upsert(payload))
    return payload


def _fetch_publications(filters: Optional[Dict[str, Any]] = None, limit: int = 50, page: int = 1, per_page: Optional[int] = None, use_mat_view: bool = False) -> List[Dict[str, Any]]:
    """Fetch publications with column selection and pagination.

    - `per_page` defaults to `limit` for backward compatibility.
    - Uses `.range(start, end)` to avoid scanning unnecessary rows.
    - Logs query duration in ms.
    Returns a list of shaped publication dicts (same as before).
    """
    if per_page is None:
        per_page = limit or 50
    per_page = max(1, int(per_page))
    page = max(1, int(page))

    start = (page - 1) * per_page
    # request one extra row to detect if there are more pages
    end_extra = start + per_page

    if use_mat_view:
        # map_publications_mat contains the public-facing fields joined with locations
        select_columns = (
            "id, common_name, scientific_name, display_name, user_email, "
            "description, location_label, media_url, storage_path, is_public, "
            "media_type, user_id, species_id, location_id, latitude, longitude, category, created_at"
        )
        query = supabase.table(MAP_PUBLICATIONS_MAT).select(select_columns).order("created_at", desc=True).range(start, end_extra)
    else:
        select_columns = (
            "id, common_name, scientific_name, display_name, user_email, "
            "description, location_label, media_url, "
            "media_type, user_id, species_id, location_id, latitude, longitude, category, created_at"
        )
        query = supabase.table(PUBLICATION_TABLE).select(select_columns).order("created_at", desc=True).range(start, end_extra)

    if filters:
        for field_name, value in filters.items():
            if value is None:
                continue
            query = query.eq(field_name, value)

    logging.info("Executing publications query: filters=%s page=%s per_page=%s start=%s end=%s", filters, page, per_page, start, end_extra)
    t0 = time.time()
    # Try the requested query; if materialized view/table doesn't exist or fails,
    # fall back to the base `publications` table to preserve availability.
    try:
        response = _safe_query(query)
    except Exception as exc:
        logging.warning("Publications query failed (attempted view/table=%s): %s", (MAP_PUBLICATIONS_MAT if use_mat_view else PUBLICATION_TABLE), exc)
        if use_mat_view:
            # build fallback query against publications
            fallback_select = (
                "id, common_name, scientific_name, display_name, user_email, "
                "description, location_label, media_url, "
                "media_type, user_id, species_id, location_id, latitude, longitude, category, created_at"
            )
            try:
                fallback_query = supabase.table(PUBLICATION_TABLE).select(fallback_select).order("created_at", desc=True).range(start, end_extra)
                if filters:
                    for field_name, value in filters.items():
                        if value is None:
                            continue
                        fallback_query = fallback_query.eq(field_name, value)
                response = _safe_query(fallback_query)
            except Exception:
                raise
        else:
            raise
    duration_ms = int((time.time() - t0) * 1000)
    rows = response.data if response and response.data else []

    if not rows and filters and set(filters.keys()) == {"user_id"} and filters.get("user_id"):
        user_id = filters["user_id"]
        profile_resp = _safe_query(
            supabase.table(PROFILE_TABLE)
            .select("email,display_name")
            .eq("id", user_id)
            .limit(1)
        )
        profile_row = profile_resp.data[0] if profile_resp and profile_resp.data else None
        fallback_email = (profile_row or {}).get("email")
        fallback_display_name = (profile_row or {}).get("display_name")

        fallback_rows: List[Dict[str, Any]] = []
        try:
            base_query = (
                supabase.table(PUBLICATION_TABLE)
                .select(
                    "id, common_name, scientific_name, display_name, user_email, description, location_label, media_url, media_type, user_id, species_id, location_id, latitude, longitude, category, created_at"
                )
                .order("created_at", desc=True)
            )

            if fallback_email:
                email_resp = _safe_query(base_query.eq("user_email", fallback_email).range(start, end_extra))
                fallback_rows.extend(email_resp.data if email_resp and email_resp.data else [])

            if fallback_display_name:
                name_resp = _safe_query(base_query.eq("display_name", fallback_display_name).range(start, end_extra))
                fallback_rows.extend(name_resp.data if name_resp and name_resp.data else [])

            if fallback_rows:
                deduped: List[Dict[str, Any]] = []
                seen_ids = set()
                for row in fallback_rows:
                    row_id = row.get("id")
                    if row_id and row_id in seen_ids:
                        continue
                    if row_id:
                        seen_ids.add(row_id)
                    deduped.append(row)
                rows = deduped[:per_page]
        except Exception:
            pass

    has_more = len(rows) > per_page
    if has_more:
        rows = rows[:per_page]

    logging.info("Publications query completed: duration_ms=%sms rows_returned=%s has_more=%s", duration_ms, len(rows), has_more)
    return [_shape_publication(row) for row in rows]


@router.post("/scan", response_model=ScanResult)
async def analyze_species(file: UploadFile = File(...)):
    """
    Análisis IA del archivo subido.
    Persistencia final ocurre en /publications.
    """

    img_bytes = await file.read()
    ai_result = analyze_image_with_ai(img_bytes)
    return {
        **ai_result,
        "public_url": None,
    }


@router.post("/profiles/sync")
def sync_profile(payload: ProfileSyncRequest):
    return _sync_profile(payload.user_id, payload.email, payload.display_name, payload.avatar_url, payload.bio)


@router.get("/profiles/{user_id}")
def get_profile(user_id: str):
    resp = _safe_query(supabase.table(PROFILE_TABLE).select("id,email,display_name,avatar_url,bio,created_at,updated_at").eq("id", user_id).limit(1))
    if resp and resp.data:
        return resp.data[0]
    return None


@router.post("/profiles/{user_id}/avatar")
async def upload_avatar(user_id: str, file: UploadFile = File(...)):
    # store avatar in MEDIA_BUCKET under avatars/{user_id}/
    file_bytes = await file.read()
    file_extension = os.path.splitext(file.filename or "")[1] or ".jpg"
    storage_path = f"avatars/{user_id}/avatar{file_extension}"

    try:
        upload_result = supabase.storage.from_(MEDIA_BUCKET).upload(storage_path, file_bytes)
        try:
            public_url = supabase.storage.from_(MEDIA_BUCKET).get_public_url(storage_path)
        except Exception:
            public_url = ''
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {exc}")

    # update profile avatar_url
    try:
        _sync_profile(user_id, None, None, public_url)
    except Exception:
        pass

    return {"avatar_url": public_url}


@router.get("/profiles/exists")
def profile_exists(email: str):
    normalized_email = (email or "").strip().lower()
    if not normalized_email:
        return {"exists": False}

    response = _safe_query(
        supabase.table(PROFILE_TABLE)
        .select("id")
        .eq("email", normalized_email)
        .limit(1)
    )
    exists = bool(response and response.data)
    return {"exists": exists}


@router.get("/profiles/resolve")
def resolve_profile(username: str):
    q = (username or "").strip()
    if not q:
        return {"found": False}

    normalized_email = q.lower()

    # 1) try exact email match
    resp = _safe_query(
        supabase.table(PROFILE_TABLE).select("email,display_name").eq("email", normalized_email).limit(1)
    )
    if resp and resp.data:
        row = resp.data[0]
        return {"found": True, "email": row.get("email"), "display_name": row.get("display_name")}

    # 2) try exact display_name match
    resp = _safe_query(
        supabase.table(PROFILE_TABLE).select("email,display_name").eq("display_name", q).limit(1)
    )
    if resp and resp.data:
        row = resp.data[0]
        return {"found": True, "email": row.get("email"), "display_name": row.get("display_name")}

    # 3) try partial (case-insensitive) display_name match
    try:
        resp = _safe_query(
            supabase.table(PROFILE_TABLE).select("email,display_name").ilike("display_name", f"%{q}%").limit(1)
        )
        if resp and resp.data:
            row = resp.data[0]
            return {"found": True, "email": row.get("email"), "display_name": row.get("display_name")}
    except Exception:
        # some clients may not support ilike; ignore
        pass

    # 4) try matching by local-part of email
    local = q.split("@")[0]
    if local:
        try:
            resp = _safe_query(
                supabase.table(PROFILE_TABLE).select("email,display_name").ilike("email", f"%{local}%").limit(1)
            )
            if resp and resp.data:
                row = resp.data[0]
                return {"found": True, "email": row.get("email"), "display_name": row.get("display_name")}
        except Exception:
            pass

    return {"found": False}


@router.post("/publications")
async def create_publication(
    file: UploadFile = File(...),
    publication_id: Optional[str] = Form(None),
    user_id: str = Form(...),
    user_email: Optional[str] = Form(None),
    display_name: Optional[str] = Form(None),
    common_name: str = Form(...),
    scientific_name: str = Form(...),
    description: str = Form(...),
    confidence_score: float = Form(...),
    category: str = Form(...),
    media_type: str = Form("photo"),
    location_label: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    is_public: bool = Form(True),
):
    # Use provided id from client for idempotency if present
    publication_id = (publication_id or str(uuid4()))

    # If client provided publication_id, check existing record to avoid duplicates
    if publication_id:
        try:
            existing = _safe_query(supabase.table(PUBLICATION_TABLE).select("*").eq("id", publication_id).limit(1))
            if existing and existing.data:
                # return existing shaped publication
                row = existing.data[0]
                return _shape_publication(row)
        except Exception as exc:
            print(f"Failed checking existing publication for id {publication_id}: {exc}")
    file_bytes = await file.read()
    file_extension = os.path.splitext(file.filename or "")[1] or ".jpg"
    storage_path = f"publications/{user_id}/{publication_id}{file_extension}"

    try:
        upload_result = supabase.storage.from_(MEDIA_BUCKET).upload(storage_path, file_bytes)
        # attempt to obtain public url; some clients return dict, some throw
        try:
            public_url = supabase.storage.from_(MEDIA_BUCKET).get_public_url(storage_path)
        except Exception:
            public_url = ''
    except Exception as exc:
        print(f"Storage upload failed: {exc}")
        # surface error to client
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {exc}")

    profile_res = None
    try:
        profile_res = _sync_profile(user_id, user_email, display_name)
    except Exception as exc:
        print(f"Profile sync failed: {exc}")
        # do not block publication for profile sync, but log
    # Ensure profile exists before inserting publication to satisfy FK / RLS requirements
    try:
        profile_check = _safe_query(
            supabase.table(PROFILE_TABLE).select("id").eq("id", user_id).limit(1)
        )
        if not (profile_check and profile_check.data):
            raise HTTPException(status_code=400, detail="User profile not found or not authorized to create publications.")
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Profile existence check failed: {exc}")
        raise HTTPException(status_code=500, detail="Failed to verify user profile before creating publication.")
    species_id = _get_or_create_species_id(
        {
            "common_name": common_name,
            "scientific_name": scientific_name,
            "description": description,
            "confidence_score": confidence_score,
            "category": category,
        }
    )
    location_id = _create_location(location_label, latitude, longitude)

    publication_payload = {
        "id": publication_id,
        "user_id": user_id,
        "user_email": user_email,
        "display_name": display_name,
        "species_id": species_id,
        "location_id": location_id,
        "location_label": location_label,
        "latitude": latitude,
        "longitude": longitude,
        "common_name": common_name,
        "scientific_name": scientific_name,
        "description": description,
        "confidence_score": confidence_score,
        "category": category,
        "media_type": media_type,
        "storage_path": storage_path,
        "media_url": public_url,
        "is_public": is_public,
        "created_at": _now_iso(),
    }

    insert_result = _safe_query(supabase.table(PUBLICATION_TABLE).insert(publication_payload))
    if not insert_result:
        raise HTTPException(status_code=500, detail="Failed to insert publication into database.")

    return {
        "id": publication_id,
        "species_id": species_id,
        "location_id": location_id,
        "user_id": user_id,
        "display_name": display_name,
        "location_label": location_label,
        "created_at": publication_payload["created_at"],
        "media_url": public_url,
        "storage_path": storage_path,
        "media_type": media_type,
        "is_public": is_public,
        "common_name": common_name,
        "scientific_name": scientific_name,
        "description": description,
        "confidence_score": confidence_score,
        "category": category,
    }


@router.get("/publications/feed")
def get_public_feed(limit: int = 50, page: int = 1, per_page: Optional[int] = None):
    return _fetch_publications({"is_public": True}, limit=limit, page=page, per_page=per_page, use_mat_view=True)


@router.get("/publications/{publication_id}")
def get_publication(publication_id: str):
    try:
        response = _safe_query(
            supabase.table(PUBLICATION_TABLE)
            .select(
                "id, common_name, scientific_name, display_name, user_email, description, location_label, media_url, media_type, user_id, species_id, location_id, latitude, longitude, category, created_at"
            )
            .eq("id", publication_id)
            .limit(1)
        )
        if response and response.data:
            return _shape_publication(response.data[0])
    except Exception as exc:
        logging.warning("Publication detail query failed for id=%s: %s", publication_id, exc)

    raise HTTPException(status_code=404, detail="Publication not found")


@router.get("/publications/user/{user_id}")
def get_user_publications(user_id: str, limit: int = 50, page: int = 1, per_page: Optional[int] = None):
    return _fetch_publications({"user_id": user_id}, limit=limit, page=page, per_page=per_page, use_mat_view=True)


@router.get("/species/{species_id}/publications")
def get_species_publications(species_id: str, limit: int = 50, page: int = 1, per_page: Optional[int] = None):
    return _fetch_publications({"species_id": species_id}, limit=limit, page=page, per_page=per_page, use_mat_view=True)


@router.get("/users/{user_id}/stats")
def get_user_stats(user_id: str):
    # Prefer materialized view for stats if available
    try:
        resp = _safe_query(supabase.table(USER_STATS_MAT).select("*").eq("user_id", user_id).limit(1))
        if resp and resp.data:
            row = resp.data[0]
            return {
                "user_id": user_id,
                "records_total": int(row.get("records_total") or 0),
                "publications_total": int(row.get("records_total") or 0),
                "photos_total": int(row.get("photos_total") or 0),
                "audios_total": int(row.get("audios_total") or 0),
                "videos_total": int(row.get("videos_total") or 0),
                "species_total": int(row.get("species_total") or 0),
                "locations_total": int(row.get("locations_total") or 0),
            }
    except Exception:
        # Fall back to on-the-fly computation if view is not present or fails
        publications = _fetch_publications({"user_id": user_id}, limit=500)
        total_publications = len(publications)
        photo_count = sum(1 for item in publications if item.get("mediaType") == "photo")
        audio_count = sum(1 for item in publications if item.get("mediaType") == "audio")
        video_count = sum(1 for item in publications if item.get("mediaType") == "video")
        species_total = len({item.get("speciesId") for item in publications if item.get("speciesId")})
        location_total = len({item.get("locationId") for item in publications if item.get("locationId")})

        return {
            "user_id": user_id,
            "records_total": total_publications,
            "publications_total": total_publications,
            "photos_total": photo_count,
            "audios_total": audio_count,
            "videos_total": video_count,
            "species_total": species_total,
            "locations_total": location_total,
        }


@router.post("/admin/refresh-materialized-views")
def refresh_materialized_views(x_refresh_admin_key: Optional[str] = None):
    """Trigger the DB helper `public.refresh_materialized_views()`.

    Protect with an admin key via `REFRESH_ADMIN_KEY` env var. If unset, falls back to `SUPABASE_KEY`.
    """
    expected = os.environ.get("REFRESH_ADMIN_KEY") or os.environ.get("SUPABASE_KEY")
    if expected and x_refresh_admin_key != expected:
        raise HTTPException(status_code=403, detail="Unauthorized to refresh materialized views.")

    t0 = time.time()
    try:
        # Call the DB function; PostgREST exposes RPC via rpc(name)
        _safe_query(supabase.rpc("refresh_materialized_views"))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to refresh materialized views: {exc}")
    duration_ms = int((time.time() - t0) * 1000)
    return {"status": "ok", "duration_ms": duration_ms}


@router.get("/map/publications")
def get_map_publications(limit: int = 100, page: int = 1, per_page: Optional[int] = None):
    # Use the live publications table so new map items appear immediately even if
    # the materialized view has not been refreshed yet.
    items = _fetch_publications({"is_public": True}, limit=limit, page=page, per_page=per_page, use_mat_view=False)
    return [item for item in items if item.get("latitude") is not None and item.get("longitude") is not None]


@router.get("/guayanadex/{user_id}")
def get_user_records(user_id: str, limit: int = 50, page: int = 1, per_page: Optional[int] = None):
    return get_user_publications(user_id, limit=limit, page=page, per_page=per_page)
