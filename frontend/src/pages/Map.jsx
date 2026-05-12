import React, { useState } from 'react';
import { ChevronDown, MapPin, Search } from 'lucide-react';
import { MOCK_MAP_CHIPS } from '../data/zoaMocks';

const SAT_BG =
  'https://images.unsplash.com/photo-1569336415962-a056bdedbe8f?auto=format&fit=crop&w=1200&q=80';

function Map() {
  const [query, setQuery] = useState('');

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${SAT_BG})` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex flex-1 flex-col px-3 pt-2">
        <div className="pointer-events-auto flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-2xl border border-neutral-200/90 bg-white px-3 py-2.5 shadow-md">
            <ChevronDown className="h-5 w-5 shrink-0 text-neutral-500" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Buscar animal, especie, zona..."
              className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-neutral-400"
            />
            <Search className="h-5 w-5 shrink-0 text-neutral-500" aria-hidden />
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
        </div>

        <div className="pointer-events-none relative mt-6 flex flex-1">
          <div className="absolute left-[12%] top-[18%] flex flex-col items-center drop-shadow-md">
            <MapPin className="h-9 w-9 text-[#c1e14f]" fill="#c1e14f" strokeWidth={1} />
          </div>
          <div className="absolute left-[55%] top-[42%] flex flex-col items-center drop-shadow-md">
            <MapPin className="h-9 w-9 text-[#c1e14f]" fill="#c1e14f" strokeWidth={1} />
          </div>
          <div className="absolute left-[38%] top-[58%] flex flex-col items-center drop-shadow-md">
            <MapPin className="h-9 w-9 text-[#c1e14f]" fill="#c1e14f" strokeWidth={1} />
          </div>
        </div>

        <section className="pointer-events-auto relative z-20 mt-auto max-h-[42%] overflow-y-auto rounded-t-3xl bg-white px-4 pb-4 pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200" />
          <div className="grid grid-cols-3 gap-2 border-b border-neutral-100 pb-3 text-center text-xs font-semibold text-neutral-700">
            <div>
              <span className="text-lg font-black text-[#c1e14f]">5</span> Audios
            </div>
            <div>
              <span className="text-lg font-black text-[#c1e14f]">10</span> Fotos
            </div>
            <div>
              <span className="text-lg font-black text-[#c1e14f]">5</span> Colaboradores
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
              <img
                src="https://images.unsplash.com/photo-1583212292454-1fe6229606b2?auto=format&fit=crop&w=200&q=80"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-sm leading-snug text-neutral-600">
              Sección de info Animal O PLANTA buscado (Si aplica)
            </p>
          </div>
          <p className="mt-4 text-sm text-neutral-600">Sección de info de la zona</p>
          <p className="mt-2 text-sm text-neutral-600">Sección de animales que se encuentran en la zona</p>
        </section>
      </div>
    </div>
  );
}

export default Map;
