import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import { apiJson } from '../../../shared/lib/api';
import { getLocalGalleryItems, getMockAuth, saveLocalGalleryItem } from '../../../shared/lib/scanFlow';
import {
  buildPublicationCardFromDraft,
  clearPendingPublicationDraft,
  getPendingPublicationDraft,
  publishPendingPublicationDraft,
  savePendingPublicationDraft,
} from '../../../shared/lib/publicationDraft';
import { getDraftPublicationPath, getPublicationDetailPath } from '../../../shared/lib/publicationRoutes';

const FALLBACK_MAP_IMAGE =
  'https://images.unsplash.com/photo-1569336415962-a056bdedbe8f?auto=format&fit=crop&w=1200&q=80';

function toCoordinate(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function buildFallbackPublication(id) {
  return {
    id: id || `publication-${Date.now()}`,
    name: 'Nombre Imagen',
    species: 'Especie',
    scientificName: 'Nombre científico no disponible',
    authorName: '@usuario',
    description: 'Sin descripción disponible.',
    location: 'Ubicación no disponible',
    likes: '0',
    comments: '0',
    image: 'https://picsum.photos/seed/zoaFallbackPublication/900/1200',
    mediaType: 'photo',
    publishedAt: null,
    locationLabel: 'Ubicación no disponible',
    mapImage: FALLBACK_MAP_IMAGE,
    latitude: null,
    longitude: null,
  };
}

function normalizePublication(source, fallbackId) {
  if (!source) return null;

  const image = source.image || source.media_url || source.mediaUrl || '';
  const location = source.location || source.location_label || source.locationLabel || 'Ubicación no disponible';
  const authorName = source.authorName || (source.display_name ? `@${source.display_name}` : '@usuario');

  return {
    id: source.id || fallbackId || `publication-${Date.now()}`,
    name: source.name || source.common_name || source.species || 'Desconocido',
    species: source.species || source.common_name || source.name || 'Especie',
    scientificName: source.scientificName || source.scientific_name || '',
    authorName,
    description: source.description || 'Sin descripción disponible.',
    location,
    likes: source.likes || '0',
    comments: source.comments || '0',
    image,
    mediaType: source.mediaType || source.media_type || 'photo',
    publishedAt: source.publishedAt || source.created_at || null,
    locationLabel: location,
    mapImage: source.mapImage || FALLBACK_MAP_IMAGE,
    latitude: toCoordinate(source.latitude),
    longitude: toCoordinate(source.longitude),
  };
}

function Publicacion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const publicationId = searchParams.get('id');
  const isDraftRoute = searchParams.get('draft') === '1';
  const [publication, setPublication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [publishError, setPublishError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(() => getPendingPublicationDraft());

  useEffect(() => {
    let isActive = true;

    async function loadPublication() {
      try {
        setIsLoading(true);

        const draft = getPendingPublicationDraft();
        if (draft && (isDraftRoute || !publicationId)) {
          if (draft.mediaType === 'audio') {
            navigate(getDraftPublicationPath('audio'), { replace: true });
            return;
          }

          if (!isActive) return;
          setPendingDraft(draft);
          setPublication(normalizePublication(buildPublicationCardFromDraft(draft, getMockAuth()), draft?.id));
          setIsLoading(false);
          return;
        }

        if (publicationId) {
          try {
            const publicationDetail = await apiJson(`/publications/${publicationId}`);
            if (!isActive) return;

            if (publicationDetail) {
              const normalized = normalizePublication(publicationDetail, publicationId);
              if (normalized?.mediaType === 'audio') {
                navigate(getPublicationDetailPath(normalized.id, 'audio'), { replace: true });
                return;
              }

              setPendingDraft(null);
              setPublication(normalized);
              setIsLoading(false);
              return;
            }
          } catch {
            // Fall through to feed/local gallery lookup.
          }
        }

        const [feed, localGallery] = await Promise.all([
          apiJson('/publications/feed?limit=50').catch(() => []),
          Promise.resolve(getLocalGalleryItems()),
        ]);
        if (!isActive) return;

        setPendingDraft(null);

        const feedMatch = Array.isArray(feed)
          ? feed.find((item) => item.id === publicationId)
          : null;
        const galleryMatch = Array.isArray(localGallery)
          ? localGallery.find((item) => item.id === publicationId)
          : null;

        const nextPublication =
          normalizePublication(feedMatch, publicationId) ||
          normalizePublication(galleryMatch, publicationId) ||
          buildFallbackPublication(publicationId);

        if (nextPublication?.mediaType === 'audio') {
          navigate(getPublicationDetailPath(nextPublication.id, 'audio'), { replace: true });
          return;
        }

        setPublication(nextPublication);
      } catch {
        if (!isActive) return;
        setPublication(buildFallbackPublication(publicationId));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadPublication();

    return () => {
      isActive = false;
    };
  }, [isDraftRoute, navigate, publicationId]);

  const card = useMemo(() => {
    if (!publication) return null;

    return {
      id: publication.id,
      name: publication.name || publication.species || 'Desconocido',
      species: publication.species || publication.name || 'Especie',
      scientificName: publication.scientificName || '',
      authorName: publication.authorName || '@usuario',
      description: publication.description || 'Sin descripción disponible.',
      location: publication.location || 'Ubicación no disponible',
      likes: publication.likes || '0',
      comments: publication.comments || '0',
      image: publication.image || '',
      mediaType: 'photo',
      latitude: toCoordinate(publication.latitude),
      longitude: toCoordinate(publication.longitude),
    };
  }, [publication]);

  const isDraft = Boolean(pendingDraft || isDraftRoute);
  const shown = card;
  const publishedAtLabel = publication?.publishedAt
    ? new Date(publication.publishedAt).toLocaleString('es-VE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'fecha no disponible';

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(193,225,79,0.18),_transparent_40%),linear-gradient(180deg,_#f6f7f1_0%,_#eef2e8_100%)] px-4 py-4 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-[32px] border border-black/5 bg-white/95 shadow-[0_24px_56px_rgba(0,0,0,0.18)] backdrop-blur-xl mx-2 my-4 sm:mx-4">
        {isLoading && (
          <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-black/5 bg-[#f8faf4] text-center">
            <div>
              <Loader2 className="mx-auto mb-3 animate-spin text-[#c1e14f]" size={36} />
              <p className="text-sm font-semibold text-neutral-700">Cargando publicación...</p>
            </div>
          </div>
        )}

        {shown && (
          <div className="pb-4">
            <div className="px-4 pb-2 pt-1 sm:px-5">
              <h2 className="text-[34px] font-black leading-[1.05] text-black">{shown.name}</h2>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold text-[#7b7b7b]">
                <span>fecha: {publishedAtLabel}</span>
              </div>
            </div>

            <div className="px-0">
              <img src={shown.image} alt={shown.name} className="h-[298px] w-full object-cover" />
            </div>

            <section className="relative bg-white px-4 pb-10 pt-5 shadow-[0_4px_4px_rgba(0,0,0,0.08)] sm:px-5">
              <p className="flex items-center gap-1 text-[15px] font-semibold text-[#707070]">
                <MapPin className="h-4 w-4 text-red-500" />
                Localizado en:
              </p>
              <h3 className="mt-1 text-[25px] font-semibold leading-tight text-black">{shown.location}</h3>
            </section>

            <div className="px-4 pt-6 sm:px-5">
              <div className="overflow-hidden rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
                {Number.isFinite(shown?.latitude) && Number.isFinite(shown?.longitude) ? (
                  <iframe
                    title="Mapa de ubicación"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${shown.longitude - 0.01}%2C${shown.latitude - 0.01}%2C${shown.longitude + 0.01}%2C${shown.latitude + 0.01}&layer=mapnik&marker=${shown.latitude}%2C${shown.longitude}`}
                    className="h-52 w-full border-0"
                    loading="lazy"
                  />
                ) : (
                  <img src={publication?.mapImage || FALLBACK_MAP_IMAGE} alt="Mapa de ubicación" className="h-52 w-full object-cover" />
                )}
              </div>
            </div>

            <div className="px-4 pt-4 sm:px-5">
              <div className="rounded-[24px] border border-black/5 bg-[#f8faf4] p-4">
                <h3 className="text-base font-bold text-black">Descripción</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-700">{shown.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-4 pt-4 sm:px-5">
              <button
                type="button"
                onClick={() => {
                  saveLocalGalleryItem({
                    id: publication?.id || `gallery-${Date.now()}`,
                    name: shown.name,
                    image: shown.image,
                    scientificName: shown.scientificName,
                    location: shown.location,
                    savedAt: Date.now(),
                  });
                }}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                type="button"
                disabled={!isDraft || isPublishing}
                onClick={async () => {
                  if (!pendingDraft) return;

                  const sessionAuth = getMockAuth();
                  if (!sessionAuth?.userId) {
                    savePendingPublicationDraft(pendingDraft);
                    navigate('/register', { replace: true });
                    return;
                  }

                  setIsPublishing(true);
                  setPublishError('');

                  try {
                    const published = await publishPendingPublicationDraft(pendingDraft);
                    clearPendingPublicationDraft();
                    setPendingDraft(null);
                    navigate(getPublicationDetailPath(published?.id || '', published?.media_type), { replace: true });
                  } catch (error) {
                    setPublishError(error?.message || 'No se pudo publicar.');
                  } finally {
                    setIsPublishing(false);
                  }
                }}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#80902e] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(128,144,46,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDraft ? (isPublishing ? 'Publicando...' : 'Publicar') : 'Ya publicada'}
              </button>
            </div>

            {publishError ? <p className="px-4 pt-3 text-sm font-medium text-red-600 sm:px-5">{publishError}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default Publicacion;
