import React from 'react';
import { Heart, Loader2, MapPin, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function AnimalCard({ activeCard, cards, activeIndex, isFlipped, isScanning, onCardClick }) {
  const authorName = activeCard.authorName || '@nombreUsuario';
  const speciesLabel = activeCard.species || activeCard.name;
  const locationLabel = activeCard.location || 'Parque Nacional Canaima';
  const likesCount = activeCard.likes || '1k';
  const commentsCount = activeCard.comments || '100';
  const avatarLabel = activeCard.avatarLabel || authorName.replace(/^@/, '').slice(0, 2).toUpperCase();

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-3 relative z-0 mb-4 mt-2">
      <div
        className="relative w-full max-w-[325px] aspect-[325/582] cursor-pointer mx-auto"
        onClick={onCardClick}
        style={{ perspective: '1000px' }}
      >
        <div
          className="w-full h-full relative duration-500 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div
            className="absolute inset-0 w-full h-full rounded-[16px] overflow-hidden bg-white shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div className="flex h-full flex-col">
              <div className="relative flex-[1.15] overflow-hidden bg-neutral-200">
                <img
                  src={activeCard.image}
                  alt={activeCard.name}
                  className="h-full w-full object-cover object-center"
                />
              {isScanning ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/35 backdrop-blur-[1px]">
                    <Loader2 className="mb-2 text-white animate-spin" size={48} />
                    <span className="text-base font-semibold tracking-wide text-white">
                      Analizando especie...
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-[0.42] flex-col justify-between bg-white px-4 pb-4 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#d9f06d] ring-1 ring-black/10">
                      <span className="text-[11px] font-extrabold text-black">{avatarLabel}</span>
                    </div>
                    <span className="truncate text-[15px] font-bold text-black">{authorName}</span>
                  </div>
                  <span className="shrink-0 pt-1 text-[15px] font-medium text-neutral-500">
                    {speciesLabel}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <MapPin size={12} className="shrink-0 text-neutral-500" />
                  <span className="truncate">{locationLabel}</span>
                </div>

                <div className="mt-2 flex items-center gap-4 text-[12px] text-black">
                  <div className="flex items-center gap-1.5">
                    <Heart size={16} className="fill-[#cbea30] text-[#cbea30]" />
                    <span>{likesCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare size={16} className="text-neutral-500" />
                    <span>{commentsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 w-full h-full rounded-[16px] bg-[#f3f3f3] p-6 flex flex-col border border-black/5 z-20"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <h2 className="text-3xl font-extrabold text-black mb-6 pt-1 tracking-tight">
              {activeCard.name}
            </h2>

            <div className="mb-6 text-left">
              <h3 className="text-lg font-bold text-black mb-2">Descripción</h3>
              <p className="text-black text-[16px] font-medium leading-tight break-words overflow-y-auto max-h-[250px] custom-scrollbar">
                {activeCard.description}
              </p>
            </div>

            <div className="text-left mt-auto pb-2">
              <h3 className="text-lg font-bold text-black mb-2">Ubicación</h3>
              <p className="text-black text-[16px] font-medium leading-tight break-words">
                {activeCard.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mt-5">
        {cards.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-colors',
              idx === activeIndex ? 'bg-[#133c2e]' : 'border border-gray-400 bg-transparent',
            )}
          />
        ))}
      </div>
    </main>
  );
}

export default AnimalCard;
