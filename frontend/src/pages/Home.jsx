import React, { useCallback, useRef, useState } from 'react';
import DiscoverCarouselSlide from '../components/DiscoverCarouselSlide';
import { getPublishedCards } from '../utils/scanFlow';
import { MOCK_HOME_CARD_EXTRA } from '../data/zoaMocks';

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
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScanning] = useState(false);
  const [cards] = useState(() => {
    const published = getPublishedCards();
    const merged = [...published, ...MOCK_FALLBACK];
    const seen = new Set();
    return merged.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  });

  const updateActiveFromScroll = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;

    const scrollCenter = root.scrollLeft + root.clientWidth / 2;
    const slides = root.querySelectorAll('[data-carousel-slide]');
    let bestIdx = 0;
    let bestDist = Infinity;

    slides.forEach((node, i) => {
      const rect = node.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const left = rect.left - rootRect.left + root.scrollLeft;
      const width = node.offsetWidth;
      const center = left + width / 2;
      const d = Math.abs(center - scrollCenter);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });

    setActiveIndex((prev) => (prev === bestIdx ? prev : bestIdx));
  }, []);

  return (
    <>
      <div className="shrink-0 px-4 pb-2 pt-1">
        <h2 className="text-2xl font-black tracking-tight text-black">Descubre</h2>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateActiveFromScroll}
        className="flex min-h-0 flex-1 flex-row gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            data-carousel-slide
            className="flex w-[min(85vw,280px)] shrink-0 snap-center snap-always flex-col items-center justify-center py-2"
          >
            <DiscoverCarouselSlide card={card} isScanning={isScanning} />
          </div>
        ))}
      </div>

      <div className="flex shrink-0 justify-center gap-1.5 pb-2 pt-1">
        {cards.map((c, idx) => (
          <span
            key={c.id}
            className={
              idx === activeIndex
                ? 'h-2 w-6 rounded-full bg-[#c1e14f] transition-all'
                : 'h-2 w-2 rounded-full bg-neutral-300 transition-all'
            }
            aria-hidden
          />
        ))}
      </div>
    </>
  );
}

export default Home;
