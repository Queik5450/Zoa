const DEFAULT_API_BASE_URL = 'https://zoa-5p6r.onrender.com/api';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function apiJson(path, options = {}) {
  const { body, headers, ...restOptions } = options;
  const requestHeaders = new Headers(headers || {});
  const requestInit = {
    ...restOptions,
    headers: requestHeaders,
  };

  if (body !== undefined) {
    if (body instanceof FormData) {
      requestInit.body = body;
    } else if (typeof body === 'string') {
      requestInit.body = body;
    } else {
      requestHeaders.set('Content-Type', 'application/json');
      requestInit.body = JSON.stringify(body);
    }
  }

  const response = await fetch(apiUrl(path), requestInit);
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText || 'No se pudo completar la solicitud.');
  }

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

export function mergeCards(primaryCards = [], fallbackCards = []) {
  const seenIds = new Set();
  return [...primaryCards, ...fallbackCards].filter((card) => {
    if (!card?.id || seenIds.has(card.id)) {
      return false;
    }
    seenIds.add(card.id);
    return true;
  });
}