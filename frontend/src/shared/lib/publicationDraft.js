import { apiUrl } from './api';
import { dataUrlToFile, getMockAuth } from './scanFlow';
import { supabase } from './supabaseClient';

const PENDING_PUBLICATION_KEY = 'zoa.pendingPublication';

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

  return {
    id: draft.id || analysis.id || `draft-${Date.now()}`,
    name: analysis.common_name || draft.name || 'Desconocido',
    species: analysis.common_name || draft.name || 'Especie',
    scientificName: analysis.scientific_name || draft.scientificName || '',
    authorName: `@${displayName}`,
    description: analysis.description || draft.description || 'Sin descripción disponible.',
    location: location.label || draft.locationLabel || 'Ubicación no disponible',
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

  const analysis = currentDraft.analysis || {};
  const location = currentDraft.location || {};
  const imageDataUrl = currentDraft.dataUrl || currentDraft.image;

  if (!imageDataUrl) {
    throw new Error('No se encontró imagen para publicar.');
  }

  const imageFile = dataUrlToFile(imageDataUrl, currentDraft.fileName || 'scan.jpg');
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('user_id', authSession.userId || authSession.id || authSession.email || 'anonymous');
  formData.append('user_email', authSession.email || '');
  formData.append('display_name', authSession.displayName || currentDraft.authorName?.replace(/^@/, '') || 'usuario');
  formData.append('common_name', analysis.common_name || currentDraft.name || 'Desconocido');
  formData.append('scientific_name', analysis.scientific_name || currentDraft.scientificName || '');
  formData.append('description', analysis.description || currentDraft.description || 'Sin descripción disponible.');
  formData.append('confidence_score', String(analysis.confidence_score ?? 0));
  formData.append('category', analysis.category || currentDraft.category || 'unknown');
  formData.append('media_type', currentDraft.mediaType || 'photo');
  formData.append('location_label', location.label || currentDraft.locationLabel || 'Ubicación actual');
  formData.append('latitude', location.latitude ?? '');
  formData.append('longitude', location.longitude ?? '');
  formData.append('is_public', 'true');

  const sessionResult = await supabase.auth.getSession();
  const accessToken = sessionResult.data?.session?.access_token;

  const response = await fetch(apiUrl('/publications'), {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
  });
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
  clearPendingPublicationDraft();
  return published;
}
