import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DiscoverCarouselSlide from '../../../shared/components/DiscoverCarouselSlide';
import { getPublishedCards } from '../../../shared/lib/scanFlow';
import { MOCK_HOME_CARD_EXTRA } from '../../../shared/data/zoaMocks';
import { apiJson, mergeCards } from '../../../shared/lib/api';

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

  const featuredCard = cards[activeIndex] || cards[0] || null;
  const prevCard = useMemo(() => {
    if (n < 2) return null;
    return cards[(activeIndex - 1 + n) % n];
  }, [activeIndex, cards, n]);
  const nextCard = useMemo(() => {
    if (n < 2) return null;
    return cards[(activeIndex + 1) % n];
  }, [activeIndex, cards, n]);

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
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(180deg,#f7fbef_0%,#eef6df_28%,#f8faf7_100%)] px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(193,225,79,0.18),transparent_62%),radial-gradient(circle_at_top_right,rgba(128,144,46,0.12),transparent_58%)]" />

      <section className="relative z-10 shrink-0">
        <h2 className="text-center text-[clamp(1.6rem,5vw,2.2rem)] font-black text-[#1f2208]">Descubre</h2>
      </section>

      <section
        className="relative z-10 mt-3 flex min-h-0 flex-[1.05] items-center justify-center sm:mt-4"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative flex w-full max-w-[min(100%,330px)] items-end justify-center" style={{ aspectRatio: '292 / 560' }}>
          {prevCard ? (
            <div
              className="absolute left-1/2 top-0 h-full w-full overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_20px_44px_rgba(0,0,0,0.18)]"
              style={{
                transform: 'translateX(calc(-50% - 56px)) translateY(18px)',
                opacity: 0.92,
                zIndex: 10,
              }}
            >
              <img src={prevCard.image} alt={prevCard.name} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
                <span className="max-w-[72%] truncate text-[11px] font-medium leading-none">{prevCard.name}</span>
                <span className="text-[11px] font-medium leading-none">{prevCard.badge}</span>
              </div>
            </div>
          ) : null}

          {nextCard ? (
            <div
              className="absolute left-1/2 top-0 h-full w-full overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_20px_44px_rgba(0,0,0,0.18)]"
              style={{
                transform: 'translateX(calc(-50% + 56px)) translateY(18px)',
                opacity: 0.92,
                zIndex: 10,
              }}
            >
              <img src={nextCard.image} alt={nextCard.name} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
                <span className="max-w-[72%] truncate text-[11px] font-medium leading-none">{nextCard.name}</span>
                <span className="text-[11px] font-medium leading-none">{nextCard.badge}</span>
              </div>
            </div>
          ) : null}

          <div className="relative z-20 flex h-full w-full items-end justify-center">
            {featuredCard ? (
              <DiscoverCarouselSlide card={featuredCard} isScanning={isScanning} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-[24px] border border-white/70 bg-white text-sm font-semibold text-neutral-600 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
                Sin publicaciones disponibles
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="relative z-10 mt-3 flex shrink-0 items-center justify-between gap-2 sm:mt-4">
        <button
          type="button"
          aria-label="Anterior"
          onClick={goPrev}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d8e1bd] bg-white text-xl font-black text-[#596427] shadow-sm sm:h-11 sm:w-11"
        >
          ‹
        </button>
        <div className="flex flex-1 justify-center gap-1.5">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              type="button"
              aria-label={`Tarjeta ${idx + 1}`}
              onClick={() => setActiveIndex(idx)}
              className={
                idx === activeIndex
                  ? 'h-2 w-7 rounded-full bg-[#c1e14f] shadow-[0_0_0_3px_rgba(193,225,79,0.18)] transition-all'
                  : 'h-2 w-2 rounded-full bg-[#ced7bb] transition-all'
              }
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Siguiente"
          onClick={goNext}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d8e1bd] bg-white text-xl font-black text-[#596427] shadow-sm sm:h-11 sm:w-11"
        >
          ›
        </button>
      </div>

      <p className="relative z-10 mt-2 text-center text-[10px] font-medium text-neutral-500 sm:text-[11px]">Desliza o usa flechas para cambiar tarjeta</p>
    </div>
  );
}

export default Home;
