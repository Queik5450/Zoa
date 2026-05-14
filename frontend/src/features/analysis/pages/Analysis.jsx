import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Upload, X } from 'lucide-react';
import {
  clearPendingScan,
  dataUrlToFile,
  getMockAuth,
  getPendingScan,
  saveLocalGalleryItem,
} from '../../../shared/lib/scanFlow';
import PublicationFlipCard from '../../../shared/components/PublicationFlipCard';
import { buildPublicationCardFromDraft, savePendingPublicationDraft } from '../../../shared/lib/publicationDraft';

const SCAN_ENDPOINT = 'https://zoa-5p6r.onrender.com/api/scan';

function formatCoordinates(latitude, longitude) {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return 'Ubicación no disponible';
  }

  return `Latitud ${Number(latitude).toFixed(6)}, Longitud ${Number(longitude).toFixed(6)}`;
}

function AnalysisPage() {
  const navigate = useNavigate();
  const [pendingScan] = useState(() => getPendingScan());
  const [analysisState, setAnalysisState] = useState('loading');
  const [analysisError, setAnalysisError] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
  });

  const authSession = getMockAuth();
  const displayName = authSession?.displayName || 'usuario';
  const draft = analysisData
    ? {
        id: analysisData.id || pendingScan?.name || 'preview-publication',
          name: analysisData.common_name || 'Desconocido',
          species: analysisData.common_name || 'Especie',
          scientificName: analysisData.scientific_name || '',
          authorName: `@${displayName}`,
          description: analysisData.description || 'Sin descripción disponible.',
          location: locationData,
          likes: '1k',
          comments: '100',
          dataUrl: pendingScan?.dataUrl || '',
          fileName: pendingScan?.name || 'scan.jpg',
          mediaType: 'photo',
          analysis: analysisData,
          locationData,
      }
    : null;
  const previewCard = draft ? buildPublicationCardFromDraft(draft, authSession) : null;

  useEffect(() => {
    const authSession = getMockAuth();

    if (!authSession) {
      navigate('/auth', { replace: true });
      return;
    }

    if (!pendingScan) {
      navigate('/', { replace: true });
      return;
    }
  }, [navigate, pendingScan]);

  useEffect(() => {
    if (!pendingScan) return;

    let isActive = true;

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isActive) return;
          setLocationData({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLocationLoading(false);
        },
        () => {
          if (!isActive) return;
          setLocationData({
            latitude: null,
            longitude: null,
          });
          setIsLocationLoading(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
        },
      );
    } else {
      setIsLocationLoading(false);
    }

    async function analyzeImage() {
      try {
        setAnalysisState('loading');
        setAnalysisError('');

        const imageFile = dataUrlToFile(pendingScan.dataUrl, pendingScan.name || 'scan.jpg');
        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await fetch(SCAN_ENDPOINT, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('No se pudo analizar la imagen.');
        }

        const result = await response.json();

        if (!isActive) return;

        setAnalysisData(result);
        setAnalysisState('ready');
      } catch (error) {
        if (!isActive) return;

        setAnalysisError(error.message || 'Error inesperado al analizar.');
        setAnalysisState('error');
      }
    }

    analyzeImage();

    return () => {
      isActive = false;
    };
  }, [pendingScan]);

  useEffect(() => {
    if (analysisState !== 'ready') {
      return;
    }

    if (locationData.latitude !== null || locationData.longitude !== null) {
      setIsLocationLoading(false);
    }
  }, [analysisState, locationData.latitude, locationData.longitude]);

  const handleGoToPublication = async () => {
    if (!draft) return;

    if (isLocationLoading && typeof navigator !== 'undefined' && navigator.geolocation) {
      const resolvedLocation = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => resolve(locationData),
          {
            enableHighAccuracy: false,
            timeout: 8000,
          },
        );
      });

      setLocationData(resolvedLocation);
      if (resolvedLocation.latitude !== null || resolvedLocation.longitude !== null) {
        setIsLocationLoading(false);
      }

      savePendingPublicationDraft({
        ...draft,
        location: resolvedLocation,
        locationData: resolvedLocation,
      });
      clearPendingScan();
      navigate('/publicacion?draft=1', { replace: true });
      return;
    }

    savePendingPublicationDraft(draft);
    clearPendingScan();
    navigate('/publicacion?draft=1', { replace: true });
  };

  const handleKeepPrivate = () => {
    if (pendingScan) {
      saveLocalGalleryItem({
        id: `gallery-${Date.now()}`,
        name: pendingScan.name,
        image: pendingScan.dataUrl,
        savedAt: Date.now(),
      });
    }

    clearPendingScan();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(193,225,79,0.2),_transparent_42%),linear-gradient(180deg,_#f6f7f1_0%,_#eef2e8_100%)] px-4 py-6">
      <div className="w-full max-w-md mx-auto rounded-[32px] border border-black/5 bg-white/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.12)] backdrop-blur">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#80902e]">Análisis IA</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-black">Revisando la imagen</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 relative flex items-center justify-center">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
            <img
              src={pendingScan?.dataUrl}
              alt=""
              className="h-full w-full object-cover opacity-20 blur-xl"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="relative w-full max-w-[360px] overflow-hidden rounded-[26px] bg-neutral-100 shadow-[0_12px_30px_rgba(0,0,0,0.08)] mx-auto">
            <img
              src={pendingScan?.dataUrl}
              alt={pendingScan?.name || 'Imagen seleccionada'}
              className="h-64 w-full object-cover"
            />
          </div>
        </div>

        {analysisState === 'loading' ? (
          <div className="rounded-[24px] border border-black/5 bg-[#f8faf4] p-5 text-center">
            <Loader2 className="mx-auto mb-3 animate-spin text-[#c1e14f]" size={36} />
            <h2 className="text-lg font-bold text-black">Analizando especie...</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Estamos recolectando la información de la foto para prepararla antes de publicar.
            </p>
          </div>
        ) : null}

        {analysisState === 'error' ? (
          <div className="rounded-[24px] border border-red-200 bg-red-50 p-5">
            <h2 className="text-lg font-bold text-red-700">No pudimos analizar la imagen</h2>
            <p className="mt-2 text-sm leading-6 text-red-600">{analysisError}</p>
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-4 text-sm font-semibold text-white"
            >
              Volver al inicio
            </button>
          </div>
        ) : null}

        {analysisState === 'ready' && analysisData ? (
          <div className="mx-auto w-full max-w-[28rem] space-y-4 rounded-[24px] border border-black/5 bg-[#f8faf4] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#c1e14f] text-white">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-black">Análisis listo</h2>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  La IA terminó de recolectar la información. Revisa la tarjeta antes de publicar.
                </p>
              </div>
            </div>

            <div className="h-[520px] w-full">
              {previewCard ? <PublicationFlipCard card={previewCard} /> : null}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleKeepPrivate}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black"
              >
                No subir
              </button>
              <button
                type="button"
                onClick={handleGoToPublication}
                disabled={isLocationLoading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#80902e] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(128,144,46,0.28)]"
              >
                <Upload size={16} />
                {isLocationLoading ? 'Obteniendo ubicación...' : 'Ir a publicación'}
              </button>
            </div>

            <div className="rounded-[24px] border border-black/5 bg-white p-4">
              <h3 className="text-base font-bold text-black">Ubicación</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{formatCoordinates(locationData.latitude, locationData.longitude)}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AnalysisPage;