import React, { useEffect, useState } from 'react';
import StackedDiscoverCarousel from '../../../shared/components/StackedDiscoverCarousel';
import { getPublishedCards } from '../../../shared/lib/scanFlow';
import { MOCK_HOME_CARDS } from '../../../shared/data/zoaMocks';
import { apiJson, mergeCards } from '../../../shared/lib/api';

function Home() {
  const [isScanning] = useState(false);
  const [cards, setCards] = useState(() => mergeCards(getPublishedCards(), MOCK_HOME_CARDS));

  useEffect(() => {
    let isActive = true;

    async function loadFeed() {
      try {
        const feed = await apiJson('/publications/feed?limit=50');
        if (!isActive || !Array.isArray(feed)) return;
        setCards(mergeCards(feed, [...getPublishedCards(), ...MOCK_HOME_CARDS]));
      } catch {
        if (!isActive) return;
        setCards(mergeCards(getPublishedCards(), MOCK_HOME_CARDS));
      }
    }

    loadFeed();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(180deg,#f7fbef_0%,#eef6df_28%,#f8faf7_100%)] px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(193,225,79,0.18),transparent_62%),radial-gradient(circle_at_top_right,rgba(128,144,46,0.12),transparent_58%)]" />

      <section className="relative z-30 mt-1 shrink-0 pb-4 sm:mt-2 sm:pb-5">
        <h2 className="text-center text-[clamp(1.6rem,5vw,2.2rem)] font-black text-[#1f2208]">Descubre</h2>
      </section>

      <section className="relative z-10 mt-0 flex min-h-0 flex-[1.05] items-start justify-center pt-6 sm:pt-8 lg:pt-10">
        <StackedDiscoverCarousel cards={cards} isScanning={isScanning} />
      </section>
    </div>
  );
}

export default Home;
