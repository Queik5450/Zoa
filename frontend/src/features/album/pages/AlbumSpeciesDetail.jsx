import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Play } from 'lucide-react';
import { supabase } from '../../../shared/lib/supabaseClient';

const FALLBACK_MEDIA = 'https://1000marcas.net/wp-content/uploads/2025/04/Signo-de-interrogacion.png';

function MoreText({ text, label }) {
  const [open, setOpen] = useState(false);
  const needsTrim = text.length > 72;
  return (
    <div className="border-b border-neutral-200 py-3">
      <p className="text-sm font-bold text-black">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-800">
        {open || !needsTrim ? text : `${text.slice(0, 72)}… `}
        {needsTrim ? (
          <button type="button" className="font-bold text-[#80902e] underline" onClick={() => setOpen((o) => !open)}>
            {open ? 'menos' : 'más'}
          </button>
        ) : null}
      </p>
    </div>
  );
}

function AlbumSpeciesDetail() {
  const { speciesId } = useParams();
  const [species, setSpecies] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadSpeciesData() {
      try {
        setIsLoading(true);
        setHasError(false);

        const [{ data: speciesData, error: speciesError }, { data: publicationsData, error: publicationsError }] = await Promise.all([
          supabase
            .from('species')
            .select('id, common_name, scientific_name, category, description')
            .eq('id', speciesId)
            .limit(1)
            .maybeSingle(),
          supabase
            .from('publications')
            .select('id, media_type, media_url, display_name, location_label, description, created_at, species_id, is_public')
            .eq('species_id', speciesId)
            .eq('is_public', true)
            .order('created_at', { ascending: false }),
        ]);

        if (!isActive) return;

        if (speciesError || publicationsError || !speciesData || !Array.isArray(publicationsData) || !publicationsData.length) {
          setHasError(true);
          setSpecies(null);
          setRecords([]);
          return;
        }

        setSpecies(speciesData);
        setRecords(publicationsData);
      } catch {
        if (!isActive) return;
        setHasError(true);
        setSpecies(null);
        setRecords([]);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    if (!speciesId) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    loadSpeciesData();

    return () => {
      isActive = false;
    };
  }, [speciesId]);

  const recordsCount = records.length;
  const speciesTypeLabel = species?.category === 'flora' ? 'Planta' : 'Especie';

  const visibleRecords = useMemo(
    () =>
      records.map((item) => ({
        id: item.id,
        mediaType: item.media_type,
        mediaUrl: item.media_url || FALLBACK_MEDIA,
        authorName: item.display_name || 'usuario',
        locationLabel: item.location_label || 'Ubicación no disponible',
        dateLabel: item.created_at ? new Date(item.created_at).toLocaleDateString('es-VE') : 'Sin fecha',
      })),
    [records]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[#edf7f9] px-4">
        <p className="text-sm text-neutral-600">Cargando...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-[#edf7f9] px-4 text-center">
        <p className="text-sm font-semibold text-red-600">Error: Datos no encontrados</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#edf7f9] pb-[calc(var(--zoa-bottom-height)+16px)]">
      <div className="px-4 pb-1 pt-2">
        <h2 className="text-[35px] font-bold leading-[1] text-black">{species?.common_name}</h2>
        <p className="mt-1 text-[15px] font-semibold text-black">Nombre Científico: {species?.scientific_name}</p>
        <span className="mt-2 inline-flex rounded-[40px] bg-white px-4 py-[2px] text-[11px] font-semibold text-black shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
          {speciesTypeLabel}
        </span>
      </div>

      <div className="px-4">
        <MoreText label="Descripción:" text={species?.description || 'Sin descripción disponible.'} />
        <MoreText label="Habitat:" text={species?.description || 'Sin datos de habitat disponibles.'} />
      </div>

      <div className="h-px bg-[#b8b8b8]" />
      <h3 className="px-4 pb-3 pt-3 text-[15px] font-bold text-black">Registros ({recordsCount})</h3>

      <div className="space-y-4 px-3">
        {visibleRecords.map((record) => (
          <Link
            key={record.id}
            to={record.mediaType === 'audio' ? `/album/audio/${record.id}` : `/album/imagen/${record.id}`}
            className="block overflow-hidden rounded-[20px] shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
            style={{
              backgroundImage: record.mediaType === 'audio' ? `url(${record.mediaUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {record.mediaType === 'audio' ? (
              <div className="bg-black/35 px-4 pb-3 pt-2 backdrop-blur-[1px]">
                <div className="flex items-start justify-between gap-4 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
                  <p className="text-[13px] font-semibold">Grabado por: {record.authorName}</p>
                  <p className="flex items-center gap-1 text-[10px] font-semibold">
                    <MapPin className="h-3 w-3 text-red-400" />
                    {record.locationLabel}
                  </p>
                </div>

                <div className="my-3 flex h-9 items-end justify-center gap-[3px]">
                  {[10, 18, 14, 24, 12, 28, 16, 20, 14, 22, 12, 18].map((h, i) => (
                    <span key={i} className="w-[3px] rounded-full bg-white/90" style={{ height: h }} />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
                  <span>{record.dateLabel}</span>
                  <Play className="h-7 w-7 fill-white" />
                </div>
              </div>
            ) : (
              <div className="relative aspect-[365/267]">
                <img src={record.mediaUrl} alt="Registro visual" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute left-3 top-3 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
                  <p className="text-[15px] font-semibold">Tomada por: {record.authorName}</p>
                  <p className="text-[10px] font-semibold">{record.dateLabel}</p>
                </div>

                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  {record.locationLabel}
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>

      <p className="mt-4 px-4 text-center text-[10px] text-neutral-500">especie: {speciesId}</p>
    </div>
  );
}

export default AlbumSpeciesDetail;
