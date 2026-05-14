import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabaseClient';
import PublicationFlipCard from '../../../shared/components/PublicationFlipCard';
import SpeechButton from '../../../shared/components/SpeechButton';
import { getPublicationDetailPath } from '../../../shared/lib/publicationRoutes';

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
  const navigate = useNavigate();

  const visibleRecords = useMemo(
    () =>
      records.map((item) => ({
        id: item.id,
        mediaType: item.media_type,
        mediaUrl: item.media_url || FALLBACK_MEDIA,
        name: species?.common_name || 'Especie',
        species: species?.common_name || 'Especie',
        scientificName: species?.scientific_name || '',
        authorName: item.display_name ? `@${item.display_name}` : '@usuario',
        locationLabel: item.location_label || 'Ubicación no disponible',
        location: item.location_label || 'Ubicación no disponible',
        description: item.description || species?.description || 'Sin descripción disponible.',
        image: item.media_type === 'audio' ? FALLBACK_MEDIA : item.media_url || FALLBACK_MEDIA,
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
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[35px] font-bold leading-[1] text-black">{species?.common_name}</h2>
          <SpeechButton
            text={`${species?.common_name || 'Especie'} . Nombre científico ${species?.scientific_name || ''}. ${species?.description || 'Sin descripción disponible.'}`}
            label="Escuchar"
            stopLabel="Detener"
            lang="es-VE"
            className="px-4 py-3 text-sm"
          />
        </div>
        <p className="mt-1 text-[15px] font-semibold text-black">Nombre Científico: {species?.scientific_name}</p>
      </div>

      <div className="px-4">
        <MoreText label="Descripción:" text={species?.description || 'Sin descripción disponible.'} />
      </div>

      <div className="h-px bg-[#b8b8b8]" />
      <h3 className="px-4 pb-3 pt-3 text-[15px] font-bold text-black">Registros ({recordsCount})</h3>

      <div className="space-y-5 px-3">
        {visibleRecords.map((record) => (
          <div key={record.id} className="h-[520px] w-full">
            <PublicationFlipCard card={record} onOpen={() => navigate(getPublicationDetailPath(record.id, record.mediaType))} />
          </div>
        ))}
      </div>

      
    </div>
  );
}

export default AlbumSpeciesDetail;
