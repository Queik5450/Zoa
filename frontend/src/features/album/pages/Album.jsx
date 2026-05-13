import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';

function Album() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('animales');
  const [q, setQ] = useState('');
  const [speciesRows, setSpeciesRows] = useState([]);
  const [publicationRows, setPublicationRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadAlbumData() {
      try {
        setIsLoading(true);
        setHasError(false);

        const [{ data: speciesData, error: speciesError }, { data: publicationData, error: publicationError }] = await Promise.all([
          supabase
            .from('species')
            .select('id, common_name, scientific_name, category')
            .order('common_name', { ascending: true }),
          supabase
            .from('publications')
            .select('id, species_id, media_url, category, is_public')
            .eq('is_public', true)
            .order('created_at', { ascending: false }),
        ]);

        if (!isActive) return;

        if (speciesError || publicationError) {
          setHasError(true);
          setSpeciesRows([]);
          setPublicationRows([]);
          return;
        }

        if (!Array.isArray(speciesData) || !speciesData.length || !Array.isArray(publicationData) || !publicationData.length) {
          setHasError(true);
          setSpeciesRows([]);
          setPublicationRows([]);
          return;
        }

        setSpeciesRows(speciesData);
        setPublicationRows(publicationData);
      } catch {
        if (!isActive) return;
        setHasError(true);
        setSpeciesRows([]);
        setPublicationRows([]);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadAlbumData();

    return () => {
      isActive = false;
    };
  }, []);

  const list = useMemo(() => {
    const categoryByTab = tab === 'animales' ? 'fauna' : 'flora';
    const publicationMap = publicationRows.reduce((acc, row) => {
      if (!row?.species_id) return acc;
      const prev = acc[row.species_id] || {
        count: 0,
        image: '',
      };
      const nextImage = prev.image || row.media_url || '';
      acc[row.species_id] = {
        count: prev.count + 1,
        image: nextImage,
      };
      return acc;
    }, {});

    return speciesRows
      .filter((row) => row?.id && row?.category === categoryByTab)
      .map((row) => ({
        id: row.id,
        name: row.common_name || 'Especie',
        image: publicationMap[row.id]?.image || '',
        badge: String(publicationMap[row.id]?.count || 0),
        speciesId: row.id,
      }))
      .filter((row) => Number(row.badge) > 0);
  }, [publicationRows, speciesRows, tab]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((item) => item.name.toLowerCase().includes(needle));
  }, [list, q]);

  const countLabel = tab === 'animales' ? `${filtered.length} animales` : `${filtered.length} plantas`;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#edf7f9] text-black">
      <div className="shrink-0 px-2 pt-2">
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setTab('animales')}
            className={`flex-1 rounded-t-[18px] rounded-b-none px-4 py-3 text-center text-[18px] font-semibold transition-colors ${
              tab === 'animales' ? 'bg-[#c1e734] text-black' : 'bg-[#f1f1f1] text-black'
            }`}
          >
            Animales
          </button>
          <button
            type="button"
            onClick={() => setTab('plantas')}
            className={`flex-1 rounded-t-[18px] rounded-b-none px-4 py-3 text-center text-[18px] font-medium transition-colors ${
              tab === 'plantas' ? 'bg-[#c1e734] text-black' : 'bg-[#f1f1f1] text-black'
            }`}
          >
            Plantas
          </button>
        </div>
        <div className="h-px bg-[#b8b8b8]" />
      </div>

      <div className="shrink-0 px-4 pt-2">
        <div className="flex items-center overflow-hidden rounded-[10px] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] ring-1 ring-black/10">
          <button
            type="button"
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center border-r border-[#bfbfbf] bg-white text-[#787878]"
            aria-label="Abrir filtros"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tab === 'animales' ? 'Buscar animal...' : 'Buscar planta...'}
            className="min-w-0 flex-1 bg-transparent px-3 text-[12px] font-semibold text-black outline-none placeholder:text-[#a4a4a4]"
          />
          <div className="flex h-[34px] w-[38px] shrink-0 items-center justify-center pr-1 text-[#7b7b7b]">
            <Search className="h-[18px] w-[18px]" />
          </div>
        </div>
      </div>

      <div className="shrink-0 px-1.5 pt-3">
        <div className="h-px bg-[#b8b8b8]" />
      </div>

      <p className="shrink-0 px-1.5 pt-2 text-[13px] text-black">{countLabel}</p>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-1.5 pb-[calc(var(--zoa-bottom-height)+52px)] pt-4">
        {isLoading ? <p className="px-2 text-sm text-neutral-600">Cargando...</p> : null}
        {!isLoading && hasError ? <p className="px-2 text-sm font-semibold text-red-600">Error: Datos no encontrados</p> : null}
        {!isLoading && !hasError && !filtered.length ? <p className="px-2 text-sm text-neutral-600">Sin resultados</p> : null}
        <div className="grid gap-[9px] [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))] md:[grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/album/especie/${item.speciesId}`, { state: { fromAlbum: true } })}
              className="group relative aspect-[1.04] overflow-hidden rounded-[20px] bg-neutral-300 text-left shadow-[0_4px_4px_rgba(0,0,0,0.25)] outline-none focus-visible:ring-2 focus-visible:ring-[#80902e] focus-visible:ring-offset-2"
            >
              <img
                src={item.image || 'https://1000marcas.net/wp-content/uploads/2025/04/Signo-de-interrogacion.png'}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-1.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
                <span className="max-w-[72%] truncate text-[11px] font-medium leading-none">{item.name}</span>
                <span className="text-[11px] font-medium leading-none">{item.badge}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Album;
