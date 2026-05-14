import React, { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { apiJson } from '../../../shared/lib/api';
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [5.35, -62.2];
const MAP_PAGE_SIZE = 100;
const MAP_ENDPOINTS = ['/map/publications', '/publications/feed'];
const MAP_REQUEST_TIMEOUT_MS = 15000;
const SHOW_MAP_DEBUG = import.meta.env.DEV;
const MAP_VIEW_BOX = { minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 };

function mergeUniquePublications(baseItems, incomingItems) {
  const merged = [...baseItems];
  const seenIds = new Set(baseItems.map((item) => item?.id).filter(Boolean));

  for (const item of incomingItems) {
    if (!item?.id || seenIds.has(item.id)) {
      continue;
    }

    seenIds.add(item.id);
    merged.push(item);
  }

  return merged;
}

function safeErrorMessage(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  return error.message || String(error);
}

function toCoordinate(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapResizeFix({ deps }) {
  const map = useMap();

  useEffect(() => {
    const frames = [];
    const timeouts = [];

    frames.push(
      window.requestAnimationFrame(() => {
        map.invalidateSize();
      }),
    );
    frames.push(
      window.requestAnimationFrame(() => {
        map.invalidateSize();
      }),
    );
    timeouts.push(
      window.setTimeout(() => {
        map.invalidateSize();
      }, 250),
    );
    timeouts.push(
      window.setTimeout(() => {
        map.invalidateSize();
      }, 750),
    );

    return () => {
      frames.forEach((frame) => window.cancelAnimationFrame(frame));
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [map, deps]);

  return null;
}

function latLngToPercent(latitude, longitude) {
  const latRatio = (latitude - MAP_VIEW_BOX.minLat) / (MAP_VIEW_BOX.maxLat - MAP_VIEW_BOX.minLat);
  const lngRatio = (longitude - MAP_VIEW_BOX.minLng) / (MAP_VIEW_BOX.maxLng - MAP_VIEW_BOX.minLng);

  return {
    top: `${(1 - latRatio) * 100}%`,
    left: `${lngRatio * 100}%`,
  };
}

function formatLocationLabel(latitude, longitude) {
  return `Lat ${Number(latitude).toFixed(4)}, Lng ${Number(longitude).toFixed(4)}`;
}

function Map() {
  const [query, setQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastError, setLastError] = useState('');
  const [requestCount, setRequestCount] = useState(0);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadMapPublications() {
      async function fetchPage(endpoint, page) {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), MAP_REQUEST_TIMEOUT_MS);

        try {
          setRequestCount((current) => current + 1);
          const response = await apiJson(`${endpoint}?page=${page}&per_page=${MAP_PAGE_SIZE}`, {
            signal: controller.signal,
          });
          return Array.isArray(response) ? response : [];
        } catch (error) {
          if (isActive) {
            const message = `Error cargando ${endpoint}?page=${page}&per_page=${MAP_PAGE_SIZE}: ${safeErrorMessage(error)}`;
            setLastError(message);
            console.error(message, error);
          }
          throw error;
        } finally {
          window.clearTimeout(timeoutId);
        }
      }

      async function loadRemainingPages(endpoint, startPage, initialItems = []) {
        let page = 1;
        let accumulated = initialItems;

        while (isActive) {
          const items = await fetchPage(endpoint, startPage + page - 1);

          if (!items.length) {
            break;
          }

          accumulated = mergeUniquePublications(accumulated, items);
          if (!isActive) return;
          setPublications((current) => mergeUniquePublications(current, accumulated));

          if (items.length < MAP_PAGE_SIZE) {
            break;
          }

          page += 1;
        }
      }

      try {
        for (const endpoint of MAP_ENDPOINTS) {
          try {
            const firstPageItems = await fetchPage(endpoint, 1);
            if (!isActive) return;

            setPublications(firstPageItems);
            setIsLoading(false);
            setLastError('');

            if (firstPageItems.length >= MAP_PAGE_SIZE) {
              void loadRemainingPages(endpoint, 2, firstPageItems).catch((error) => {
                if (!isActive) return;
                const message = `Error cargando páginas adicionales desde ${endpoint}: ${safeErrorMessage(error)}`;
                setLastError(message);
                console.error(message, error);
              });
            }

            return;
          } catch (error) {
            if (!isActive) return;
            console.error(`Endpoint principal falló: ${endpoint}`, error);
            if (endpoint === MAP_ENDPOINTS[MAP_ENDPOINTS.length - 1]) {
              throw error;
            }
          }
        }
      } catch {
        if (!isActive) return;
        setPublications([]);
        setLastError('No se pudieron cargar publicaciones para el mapa.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadMapPublications();

    return () => {
      isActive = false;
    };
  }, [reloadNonce]);

  const filteredPublications = useMemo(() => {
    const term = normalizeSearchText(query.trim());
    if (!term) {
      return publications;
    }

    return publications.filter((item) => {
      const haystack = [
        item.name,
        item.species,
        item.scientificName,
        item.location,
        item.authorName,
        item.common_name,
        item.scientific_name,
        item.location_label,
        item.display_name,
      ]
        .filter(Boolean)
        .map((field) => normalizeSearchText(field))
        .join(' ');

      return haystack.includes(term);
    });
  }, [publications, query]);

  const visiblePins = searchActive ? filteredPublications : publications;
  const hasMapResults = publications.length > 0;
  const mapPins = useMemo(
    () => visiblePins.filter((item) => toCoordinate(item.latitude) !== null && toCoordinate(item.longitude) !== null),
    [visiblePins],
  );
  const stats = useMemo(
    () => ({
      photos: filteredPublications.filter((item) => item.mediaType === 'photo' || item.mediaType === undefined).length,
      audios: filteredPublications.filter((item) => item.mediaType === 'audio').length,
      collaborators: new Set(filteredPublications.map((item) => item.userId).filter(Boolean)).size,
    }),
    [filteredPublications],
  );
  const selectedPublication = filteredPublications[0] || visiblePins[0] || null;

  const runSearch = (e) => {
    e?.preventDefault?.();
    const q = query.trim();
    if (q.length === 0) {
      setSearchActive(false);
      return;
    }
    setSearchActive(true);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchActive(false);
  };

  useEffect(() => {
    setMapReady(false);
  }, [reloadNonce, mapPins.length]);

  const handleReload = () => {
    setLastError('');
    setIsLoading(true);
    setReloadNonce((current) => current + 1);
  };

  const mapBackgroundStyle = {
    backgroundImage:
      'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.86), rgba(232,234,236,0.72) 40%, rgba(224,228,233,0.92) 100%), linear-gradient(180deg, rgba(193,225,79,0.12), transparent 35%)',
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#edf7f9] px-3 pb-[calc(var(--zoa-bottom-height)+12px)] pt-2 sm:px-4 sm:pb-[calc(var(--zoa-bottom-height)+16px)] sm:pt-3">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(193,225,79,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.54)_0%,rgba(237,247,249,0.15)_32%,rgba(237,247,249,0.68)_100%)]" />

      {SHOW_MAP_DEBUG ? (
        <div className="relative z-20 mb-2 rounded-2xl border border-black/10 bg-white/90 px-3 py-2 text-[11px] font-semibold text-neutral-700 shadow-[0_10px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div>loading: {isLoading ? 'yes' : 'no'}</div>
              <div>requests: {requestCount}</div>
              <div>publications: {publications.length}</div>
              <div>mapPins: {mapPins.length}</div>
              <div>mapReady: {mapReady ? 'yes' : 'no'}</div>
              {lastError ? <div className="mt-1 break-words text-red-600">{lastError}</div> : null}
            </div>
            <button
              type="button"
              onClick={handleReload}
              className="rounded-full border border-black/10 bg-[#f8faf4] px-3 py-1 text-[11px] font-bold text-black hover:bg-[#eef4df]"
            >
              Refetch
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={runSearch} className="relative z-10 shrink-0">
        <div className="flex items-center gap-2 rounded-[22px] border border-white/80 bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.10)]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Buscar animal, especie o zona"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-black outline-none placeholder:text-neutral-400"
          />
          <button type="submit" className="shrink-0 rounded-full p-1.5 text-neutral-600 hover:bg-neutral-100" aria-label="Buscar">
            <Search className="h-5 w-5" />
          </button>
          {searchActive ? (
            <button
              type="button"
              onClick={clearSearch}
              className="shrink-0 rounded-full p-1.5 text-neutral-600 hover:bg-neutral-100"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </form>

      <div className="relative z-10 mt-3 min-h-[42dvh] flex-[1.15] overflow-hidden rounded-[30px] border border-white/70 bg-[#e8eaec] shadow-[0_18px_42px_rgba(0,0,0,0.14)] sm:min-h-[48dvh]">
        {isLoading ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 text-sm font-semibold text-neutral-700 backdrop-blur-sm">
            Cargando mapa...
          </div>
        ) : null}

        {!isLoading && !hasMapResults ? (
          <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full border border-[#dbe6b1] bg-white/95 px-4 py-2 text-center text-xs font-semibold text-[#6c7920] shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            No se hallaron publicaciones en el mapa
          </div>
        ) : null}

        {!isLoading && hasMapResults && mapPins.length > 0 ? (
          <div className="absolute right-3 top-3 z-20 rounded-full border border-[#dbe6b1] bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#6c7920] shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            {mapPins.length} pin{mapPins.length === 1 ? '' : 's'} listo{mapPins.length === 1 ? '' : 's'}
          </div>
        ) : null}

        <div className="absolute inset-0 overflow-hidden rounded-[30px]" style={mapBackgroundStyle}>
          <svg className="absolute inset-0 h-full w-full opacity-[0.18]" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="map-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(78,93,99,0.35)" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#map-grid)" />
            <path d="M10,30 C22,24 25,42 37,39 C49,36 52,20 64,24 C72,27 73,40 82,44 C88,47 91,55 92,66" fill="none" stroke="rgba(78,93,99,0.45)" strokeWidth="0.8" />
            <path d="M18,78 C26,70 31,74 39,69 C48,63 56,58 68,60 C77,61 84,67 89,73" fill="none" stroke="rgba(78,93,99,0.35)" strokeWidth="0.7" />
          </svg>

          {mapPins.map((pin) => {
            const latitude = toCoordinate(pin.latitude);
            const longitude = toCoordinate(pin.longitude);
            if (latitude === null || longitude === null) return null;

            const position = latLngToPercent(latitude, longitude);

            return (
              <div
                key={pin.id}
                className="absolute z-20 -translate-x-1/2 -translate-y-full"
                style={position}
              >
                <div className="relative flex flex-col items-center">
                  <span className="mb-1 rounded-full bg-black px-2 py-1 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                    {pin.mediaType === 'audio' ? 'Audio' : 'Punto'}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#95a82b] text-lg text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
                    {pin.mediaType === 'audio' ? '🎙' : '📍'}
                  </div>
                  <div className="mt-1 max-w-[130px] rounded-xl bg-white/95 px-3 py-2 text-center text-[10px] font-semibold leading-tight text-[#43501a] shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
                    <div className="truncate">{pin.name || 'Publicación'}</div>
                    <div className="truncate text-[9px] font-medium text-neutral-600">{formatLocationLabel(latitude, longitude)}</div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.64)_100%)]" />
        </div>

        {mapPins.length > 0 ? <MapContainer center={DEFAULT_CENTER} zoom={5} className="hidden" /> : null}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_48%,rgba(0,0,0,0.06)_100%)]" />
      </div>

      {searchActive ? (
        <section className="relative z-10 mt-3 flex max-h-[min(44vh,400px)] min-h-0 flex-col overflow-hidden rounded-t-[28px] border border-neutral-100 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] sm:max-h-[min(48vh,430px)]">
          <div className="shrink-0 px-4 pb-2 pt-3">
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-neutral-200" />
            <p className="mb-2 text-center text-xs font-semibold text-neutral-600">Resultados para «{query.trim()}»</p>
            <div className="grid grid-cols-3 gap-2 border-b border-neutral-200 pb-3 text-center text-[11px] font-semibold leading-tight text-neutral-700">
              <div className="rounded-lg bg-[#f4f7e8] px-1 py-2">
                <span className="block text-lg font-black text-[#c1e14f]">{stats.audios}</span>
                Audios
              </div>
              <div className="rounded-lg bg-[#f4f7e8] px-1 py-2">
                <span className="block text-lg font-black text-[#c1e14f]">{stats.photos}</span>
                Fotos
              </div>
              <div className="rounded-lg bg-[#f4f7e8] px-1 py-2">
                <span className="block text-lg font-black text-[#c1e14f]">{stats.collaborators}</span>
                Colaboradores
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            <article className="rounded-2xl border border-neutral-200 bg-[#fafbf7] p-3 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#80902e]">Animal o planta</h3>
              <div className="mt-2 flex gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200">
                  {selectedPublication?.image ? (
                    <img
                      src={selectedPublication.image}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed text-neutral-800">
                  {selectedPublication
                    ? `${selectedPublication.name} · ${selectedPublication.scientificName || 'Sin nombre científico'}`
                    : 'Sin coincidencias aún. Ajusta búsqueda o publica una observación con ubicación.'}
                </p>
              </div>
            </article>
            <article className="mt-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#80902e]">La zona</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-800">
                {selectedPublication?.location || 'Ubicación conectada al pin de la publicación.'}
              </p>
            </article>

            <article className="mt-3 rounded-2xl border border-neutral-200 bg-[#f8faf4] p-3 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#80902e]">Animales en la zona</h3>
              <ul className="mt-2 list-inside list-disc text-sm text-neutral-700">
                {filteredPublications.slice(0, 3).map((item) => (
                  <li key={item.id}>{item.name || item.scientificName || 'Publicación sin nombre'}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default Map;
