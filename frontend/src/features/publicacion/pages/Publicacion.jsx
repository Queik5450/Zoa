import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, RotateCcw } from 'lucide-react';
import PublicationFlipCard from '../../../shared/components/PublicationFlipCard';
import { apiJson } from '../../../shared/lib/api';
import { getMockAuth, saveLocalGalleryItem } from '../../../shared/lib/scanFlow';
import {
  buildPublicationCardFromDraft,
  clearPendingPublicationDraft,
  getPendingPublicationDraft,
  publishPendingPublicationDraft,
  savePendingPublicationDraft,
} from '../../../shared/lib/publicationDraft';

function Publicacion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const publicationId = searchParams.get('id');
  const isDraftRoute = searchParams.get('draft') === '1';
  const [publication, setPublication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(() => getPendingPublicationDraft());

  useEffect(() => {
    let isActive = true;

    async function loadPublication() {
      try {
        setIsLoading(true);
        setHasError(false);

        const draft = getPendingPublicationDraft();
        if (draft && (isDraftRoute || !publicationId)) {
          if (!isActive) return;
          setPendingDraft(draft);
          setPublication(buildPublicationCardFromDraft(draft, getMockAuth()));
          setIsLoading(false);
          return;
        }

        const feed = await apiJson('/publications/feed?limit=50');
        if (!isActive) return;

        if (!Array.isArray(feed) || !feed.length) {
          setPublication(null);
          setHasError(true);
          return;
        }

        const nextPublication = publicationId ? feed.find((item) => item.id === publicationId) : feed[0];

        if (!nextPublication) {
          setPublication(null);
          setHasError(true);
          return;
        }

        setPendingDraft(null);
        setPublication(nextPublication);
      } catch {
        if (!isActive) return;
        setPublication(null);
        setHasError(true);
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
  }, [isDraftRoute, publicationId]);

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
      mediaType: publication.mediaType || 'photo',
    };
  }, [publication]);

  const isDraft = Boolean(pendingDraft || isDraftRoute);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(193,225,79,0.2),_transparent_42%),linear-gradient(180deg,_#f6f7f1_0%,_#eef2e8_100%)] px-4 py-6">
      <div className="pointer-events-none absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
      <div className="relative w-full max-w-[420px] rounded-[32px] border border-black/5 bg-white/95 p-5 shadow-[0_24px_56px_rgba(0,0,0,0.18)] backdrop-blur-xl mx-4 my-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#80902e]">Publicación real</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-black">Vista de publicación</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700"
            aria-label="Cerrar publicación"
          >
            <span className="text-lg font-bold leading-none">×</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-black/5 bg-[#f8faf4] text-center">
            <div>
              <Loader2 className="mx-auto mb-3 animate-spin text-[#c1e14f]" size={36} />
              <p className="text-sm font-semibold text-neutral-700">Cargando publicación...</p>
            </div>
          </div>
        ) : null}

        {!isLoading && hasError ? (
          <div className="rounded-[28px] border border-red-200 bg-red-50 p-5 text-center">
            <p className="text-sm font-semibold text-red-700">Error: Datos no encontrados</p>
            <button
              type="button"
              onClick={() => navigate('/album', { replace: true })}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <RotateCcw size={16} />
              Ir al álbum
            </button>
          </div>
        ) : null}

        {!isLoading && !hasError && card ? (
          <div className="space-y-4">
            <div className="h-[520px] w-full">
              <PublicationFlipCard card={card} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  saveLocalGalleryItem({
                    id: publication?.id || `gallery-${Date.now()}`,
                    name: card.name,
                    image: card.image,
                    scientificName: card.scientificName,
                    location: card.location,
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
                    navigate(`/publicacion?id=${published?.id || ''}`, { replace: true });
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

            {publishError ? <p className="text-sm font-medium text-red-600">{publishError}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Publicacion;
