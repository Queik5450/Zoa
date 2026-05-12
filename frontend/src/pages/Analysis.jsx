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
} from '../utils/scanFlow';

const SCAN_ENDPOINT = 'https://zoa-5p6r.onrender.com/api/scan';

function AnalysisPage() {
  const navigate = useNavigate();
  const [pendingScan, setPendingScan] = useState(null);
  const [analysisState, setAnalysisState] = useState('loading');
  const [analysisError, setAnalysisError] = useState('');
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    const authSession = getMockAuth();
    const storedScan = getPendingScan();

    if (!authSession) {
      navigate('/auth', { replace: true });
      return;
    }

    if (!storedScan) {
      navigate('/', { replace: true });
      return;
    }

    setPendingScan(storedScan);
  }, [navigate]);

  useEffect(() => {
    if (!pendingScan) return;

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

  const handlePublish = () => {
    if (!pendingScan || !analysisData) return;

    const authSession = getMockAuth();
    const displayName = authSession?.displayName || 'usuario';
    const newCard = {
      id: `scan-${analysisData.id || Date.now()}`,
      name: analysisData.common_name || 'Desconocido',
      species: analysisData.common_name || 'Especie',
      authorName: `@${displayName}`,
      avatarLabel: displayName.slice(0, 2).toUpperCase(),
      description: analysisData.description || 'Sin descripción disponible.',
      location: analysisData.scientific_name || 'Análisis completado',
      likes: '1k',
      comments: '100',
      image: pendingScan.dataUrl,
    };

    savePublishedCard(newCard);
    clearPendingScan();
    navigate('/', { replace: true });
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
    <div className="flex min-h-[100dvh] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(19,60,46,0.18),_transparent_42%),linear-gradient(180deg,_#f6f7f1_0%,_#eef2e8_100%)] px-4 py-6">
      <div className="w-full max-w-md rounded-[32px] border border-black/5 bg-white/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.12)] backdrop-blur">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9bb51e]">Análisis IA</p>
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
            <Loader2 className="mx-auto mb-3 animate-spin text-[#9bb51e]" size={36} />
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
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#9bb51e] text-white">
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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9bb51e]">Resultado</p>
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#133c2e] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(19,60,46,0.24)]"
              >
                <Upload size={16} />
                Subir al home
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AnalysisPage;