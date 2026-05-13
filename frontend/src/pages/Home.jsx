import React, { useCallback, useEffect, useRef, useState } from 'react';
import DiscoverCarouselSlide from '../components/DiscoverCarouselSlide';
import { getPublishedCards } from '../utils/scanFlow';
import { MOCK_HOME_CARD_EXTRA } from '../data/zoaMocks';
import { apiJson, mergeCards } from '../utils/api';

const MOCK_FALLBACK = [
  {
    id: 'mock-unknown',
    name: 'Desconocido',
    species: 'Especie',
    scientificName: 'Especie',
    authorName: '@nombreUsuario',
    avatarLabel: 'NU',
    description: 'No hay datos disponibles.',
    location: 'Parque Nacional Canaima',
    likes: '1k',
    comments: '100',
    image: 'https://1000marcas.net/wp-content/uploads/2025/04/Signo-de-interrogacion.png',
  },
  {
    id: 'mock-flor',
    ...MOCK_HOME_CARD_EXTRA,
  },
];

function Home() {
  const touchRef = useRef({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScanning] = useState(false);
  const [cards, setCards] = useState(() => mergeCards(getPublishedCards(), MOCK_FALLBACK));

  useEffect(() => {
    let isActive = true;

    async function loadFeed() {
      try {
        const feed = await apiJson('/publications/feed?limit=50');
        if (!isActive || !Array.isArray(feed)) return;
        setCards(mergeCards(feed, [...getPublishedCards(), ...MOCK_FALLBACK]));
      } catch {
        if (!isActive) return;
        setCards(mergeCards(getPublishedCards(), MOCK_FALLBACK));
      }
    }

    loadFeed();

    return () => {
      isActive = false;
    };
  }, []);

  const n = cards.length;

  const goNext = useCallback(() => {
    if (n < 1) return;
    setActiveIndex((i) => (i + 1) % n);
  }, [n]);

  const goPrev = useCallback(() => {
    if (n < 1) return;
    setActiveIndex((i) => (i - 1 + n) % n);
  }, [n]);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = Math.abs(t.clientY - touchRef.current.y);
    if (dy > 45) return;
    if (dx < -48) goNext();
    else if (dx > 48) goPrev();
  };

  return (
    <>
      <div className="flex shrink-0 flex-col gap-3 px-4 pb-2 pt-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-2xl font-black tracking-tight text-black">Descubre</h2>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center px-3 py-2">
        <div
          className="relative w-full max-w-[300px] touch-pan-y"
          style={{ aspectRatio: '292 / 560', maxHeight: 'min(62vh, 560px)' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {cards.map((card, i) => {
            const depth = (i - activeIndex + n) % n;
            const scale = 1 - depth * 0.056;
            const tx = depth * 10;
            const ty = depth * 12;
            const opacity = 1 - Math.min(depth, 6) * 0.14;
            const z = n - depth;
            const isFront = depth === 0;

            return (
              <div
                key={card.id}
                className="absolute left-0 top-0 h-full w-full origin-top transition-all duration-300 ease-out"
                style={{
                  zIndex: z,
                  transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                  opacity,
                  pointerEvents: isFront ? 'auto' : 'none',
                }}
              >
                {isFront ? (
                  <div className="flex h-full min-h-0 w-full items-stretch justify-center">
                    <DiscoverCarouselSlide card={card} isScanning={isScanning} />
                  </div>
                ) : (
                  <div className="mx-auto flex h-full w-full max-w-[280px] flex-col overflow-hidden rounded-[18px] border-2 border-white/70 bg-white shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
                    <div className="relative min-h-0 flex-1 bg-neutral-200">
                      <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                      <p className="absolute bottom-3 left-3 right-3 truncate text-sm font-bold text-white drop-shadow">
                        {card.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex w-full max-w-[300px] items-center justify-between gap-2 px-1">
          <button
            type="button"
            aria-label="Anterior"
            onClick={goPrev}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-700 shadow-sm"
          >
            ‹
          </button>
          <div className="flex flex-1 justify-center gap-1.5">
            {cards.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                aria-label={`Tarjeta ${idx + 1}`}
                onClick={() => setActiveIndex(idx)}
                className={
                  idx === activeIndex
                    ? 'h-2 w-6 rounded-full bg-[#c1e14f] transition-all'
                    : 'h-2 w-2 rounded-full bg-neutral-300 transition-all'
                }
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={goNext}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-700 shadow-sm"
          >
            ›
          </button>
        </div>
        <p className="mt-1 text-center text-[10px] text-neutral-500">Desliza o usa las flechas para cambiar de tarjeta</p>
      </div>
    </>
  );
}

export default Home;
