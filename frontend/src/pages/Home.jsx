import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, GalleryHorizontalEnd, Upload, X } from 'lucide-react';
import Header from '../components/Header';
import AnimalCard from '../components/AnimalCard';
import BottomNav from '../components/BottomNav';
import { fileToDataUrl, getPublishedCards, saveLocalGalleryItem, savePendingScan } from '../utils/scanFlow';

const MOCK_CARD = [
  {
    id: 1,
    name: 'Desconocido',
    species: 'Especie',
    authorName: '@nombreUsuario',
    avatarLabel: 'NU',
    description: 'No hay datos disponibles.',
    location: 'Parque Nacional Canaima',
    likes: '1k',
    comments: '100',
    image: 'https://1000marcas.net/wp-content/uploads/2025/04/Signo-de-interrogacion.png'
  },
];

function Home() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cards, setCards] = useState(() => [...getPublishedCards(), ...MOCK_CARD]);
  const [capturePreview, setCapturePreview] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const activeCard = cards[activeIndex];

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);

    setCapturePreview({
      name: file.name,
      type: file.type,
      dataUrl,
    });
    setIsFlipped(false);
    event.target.value = '';
  };

  const handleUploadImage = () => {
    if (!capturePreview) return;

    savePendingScan(capturePreview);
    setCapturePreview(null);
    setStatusMessage('');
    navigate('/auth');
  };

  const handleSaveToGallery = () => {
    if (!capturePreview) return;

    saveLocalGalleryItem({
      id: `gallery-${Date.now()}`,
      name: capturePreview.name,
      image: capturePreview.dataUrl,
      savedAt: Date.now(),
    });

    setStatusMessage('Imagen guardada en tu galería local.');
    setCapturePreview(null);
  };

  const closePreview = () => {
    setCapturePreview(null);
  };

  return (
    <div className="relative h-[100dvh] w-full max-w-md mx-auto bg-[#f9f9f9] overflow-hidden flex flex-col font-sans">
      <Header />
      {statusMessage ? (
        <div className="mx-4 mt-3 rounded-2xl border border-[#9bb51e]/20 bg-[#f8faf4] px-4 py-3 text-sm font-medium text-[#133c2e] shadow-sm">
          {statusMessage}
        </div>
      ) : null}
      <AnimalCard
        activeCard={activeCard}
        cards={cards}
        activeIndex={activeIndex}
        isFlipped={isFlipped}
        isScanning={isScanning}
        onCardClick={handleCardClick}
      />
      <BottomNav isScanning={isScanning} onFileChange={handleFileChange} />

      {capturePreview ? (
        <div className="absolute inset-0 z-40 flex items-end bg-black/45 px-4 pb-6 pt-16 backdrop-blur-[2px]">
          <section className="w-full overflow-hidden rounded-[28px] bg-white shadow-[0_-18px_50px_rgba(0,0,0,0.24)]">
            <div className="flex items-center justify-between px-4 pb-3 pt-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9bb51e]">Foto tomada</p>
                <h2 className="mt-1 text-lg font-black text-black">¿Qué quieres hacer?</h2>
              </div>
              <button
                type="button"
                aria-label="Cerrar vista previa"
                onClick={closePreview}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pb-4">
              <div className="mb-4 overflow-hidden rounded-[24px] bg-neutral-100">
                <img src={capturePreview.dataUrl} alt={capturePreview.name} className="h-64 w-full object-cover" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSaveToGallery}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black"
                >
                  <GalleryHorizontalEnd size={16} />
                  Guardar en galería
                </button>
                <button
                  type="button"
                  onClick={handleUploadImage}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#133c2e] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(19,60,46,0.24)]"
                >
                  <Upload size={16} />
                  Subir imagen
                </button>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#f8faf4] px-4 py-3 text-sm text-neutral-700">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#9bb51e]" />
                <p>
                  Si eliges subirla, primero pasas por login/register y luego a la pantalla de análisis antes de publicarla.
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default Home;