import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { getPublishedCards } from '../utils/scanFlow';
import { MOCK_MAP_CHIPS } from '../data/zoaMocks';
import { apiJson } from '../utils/api';
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
  const fallbackPublications = useMemo(() => getPublishedCards().filter((card) => card.latitude && card.longitude), []);

  useEffect(() => {
    let isActive = true;

    async function loadMapPublications() {
      try {
        const response = await apiJson('/map/publications?limit=100');
        if (!isActive) return;
        setPublications(Array.isArray(response) && response.length > 0 ? response : fallbackPublications);
      } catch {
        if (!isActive) return;
        setPublications(fallbackPublications);
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
  }, [fallbackPublications]);

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
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#dfe7cf] via-transparent to-[#eef3f8]" />
      <div className="pointer-events-none absolute inset-0 bg-black/12" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-3 pt-2">
        <form
          onSubmit={runSearch}
          className="pointer-events-auto flex shrink-0 flex-col gap-2"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-neutral-200/90 bg-white px-3 py-2.5 shadow-md">
            <ChevronDown className="h-5 w-5 shrink-0 text-neutral-500" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Buscar animal, especie, zona..."
              className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-neutral-400"
            />
            <button type="submit" className="shrink-0 rounded-full p-1 text-neutral-600 hover:bg-neutral-100" aria-label="Buscar">
              <Search className="h-5 w-5" />
            </button>
            {searchActive ? (
              <button
                type="button"
                onClick={clearSearch}
                className="shrink-0 rounded-full p-1 text-neutral-600 hover:bg-neutral-100"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {MOCK_MAP_CHIPS.map((label, i) => (
              <button
                key={`${label}-${i}`}
                type="button"
                className="shrink-0 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-sm"
              >
                {label}
              </button>
            ))}
          </div>
        </form>

        <div className="relative mt-3 min-h-[240px] flex-1 overflow-hidden rounded-[28px] border border-white/50 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
          {isLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 text-sm font-semibold text-neutral-700 backdrop-blur-sm">
              Cargando mapa...
            </div>
          ) : null}

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
        </div>

        {!searchActive ? (
          <div className="pointer-events-auto mt-auto shrink-0 rounded-t-2xl border border-white/60 bg-white/90 px-4 py-2.5 text-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm">
            <p className="text-xs font-semibold text-neutral-700">{publications.length} publicaciones con ubicación</p>
            <p className="mt-0.5 text-[11px] text-neutral-500">Busca animal, especie o zona para filtrar pins reales</p>
          </div>
        ) : (
          <section className="pointer-events-auto relative z-20 mt-auto flex max-h-[min(52vh,480px)] min-h-0 flex-col overflow-hidden rounded-t-3xl border border-neutral-100 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
            <div className="shrink-0 px-4 pb-2 pt-3">
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-neutral-200" />
              <p className="mb-2 text-center text-xs font-semibold text-neutral-600">
                Resultados para «{query.trim()}»
              </p>
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
                <p className="mt-2 text-sm leading-relaxed text-neutral-800">
                  Publicaciones del mundo para esta especie o zona.
                </p>
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
    </div>
  );
}

export default Map;
