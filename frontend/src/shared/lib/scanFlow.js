const PENDING_SCAN_KEY = 'zoa.pendingScan';
const PUBLISHED_CARDS_KEY = 'zoa.publishedCards';
const LOCAL_GALLERY_KEY = 'zoa.localGallery';
const MOCK_AUTH_KEY = 'zoa.mockAuth';
let pendingScanMemory = null;

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

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
    reader.readAsDataURL(file);
  });
}

export function dataUrlToFile(dataUrl, fileName = 'scan.jpg') {
  const [header, base64Value] = dataUrl.split(',');
  const mimeMatch = header?.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';
  const binaryString = window.atob(base64Value || '');
  const binaryLength = binaryString.length;
  const bytes = new Uint8Array(binaryLength);

  for (let index = 0; index < binaryLength; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return new File([bytes], fileName, { type: mimeType });
}

export function getMockAuth() {
  // Return any stored mock auth if explicitly set, otherwise behave as
  // unauthenticated. Removed automatic dev provisioning for localhost.
  return readJson(MOCK_AUTH_KEY, null);
}

export function setMockAuth(authData) {
  writeJson(MOCK_AUTH_KEY, authData);
}

export function clearMockAuth() {
  window.localStorage.removeItem(MOCK_AUTH_KEY);
}

export function savePendingScan(scanData) {
  pendingScanMemory = scanData;

  try {
    writeJson(PENDING_SCAN_KEY, scanData);
  } catch {
    // Fallback to memory for large camera photos that exceed localStorage quota.
  }
}

export function getPendingScan() {
  return readJson(PENDING_SCAN_KEY, pendingScanMemory);
}

export function clearPendingScan() {
  pendingScanMemory = null;
  window.localStorage.removeItem(PENDING_SCAN_KEY);
}

export function getPublishedCards() {
  return readJson(PUBLISHED_CARDS_KEY, []);
}

export function savePublishedCard(card) {
  const currentCards = getPublishedCards();
  writeJson(PUBLISHED_CARDS_KEY, [card, ...currentCards]);
}

export function getLocalGalleryItems() {
  return readJson(LOCAL_GALLERY_KEY, []);
}

export function saveLocalGalleryItem(item) {
  const currentItems = getLocalGalleryItems();
  writeJson(LOCAL_GALLERY_KEY, [item, ...currentItems]);
}

const PENDING_STATS_KEY = 'zoa.pendingStats';

export function getPendingStats() {
  return readJson(PENDING_STATS_KEY, {});
}

export function incrementPendingPhotos(userId, delta = 1) {
  if (!userId) return;
  const all = getPendingStats();
  const prev = all[userId] || { photos: 0 };
  prev.photos = (prev.photos || 0) + delta;
  all[userId] = prev;
  writeJson(PENDING_STATS_KEY, all);
}

export function clearPendingStats(userId) {
  if (!userId) return;
  const all = getPendingStats();
  if (!all[userId]) return;
  delete all[userId];
  writeJson(PENDING_STATS_KEY, all);
}