import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { MOCK_ALBUM_ANIMALS, MOCK_ALBUM_PLANTS } from '../data/zoaMocks';

function Album() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('animales');
  const [q, setQ] = useState('');

  const list = tab === 'animales' ? MOCK_ALBUM_ANIMALS : MOCK_ALBUM_PLANTS;
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((item) => item.name.toLowerCase().includes(needle));
  }, [list, q]);

  const countLabel = tab === 'animales' ? `${filtered.length} animales` : `${filtered.length} plantas`;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#eef3f8]">
      <div className="shrink-0 px-3 pb-2 pt-1">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100/80 p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setTab('animales')}
              className={`rounded-xl py-2.5 text-center text-sm font-bold ${
                tab === 'animales' ? 'bg-[#c1e14f] text-black shadow-sm' : 'bg-transparent text-black'
              }`}
            >
              Animales
            </button>
            <button
              type="button"
              onClick={() => setTab('plantas')}
              className={`rounded-xl py-2.5 text-center text-sm font-bold ${
                tab === 'plantas' ? 'bg-[#c1e14f] text-black shadow-sm' : 'bg-neutral-200/80 text-black'
              }`}
            >
              Plantas
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-3 pb-2">
        <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 shadow-md">
          <ChevronDown className="h-5 w-5 shrink-0 text-neutral-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tab === 'animales' ? 'Buscar animal...' : 'Buscar planta...'}
            className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-neutral-400"
          />
          <Search className="h-5 w-5 shrink-0 text-neutral-500" />
        </div>
      </div>

      <p className="shrink-0 px-4 pb-2 text-xs font-semibold text-neutral-600">{countLabel}</p>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-2">
        <div className="grid grid-cols-2 gap-3 pb-24 [grid-template-columns:minmax(0,1fr)_minmax(0,1fr)]">
          {filtered.map((item) => (
            <div key={item.id} className="min-w-0">
              <div className="relative aspect-[3/4] w-full max-w-full overflow-hidden rounded-2xl">
                <button
                  type="button"
                  onClick={() => navigate(`/album/especie/${item.speciesId}`, { state: { fromAlbum: true } })}
                  className="group absolute inset-0 h-full w-full overflow-hidden rounded-2xl bg-neutral-300 text-left shadow-md outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#80902e]"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-transparent" />
                  <span className="absolute left-2 top-2 max-w-[70%] truncate text-xs font-semibold text-white drop-shadow">
                    {item.name}
                  </span>
                  <span className="absolute right-2 top-2 text-xs font-semibold text-white drop-shadow">{item.badge}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Album;
