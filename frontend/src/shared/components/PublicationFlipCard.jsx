import React, { useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';

function PublicationFlipCard({ card, isScanning = false, onOpen }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const authorName = card?.authorName || '@usuario';
  const title = card?.name || 'Desconocido';
  const scientificLabel = card?.scientificName || card?.species || 'Sin nombre científico';
  const locationLabel = card?.location || 'Ubicación no disponible';
  const description = card?.description || 'Sin descripción disponible.';
  const image = card?.image || 'https://1000marcas.net/wp-content/uploads/2025/04/Signo-de-interrogacion.png';
  const mediaType = card?.mediaType || 'photo';

  return (
    <main className="relative z-0 mx-auto flex h-full min-h-0 w-full shrink-0 flex-col items-stretch justify-center">
      <div
        className="relative flex h-full min-h-0 w-full flex-col cursor-pointer"
        onClick={() => {
          if (typeof onOpen === 'function') {
            onOpen();
            return;
          }
          setIsFlipped((current) => !current);
        }}
        style={{ perspective: '1000px' }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (typeof onOpen === 'function') {
              onOpen();
            } else {
              setIsFlipped((current) => !current);
            }
          }
        }}
        aria-label="Ver detalles de la publicación"
      >
        <div
          className="relative flex-1 w-full shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div
            className="absolute inset-0 overflow-hidden rounded-[18px] bg-white shadow-[0_10px_28px_rgba(0,0,0,0.14)]"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              backgroundColor: '#ffffff',
              willChange: 'transform',
            }}
          >
            <div className="flex h-full flex-col">
              <div className="relative flex-[5] overflow-hidden bg-neutral-200">
                {mediaType === 'audio' ? (
                  <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(193,225,79,0.24),_transparent_40%),linear-gradient(180deg,_#32342c_0%,_#111111_100%)] px-6 text-center text-white">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Registro de audio</p>
                      <p className="mt-2 text-xl font-black leading-tight">{title}</p>
                      <p className="mt-1 text-sm font-medium text-white/80">{scientificLabel}</p>
                    </div>
                  </div>
                ) : (
                  <img src={image} alt={title} className="h-full w-full object-cover object-center" />
                )}
                <p className="pointer-events-none absolute left-3 top-3 max-w-[85%] truncate text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                  Foto tomada por: {authorName.replace(/^@/, '')}
                </p>
                {isScanning ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/35 backdrop-blur-[1px]">
                    <Loader2 className="mb-2 animate-spin text-white" size={40} />
                    <span className="text-sm font-semibold tracking-wide text-white">Analizando especie...</span>
                  </div>
                ) : null}
              </div>

              <div className="flex h-[34%] min-h-[112px] flex-col justify-center bg-white px-4 pb-3 pt-2">
                <div className="min-w-0">
                  <span className="block truncate text-[22px] font-black leading-tight text-black">{title}</span>
                </div>

                <div className="mt-1 flex w-full items-end justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-1 text-[13px] font-bold text-neutral-500">
                    <MapPin size={14} className="shrink-0 text-neutral-400" />
                    <span className="truncate leading-none">{locationLabel}</span>
                  </div>

                  <div className="text-[13px] font-bold text-neutral-500">
                    <span className="truncate leading-none">{scientificLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 z-20 flex flex-col rounded-[18px] border border-black/5 bg-[#f6f8f4] p-5"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(0)',
              backgroundColor: '#f6f8f4',
              willChange: 'transform',
            }}
          >
            <h2 className="mb-4 pt-1 text-2xl font-extrabold tracking-tight text-black">{title}</h2>
            <div className="mb-4 min-h-0 flex-1 text-left">
              <h3 className="mb-2 text-base font-bold text-black">Descripción</h3>
              <p className="custom-scrollbar max-h-[220px] overflow-y-auto break-words text-[15px] font-medium leading-snug text-black">
                {description}
              </p>
            </div>
            <div className="pb-2 text-left">
              <h3 className="mb-2 text-base font-bold text-black">Ubicación</h3>
              <p className="break-words text-[15px] font-medium leading-snug text-black">{locationLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PublicationFlipCard;