import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { apiJson } from '../../../shared/lib/api';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [5.35, -62.2];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function AutoFitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude]));
    map.fitBounds(bounds.pad(0.2), { maxZoom: 11 });
  }, [map, points]);

  return null;
}

function Map() {
  const [query, setQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadMapPublications() {
      try {
        const response = await apiJson('/map/publications?limit=100');
        if (!isActive) return;
        setPublications(Array.isArray(response) ? response : []);
      } catch {
        if (!isActive) return;
        setPublications([]);
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
  }, []);

  const filteredPublications = useMemo(() => {
    const term = query.trim().toLowerCase();
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
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [publications, query]);

  const visiblePins = searchActive ? filteredPublications : publications;
  const hasMapResults = publications.length > 0;
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

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#edf7f9] px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(193,225,79,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.54)_0%,rgba(237,247,249,0.15)_32%,rgba(237,247,249,0.68)_100%)]" />

      <form onSubmit={runSearch} className="relative z-10 shrink-0">
        <div className="flex items-center gap-2 rounded-[22px] border border-white/80 bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.10)]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4f7e8] text-[#80902e]">
            <ChevronDown className="h-5 w-5" aria-hidden />
          </div>
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

        {hasMapResults ? (
          <MapContainer center={DEFAULT_CENTER} zoom={5} className="h-full w-full">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <AutoFitBounds points={visiblePins.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))} />
            {visiblePins
              .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
              .map((pin) => (
                <Marker key={pin.id} position={[pin.latitude, pin.longitude]}>
                  <Popup>
                    <div className="max-w-[220px] space-y-1">
                      <p className="text-sm font-bold text-black">{pin.name || 'Publicación'}</p>
                      <p className="text-xs text-neutral-600">{pin.scientificName || pin.species || 'Sin especie'}</p>
                      <p className="text-xs text-neutral-600">{pin.location || 'Sin ubicación'}</p>
                      <p className="text-xs text-neutral-500">{pin.authorName || 'Usuario'}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        ) : null}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_48%,rgba(0,0,0,0.06)_100%)]" />
      </div>

      {!searchActive ? (
        <div className="relative z-10 mt-3 overflow-hidden rounded-t-[24px] border border-white/70 bg-white/95 px-4 py-3 text-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:mt-4 sm:px-5">
          <p className="text-xs font-bold text-neutral-700">{publications.length} publicaciones con ubicación</p>
          <p className="mt-0.5 text-[11px] text-neutral-500">Busca animal, especie o zona para filtrar pins reales</p>
        </div>
      ) : (
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
              <p className="mt-2 text-sm leading-relaxed text-neutral-800">Publicaciones del mundo para esta especie o zona.</p>
              <ul className="mt-2 list-inside list-disc text-sm text-neutral-700">
                {filteredPublications.slice(0, 3).map((item) => (
                  <li key={item.id}>{item.name || item.scientificName || 'Publicación sin nombre'}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      )}
    </div>
  );
}

export default Map;
