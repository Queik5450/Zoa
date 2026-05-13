import React, { useMemo, useState } from 'react';
import { ChevronDown, MapPin, Search, X } from 'lucide-react';
import { getPublishedCards } from '../utils/scanFlow';
import { MOCK_MAP_CHIPS } from '../data/zoaMocks';

const SAT_BG = 'https://picsum.photos/seed/zoaMap/1200/900';

/** Posiciones % de pins de publicaciones cercanas (sin búsqueda). */
const NEARBY_PIN_OFFSETS = [
  { left: 14, top: 22 },
  { left: 42, top: 38 },
  { left: 58, top: 18 },
  { left: 72, top: 52 },
  { left: 28, top: 58 },
];

function Map() {
  const [query, setQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);

  const published = useMemo(() => getPublishedCards(), []);

  const nearbyPins = useMemo(
    () =>
      NEARBY_PIN_OFFSETS.map((p, i) => ({
        ...p,
        id: `near-${i}`,
        label: published[i]?.name,
      })),
    [published],
  );

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
      <div className="absolute inset-0 bg-neutral-300 bg-cover bg-center" style={{ backgroundImage: `url(${SAT_BG})` }} />
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

        <div className="relative mt-3 min-h-[140px] flex-1">
          {(searchActive ? NEARBY_PIN_OFFSETS.slice(0, 3).map((p, i) => ({ ...p, id: `s-${i}` })) : nearbyPins).map((pin) => (
            <div
              key={pin.id}
              className="absolute drop-shadow-md"
              style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
              title={pin.label || 'Publicación cercana'}
            >
              <MapPin className="h-9 w-9 text-[#c1e14f]" fill="#c1e14f" strokeWidth={1} />
            </div>
          ))}
        </div>

        {!searchActive ? (
          <div className="pointer-events-auto mt-auto shrink-0 rounded-t-2xl border border-white/60 bg-white/90 px-4 py-2.5 text-center shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm">
            <p className="text-xs font-semibold text-neutral-700">Publicaciones cercanas en el mapa</p>
            <p className="mt-0.5 text-[11px] text-neutral-500">Busca para ver detalle de animal, zona y especies</p>
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
                  <span className="block text-lg font-black text-[#c1e14f]">5</span>
                  Audios
                </div>
                <div className="rounded-lg bg-[#f4f7e8] px-1 py-2">
                  <span className="block text-lg font-black text-[#c1e14f]">10</span>
                  Fotos
                </div>
                <div className="rounded-lg bg-[#f4f7e8] px-1 py-2">
                  <span className="block text-lg font-black text-[#c1e14f]">5</span>
                  Colaboradores
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              <article className="rounded-2xl border border-neutral-200 bg-[#fafbf7] p-3 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#80902e]">Animal o planta</h3>
                <div className="mt-2 flex gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200">
                    <img
                      src="https://picsum.photos/seed/zoaMonkey/160/160"
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-800">
                    Información del animal o planta buscado (si aplica): nombre común, datos básicos y enlaces a
                    registros.
                  </p>
                </div>
              </article>

              <article className="mt-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#80902e]">La zona</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-800">
                  Descripción geográfica, clima, tipo de ecosistema y puntos de interés cercanos a la búsqueda.
                </p>
              </article>

              <article className="mt-3 rounded-2xl border border-neutral-200 bg-[#f8faf4] p-3 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#80902e]">Animales en la zona</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-800">
                  Listado o resumen de especies frecuentes en esta área según avistamientos de la comunidad.
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-neutral-700">
                  <li>Mono capuchino</li>
                  <li>Tucán</li>
                  <li>Iguana verde</li>
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
