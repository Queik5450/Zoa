import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, MapPin, Pause, Play } from 'lucide-react';
import { apiJson } from '../../../shared/lib/api';
import { clearPendingAudio, dataUrlToFile, getLocalGalleryItems, getMockAuth, getPendingAudio, saveLocalGalleryItem } from '../../../shared/lib/scanFlow';
import backgroundAudio from '../../../shared/assets/backgrounds/backgroundAudio.png';
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
    name: 'Audio grabado',
    species: 'Audio',
    scientificName: '',
    authorName: '@usuario',
    description: 'Sin descripción disponible.',
    location: 'Ubicación no disponible',
    likes: '0',
    comments: '0',
    image: backgroundAudio,
    mediaType: 'audio',
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
    name: source.name || source.common_name || source.species || 'Audio grabado',
    species: source.species || source.common_name || source.name || 'Audio',
    scientificName: source.scientificName || source.scientific_name || '',
    authorName,
    description: source.description || 'Sin descripción disponible.',
    location,
    likes: source.likes || '0',
    comments: source.comments || '0',
    image,
    mediaType: source.mediaType || source.media_type || 'audio',
    publishedAt: source.publishedAt || source.created_at || null,
    locationLabel: location,
    mapImage: source.mapImage || FALLBACK_MAP_IMAGE,
    latitude: toCoordinate(source.latitude),
    longitude: toCoordinate(source.longitude),
  };
}

function formatTime(totalSeconds) {
  const safe = Number.isFinite(totalSeconds) ? totalSeconds : 0;
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
  const seconds = String(Math.floor(safe % 60)).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function PublicacionAudio() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const publicationId = searchParams.get('id');
  const isDraftRoute = searchParams.get('draft') === '1';
  const [publication, setPublication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [publishError, setPublishError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(() => getPendingPublicationDraft());
  const [pendingAudioVersion, setPendingAudioVersion] = useState(0);
  const pendingAudio = useMemo(() => getPendingAudio(), [pendingAudioVersion]);
  const [audioAnalysis, setAudioAnalysis] = useState(null);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const [audioAnalysisError, setAudioAnalysisError] = useState('');

  const audioElRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadPublication() {
      try {
        setIsLoading(true);

        const draft = getPendingPublicationDraft();
        const audioInStorage = getPendingAudio();

        if ((draft && draft.mediaType === 'audio' && (isDraftRoute || !publicationId)) || (audioInStorage && (isDraftRoute || !publicationId))) {
          if (!isActive) return;
          setPendingDraft(draft && draft.mediaType === 'audio' ? draft : null);
          if (draft && draft.mediaType === 'audio') {
            setPublication(normalizePublication(buildPublicationCardFromDraft(draft, getMockAuth()), draft?.id));
          } else {
            setPublication(buildFallbackPublication(publicationId));
          }
          setIsLoading(false);
          return;
        }

        if (publicationId) {
          try {
            const publicationDetail = await apiJson(`/publications/${publicationId}`);
            if (!isActive) return;

            if (publicationDetail) {
              const normalized = normalizePublication(publicationDetail, publicationId);
              if (normalized?.mediaType !== 'audio') {
                navigate(getPublicationDetailPath(normalized.id, normalized.mediaType), { replace: true });
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

        if (nextPublication?.mediaType !== 'audio') {
          navigate(getPublicationDetailPath(nextPublication.id, nextPublication.mediaType), { replace: true });
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
      name: publication.name || publication.species || 'Audio grabado',
      species: publication.species || publication.name || 'Audio',
      scientificName: publication.scientificName || '',
      authorName: publication.authorName || '@usuario',
      description: publication.description || 'Sin descripción disponible.',
      location: publication.location || 'Ubicación no disponible',
      likes: publication.likes || '0',
      comments: publication.comments || '0',
      image: publication.image || backgroundAudio,
      mediaType: 'audio',
      latitude: toCoordinate(publication.latitude),
      longitude: toCoordinate(publication.longitude),
      audioUrl: publication.image || publication.audioUrl || '',
    };
  }, [publication]);

  const shown = useMemo(() => {
    if (pendingAudio) {
      const base = card || {};
      const analysis = pendingDraft?.analysis || audioAnalysis;
      return {
        ...base,
        mediaType: 'audio',
        image: backgroundAudio,
        audioUrl: pendingAudio.dataUrl,
        name: analysis?.common_name || base.name || pendingAudio.name || 'Audio grabado',
        species: analysis?.common_name || base.species || 'Audio',
        scientificName: analysis?.scientific_name || base.scientificName || '',
        description: analysis?.description || base.description || 'Sin descripción disponible.',
        authorName: base.authorName || `@${getMockAuth()?.displayName || 'usuario'}`,
        location: base.location || 'Ubicación no disponible',
      };
    }
    return card;
  }, [audioAnalysis, card, pendingAudio, pendingDraft]);

  const isDraft = Boolean((pendingDraft && pendingDraft.mediaType === 'audio') || (isDraftRoute && pendingAudio));
  const publishedAtLabel = publication?.publishedAt
    ? new Date(publication.publishedAt).toLocaleString('es-VE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'fecha no disponible';

  useEffect(() => {
    const el = audioElRef.current;
    if (!el) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return undefined;
    }

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(el.currentTime || 0);
    const onLoaded = () => setDuration(el.duration || 0);

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onLoaded);

    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onLoaded);
    };
  }, [shown?.audioUrl]);

  useEffect(() => {
    let cancelled = false;

    async function analyzePendingAudio() {
      if (!pendingAudio?.dataUrl) return;

      const draftWithAnalysis = pendingDraft?.mediaType === 'audio' && pendingDraft?.analysis;
      if (draftWithAnalysis) {
        setAudioAnalysis(pendingDraft.analysis);
        setAudioAnalysisError('');
        return;
      }

      setIsAnalyzingAudio(true);
      setAudioAnalysisError('');

      try {
        const audioFile = dataUrlToFile(pendingAudio.dataUrl, pendingAudio.name || 'recording.webm');
        const formData = new FormData();
        formData.append('file', audioFile);

        const result = await apiJson('/scan-audio', {
          method: 'POST',
          body: formData,
        });

        if (cancelled) return;

        setAudioAnalysis(result);

        const nextDraft = {
          id: pendingDraft?.id || `audio-draft-${Date.now()}`,
          dataUrl: pendingAudio.dataUrl,
          fileName: pendingAudio.name || 'recording.webm',
          mediaType: 'audio',
          name: result?.common_name || 'Audio grabado',
          scientificName: result?.scientific_name || '',
          description: result?.description || '',
          category: result?.category || 'unknown',
          analysis: result,
          location: pendingDraft?.location || {},
        };

        savePendingPublicationDraft(nextDraft);
        setPendingDraft(nextDraft);
      } catch (error) {
        if (!cancelled) {
          setAudioAnalysisError(error?.message || 'No se pudo analizar el audio con IA.');
        }
      } finally {
        if (!cancelled) {
          setIsAnalyzingAudio(false);
        }
      }
    }

    analyzePendingAudio();

    return () => {
      cancelled = true;
    };
  }, [pendingAudio, pendingDraft]);

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
              <div
                className="relative flex h-[236px] w-full select-none items-center justify-center overflow-hidden rounded-t-[16px] bg-[#8fa93a] px-6 text-center text-white"
              >
                <div className="absolute inset-0 bg-black/22" />
                <div className="relative z-10 w-full max-w-[720px] px-6">
                  <div className="mb-2 flex items-center justify-between text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Registro de audio</p>
                    <p className="text-xs font-medium text-white/80">{shown.location}</p>
                  </div>
                  <h3 className="text-2xl font-black leading-tight text-white">{shown.name}</h3>
                  <p className="mt-2 text-sm font-medium text-white/80">Grabado por: {shown.authorName?.replace(/^@/, '')}</p>
                  {isAnalyzingAudio ? <p className="mt-1 text-xs font-semibold text-white/90">IA escuchando audio...</p> : null}
                  {audioAnalysisError ? <p className="mt-1 text-xs font-semibold text-red-200">{audioAnalysisError}</p> : null}

                  {shown.audioUrl ? (
                    <div className="mt-4">
                      <div className="relative mx-auto w-full max-w-[720px]">
                        <audio ref={audioElRef} src={shown.audioUrl} className="hidden" />
                        <div className="relative rounded-[18px] overflow-hidden bg-black/30">
                          <div
                            className="h-28 w-full bg-center bg-cover"
                            style={{ backgroundImage: `url(${backgroundAudio})`, filter: 'brightness(0.55) saturate(0.8)' }}
                          />
                          <div className="absolute inset-0 flex items-center px-4">
                            <div className="flex-1 pr-4">
                              <div className="text-sm font-semibold text-white/90">{`Grabado por: ${shown.authorName?.replace(/^@/, '')}`}</div>
                              <div className="mt-2 h-8 w-full rounded-md bg-white/10 flex items-center px-4" aria-hidden>
                                <div className="h-3 w-full rounded bg-white/30" />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const el = audioElRef.current;
                                if (!el) return;
                                if (isPlaying) {
                                  el.pause();
                                } else {
                                  el.play().catch(() => {});
                                }
                              }}
                              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                              className="ml-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg"
                            >
                              {isPlaying ? <Pause size={18} /> : <Play size={20} />}
                            </button>
                          </div>
                          <div className="absolute left-4 bottom-2 text-xs text-white/90">{`${formatTime(currentTime)} / ${formatTime(duration)}`}</div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
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
                    image: backgroundAudio,
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
                  const audioInStorage = getPendingAudio();
                  const draftToPublish = pendingDraft || (audioInStorage
                    ? {
                        id: `audio-draft-${Date.now()}`,
                        dataUrl: audioInStorage.dataUrl,
                        fileName: audioInStorage.name,
                        mediaType: 'audio',
                        name: audioAnalysis?.common_name || audioInStorage.name || 'Audio grabado',
                        scientificName: audioAnalysis?.scientific_name || '',
                        description: audioAnalysis?.description || audioInStorage.description || '',
                        location: audioInStorage.location || null,
                        category: audioAnalysis?.category || 'unknown',
                        analysis: audioAnalysis || undefined,
                      }
                    : null);

                  if (!draftToPublish) return;

                  const sessionAuth = getMockAuth();
                  if (!sessionAuth?.userId) {
                    savePendingPublicationDraft(draftToPublish);
                    navigate('/register', { replace: true });
                    return;
                  }

                  setIsPublishing(true);
                  setPublishError('');

                  try {
                    const published = await publishPendingPublicationDraft(draftToPublish);
                    clearPendingPublicationDraft();
                    clearPendingAudio();
                    setPendingDraft(null);
                    setPendingAudioVersion((value) => value + 1);
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

export default PublicacionAudio;
