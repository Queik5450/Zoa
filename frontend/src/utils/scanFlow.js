const PENDING_SCAN_KEY = 'zoa.pendingScan';
const PUBLISHED_CARDS_KEY = 'zoa.publishedCards';
const LOCAL_GALLERY_KEY = 'zoa.localGallery';
const MOCK_AUTH_KEY = 'zoa.mockAuth';

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
  return readJson(MOCK_AUTH_KEY, null);
}

export function setMockAuth(authData) {
  writeJson(MOCK_AUTH_KEY, authData);
}

export function clearMockAuth() {
  window.localStorage.removeItem(MOCK_AUTH_KEY);
}

export function savePendingScan(scanData) {
  writeJson(PENDING_SCAN_KEY, scanData);
}

export function getPendingScan() {
  return readJson(PENDING_SCAN_KEY, null);
}

export function clearPendingScan() {
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