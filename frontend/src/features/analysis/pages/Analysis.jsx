import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Upload, X } from 'lucide-react';
import {
  clearPendingScan,
  dataUrlToFile,
  getMockAuth,
  getPendingScan,
  saveLocalGalleryItem,
  savePublishedCard,
} from '../../../shared/lib/scanFlow';
import { apiUrl } from '../../../shared/lib/api';
import { supabase } from '../../../shared/lib/supabaseClient';

const SCAN_ENDPOINT = 'https://zoa-5p6r.onrender.com/api/scan';

function AnalysisPage() {
  const navigate = useNavigate();
  const [pendingScan] = useState(() => getPendingScan());
  const [analysisState, setAnalysisState] = useState('loading');
  const [analysisError, setAnalysisError] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [locationData, setLocationData] = useState({
    label: 'Ubicación no disponible',
    latitude: null,
    longitude: null,
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

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

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            label: 'Ubicación actual',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          setLocationData({
            label: 'Ubicación no disponible',
            latitude: null,
            longitude: null,
          });
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
        },
      );
    }

    let isActive = true;

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

  const handlePublish = async () => {
    if (!pendingScan || !analysisData) return;

    setIsPublishing(true);
    setPublishError('');

    const authSession = getMockAuth();
    const displayName = authSession?.displayName || 'usuario';

    try {
      const imageFile = dataUrlToFile(pendingScan.dataUrl, pendingScan.name || 'scan.jpg');
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('user_id', authSession?.userId || authSession?.id || authSession?.email || 'anonymous');
      formData.append('user_email', authSession?.email || '');
      formData.append('display_name', displayName);
      formData.append('common_name', analysisData.common_name || 'Desconocido');
      formData.append('scientific_name', analysisData.scientific_name || '');
      formData.append('description', analysisData.description || 'Sin descripción disponible.');
      formData.append('confidence_score', String(analysisData.confidence_score ?? 0));
      formData.append('category', analysisData.category || 'unknown');
      formData.append('media_type', 'photo');
      formData.append('location_label', locationData.label || 'Ubicación actual');
      formData.append('latitude', locationData.latitude ?? '');
      formData.append('longitude', locationData.longitude ?? '');
      formData.append('is_public', 'true');

      const sessionResult = await supabase.auth.getSession();
      const accessToken = sessionResult.data?.session?.access_token;

      const response = await fetch(apiUrl('/publications'), {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('No se pudo publicar la observación.');
      }

      await response.json();
      clearPendingScan();
      navigate('/', { replace: true });
    } catch (error) {
      setPublishError(error?.message || 'No se pudo publicar.');
      savePublishedCard({
        id: `scan-${analysisData.id || Date.now()}`,
        name: analysisData.common_name || 'Desconocido',
        species: analysisData.common_name || 'Especie',
        scientificName: analysisData.scientific_name || '',
        authorName: `@${displayName}`,
        avatarLabel: displayName.slice(0, 2).toUpperCase(),
        description: analysisData.description || 'Sin descripción disponible.',
        location: locationData.label || analysisData.scientific_name || 'Análisis completado',
        likes: '1k',
        comments: '100',
        image: pendingScan.dataUrl,
      });
      clearPendingScan();
      navigate('/', { replace: true });
    } finally {
      setIsPublishing(false);
    }
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
      <div className="w-full max-w-md rounded-[32px] border border-black/5 bg-white/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.12)] backdrop-blur">
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

        <div className="mb-5 overflow-hidden rounded-[26px] bg-neutral-100">
          <img
            src={pendingScan?.dataUrl}
            alt={pendingScan?.name || 'Imagen seleccionada'}
            className="h-64 w-full object-cover"
          />
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
          <div className="space-y-4 rounded-[24px] border border-black/5 bg-[#f8faf4] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#c1e14f] text-white">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-black">Análisis listo</h2>
                <p className="mt-1 text-sm leading-6 text-neutral-600">
                  La IA terminó de recolectar la información. Revisa el resultado y decide si quieres subirlo al home.
                </p>
              </div>
            </div>

            <div className="rounded-[22px] bg-white p-4 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#80902e]">Resultado</p>
              <h3 className="mt-2 text-xl font-black text-black">{analysisData.common_name || 'Desconocido'}</h3>
              <p className="mt-1 text-sm font-medium text-neutral-500">{analysisData.scientific_name || 'Sin nombre científico'}</p>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{analysisData.description}</p>
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
                onClick={handlePublish}
                disabled={isPublishing}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#80902e] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(128,144,46,0.28)]"
              >
                <Upload size={16} />
                {isPublishing ? 'Publicando...' : 'Subir al home'}
              </button>
            </div>

            {publishError ? <p className="text-sm font-medium text-red-600">{publishError}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AnalysisPage;