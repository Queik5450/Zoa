import { apiJson, apiUrl } from './api';
import { dataUrlToFile, getMockAuth, savePublishedCard, incrementPendingPhotos } from './scanFlow';
import { supabase } from './supabaseClient';

const PENDING_PUBLICATION_KEY = 'zoa.pendingPublication';

function formatCoordinates(latitude, longitude) {
  return 'UCAB Guayana';
}

function toCoordinate(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function readJson(key, fallbackValue) {
  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) return fallbackValue;
    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function savePendingPublicationDraft(draft) {
  writeJson(PENDING_PUBLICATION_KEY, draft);
}

export function getPendingPublicationDraft() {
  return readJson(PENDING_PUBLICATION_KEY, null);
}

export function clearPendingPublicationDraft() {
  window.localStorage.removeItem(PENDING_PUBLICATION_KEY);
}

export function buildPublicationCardFromDraft(draft, authSession = getMockAuth()) {
  if (!draft) return null;

  const analysis = draft.analysis || {};
  const location = draft.location || {};
  const displayName = authSession?.displayName || draft.authorName?.replace(/^@/, '') || 'usuario';
  const latitude = toCoordinate(location.latitude);
  const longitude = toCoordinate(location.longitude);

  return {
    id: draft.id || analysis.id || `draft-${Date.now()}`,
    name: analysis.common_name || draft.name || 'Desconocido',
    species: analysis.common_name || draft.name || 'Especie',
    scientificName: analysis.scientific_name || draft.scientificName || '',
    authorName: `@${displayName}`,
    description: analysis.description || draft.description || 'Sin descripción disponible.',
    location: formatCoordinates(latitude, longitude),
    likes: draft.likes || '1k',
    comments: draft.comments || '100',
    image: draft.dataUrl || draft.image || '',
    mediaType: draft.mediaType || 'photo',
  };
}

export async function publishPendingPublicationDraft(draft = null) {
  const currentDraft = draft || getPendingPublicationDraft();
  if (!currentDraft) {
    throw new Error('No hay publicación pendiente.');
  }

  const authSession = getMockAuth();
  if (!authSession?.userId) {
    throw new Error('Debes iniciar sesión para publicar.');
  }

  try {
    await apiJson('/profiles/sync', {
      method: 'POST',
      body: {
        user_id: authSession.userId,
        email: authSession.email || '',
        display_name: authSession.displayName || currentDraft.authorName?.replace(/^@/, '') || 'usuario',
        avatar_url: null,
      },
    });
  } catch {
    // Continue with publication; the backend will still perform its own profile check.
  }

  const analysis = currentDraft.analysis || {};
  const location = currentDraft.location || {};
  const mediaDataUrl = currentDraft.dataUrl || currentDraft.image || currentDraft.audioUrl || currentDraft.dataUrl;

  if (!mediaDataUrl) {
    throw new Error('No se encontró archivo para publicar.');
  }

  const defaultFileName = (currentDraft.mediaType === 'audio') ? (currentDraft.fileName || 'recording.webm') : (currentDraft.fileName || 'scan.jpg');
  const imageFile = dataUrlToFile(mediaDataUrl, defaultFileName);
  const formData = new FormData();
  formData.append('file', imageFile);
  // Idempotency: send client-generated publication id so backend can dedupe
  const clientPubId = currentDraft.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `client-${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
  formData.append('publication_id', clientPubId);
  // Require a valid user id (UUID) from the authenticated session. Do not fallback to email or anonymous.
  formData.append('user_id', authSession.userId);
  formData.append('user_email', authSession.email || '');
  formData.append('display_name', authSession.displayName || currentDraft.authorName?.replace(/^@/, '') || 'usuario');
  formData.append('common_name', analysis.common_name || currentDraft.name || 'Desconocido');
  formData.append('scientific_name', analysis.scientific_name || currentDraft.scientificName || '');
  formData.append('description', analysis.description || currentDraft.description || 'Sin descripción disponible.');
  formData.append('confidence_score', String(analysis.confidence_score ?? 0));
  formData.append('category', analysis.category || currentDraft.category || 'unknown');
  formData.append('media_type', currentDraft.mediaType || 'photo');
  formData.append('location_label', formatCoordinates(location.latitude, location.longitude));
  formData.append('latitude', location.latitude ?? '');
  formData.append('longitude', location.longitude ?? '');
  formData.append('is_public', 'true');

  const sessionResult = await supabase.auth.getSession();
  const accessToken = sessionResult.data?.session?.access_token;

  // Try fetch, retry once on network failure
  let response;
  try {
    response = await fetch(apiUrl('/publications'), {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: formData,
    });
  } catch (networkErr) {
    // transient network error, retry once
    try {
      response = await fetch(apiUrl('/publications'), {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        body: formData,
      });
    } catch (secondErr) {
      throw new Error(secondErr?.message || 'Network error during publication.');
    }
  }
  let published;
  try {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'No se pudo publicar la observación.');
    }

    const text = await response.text();
    try {
      published = text ? JSON.parse(text) : null;
    } catch {
      // if response is not JSON, keep raw text
      published = text;
    }
  } catch (err) {
    throw new Error(err?.message || 'No se pudo publicar la observación.');
  }
  // Save a client-side copy so feeds update immediately.
  try {
    savePublishedCard({
      id: published?.id || clientPubId,
      image: published?.media_url || published?.mediaUrl || '',
      name: published?.common_name || published?.name || currentDraft.name || 'Desconocido',
      species: published?.common_name || currentDraft.name || 'Especie',
      scientificName: published?.scientific_name || currentDraft.scientificName || '',
      mediaType: published?.media_type || currentDraft.mediaType || 'photo',
      latitude: published?.latitude ?? location?.latitude,
      longitude: published?.longitude ?? location?.longitude,
    });
  } catch (err) {
    // ignore local save errors
  }

  try {
    if ((published?.media_type || currentDraft.mediaType) === 'photo') {
      incrementPendingPhotos(authSession.userId, 1);
    }
  } catch (err) {
    // ignore
  }

  clearPendingPublicationDraft();
  return published;
}
