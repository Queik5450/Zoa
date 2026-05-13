import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DiscoverCarouselSlide from './DiscoverCarouselSlide';

const STACK_OFFSETS = [-2, -1, 0, 1, 2];

function normalizeIndex(index, length) {
  if (!length) return 0;
  return ((index % length) + length) % length;
}

function StackedPreviewCard({ card, onSelect, style }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="absolute overflow-hidden rounded-[28px] border border-white/70 bg-white text-left shadow-[0_18px_40px_rgba(0,0,0,0.16)] transition-[transform,opacity,filter] duration-300 ease-out"
      style={style}
      aria-label={`Ver ${card.name}`}
    >
      <img src={card.image} alt={card.name} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,20,11,0.08)_0%,rgba(17,20,11,0.14)_50%,rgba(17,20,11,0.78)_100%)]" />
      <div className="absolute inset-x-0 top-0 p-3">
        <p className="max-w-[82%] truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]">
          Foto tomada por: {card.authorName?.replace(/^@/, '') || 'USUARIO'}
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="truncate text-[clamp(1.2rem,4vw,1.7rem)] font-black leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
          {card.name}
        </p>
        <p className="mt-1 truncate text-[clamp(0.72rem,2.2vw,0.92rem)] font-medium text-white/86">
          {card.scientificName || card.species}
        </p>
      </div>
    </button>
  );
}

export default function StackedDiscoverCarousel({ cards, isScanning }) {
  const stageRef = useRef(null);
  const gestureRef = useRef({ x: 0, y: 0, dragging: false, pointerId: null, moved: false });
  const suppressClickRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const cardCount = cards.length;
  const hasNavigation = cardCount > 1;

  useEffect(() => {
    if (!cardCount) return;
    setActiveIndex((current) => normalizeIndex(current, cardCount));
  }, [cardCount]);

  const goTo = useCallback(
    (nextIndex) => {
      if (!cardCount) return;
      setActiveIndex(normalizeIndex(nextIndex, cardCount));
    },
    [cardCount],
  );

  const goNext = useCallback(() => {
    if (!cardCount) return;
    setActiveIndex((current) => normalizeIndex(current + 1, cardCount));
  }, [cardCount]);

  const goPrev = useCallback(() => {
    if (!cardCount) return;
    setActiveIndex((current) => normalizeIndex(current - 1, cardCount));
  }, [cardCount]);

  const visibleCards = useMemo(() => {
    if (!cardCount) return [];
    return STACK_OFFSETS.map((offset) => {
      const index = normalizeIndex(activeIndex + offset, cardCount);
      return { card: cards[index], offset, index };
    });
  }, [activeIndex, cardCount, cards]);

  const handlePointerDown = (event) => {
    if (!hasNavigation || event.button !== 0) return;
    suppressClickRef.current = false;
    const gesture = {
      x: event.clientX,
      y: event.clientY,
      dragging: false,
      pointerId: event.pointerId,
      moved: false,
    };
    gestureRef.current = gesture;

    const handleWindowMove = (moveEvent) => {
      if (gestureRef.current.pointerId !== moveEvent.pointerId) return;
      const dx = moveEvent.clientX - gesture.x;
      const dy = moveEvent.clientY - gesture.y;

      if (!gestureRef.current.dragging && Math.hypot(dx, dy) > 8) {
        gestureRef.current.dragging = true;
        gestureRef.current.moved = true;
      }

      if (!gestureRef.current.dragging) return;

      setDragOffset(Math.max(-180, Math.min(180, dx)));
    };

    const finishGesture = (endEvent) => {
      if (gestureRef.current.pointerId !== endEvent.pointerId) return;

      const dx = endEvent.clientX - gesture.x;
      const dy = Math.abs(endEvent.clientY - gesture.y);
      const didDrag = gestureRef.current.dragging;

      suppressClickRef.current = didDrag && dy <= 54 && Math.abs(dx) > 56;
      gestureRef.current = { x: 0, y: 0, dragging: false, pointerId: null, moved: false };
      setDragOffset(0);

      window.removeEventListener('pointermove', handleWindowMove);
      window.removeEventListener('pointerup', finishGesture);
      window.removeEventListener('pointercancel', finishGesture);

      if (!didDrag || dy > 54) return;
      if (dx < -56) goNext();
      else if (dx > 56) goPrev();
    };

    window.addEventListener('pointermove', handleWindowMove);
    window.addEventListener('pointerup', finishGesture);
    window.addEventListener('pointercancel', finishGesture);
  };

  const handleKeyDown = (event) => {
    if (!hasNavigation) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goPrev();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goNext();
        break;
      case 'Home':
        event.preventDefault();
        goTo(0);
        break;
      case 'End':
        event.preventDefault();
        goTo(cardCount - 1);
        break;
      default:
        break;
    }
  };

  if (!cardCount) {
    return (
      <div className="mx-auto flex w-full max-w-[420px] items-center justify-center rounded-[28px] border border-white/70 bg-white px-4 py-12 text-center text-sm font-semibold text-neutral-600 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
        Sin publicaciones disponibles
      </div>
    );
  }

  return (
    <section className="relative z-10 w-full select-none" aria-label="Carrusel destacado">
      <div className="mx-auto w-full max-w-[min(100%,920px)]">
        <div
          ref={stageRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Descubre publicaciones"
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          className="relative outline-none"
          style={{
            width: 'min(100%, 920px)',
            height: 'clamp(560px, 76vh, 800px)',
            perspective: '1800px',
            touchAction: 'pan-y',
            '--stack-shift': 'clamp(48px, 7vw, 110px)',
            '--stack-rise': 'clamp(6px, 1vw, 16px)',
            '--card-width': 'clamp(240px, 31vw, 352px)',
          }}
        >
          <div
            className="absolute inset-0 overflow-visible"
            style={{
              transform: `translateX(${dragOffset}px)`,
              transition: gestureRef.current.dragging ? 'none' : 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {visibleCards.map(({ card, offset, index }) => {
              const depth = Math.abs(offset);
              const translateX = `calc(${offset} * var(--stack-shift))`;
              const translateY = `calc(${depth} * var(--stack-rise))`;
              const rotate = `${offset * 2.2}deg`;
              const opacity = offset === 0 ? 1 : Math.max(0.55, 0.98 - depth * 0.08);
              const zIndex = 100 - depth;
              const layerStyle = {
                width: 'var(--card-width)',
                aspectRatio: '292 / 560',
                transform: `translate(-50%, -50%) translateX(${translateX}) translateY(${translateY}) rotate(${rotate})`,
                opacity,
                zIndex,
                transition: gestureRef.current.dragging ? 'none' : 'transform 320ms ease, opacity 320ms ease',
                filter: offset === 0 ? 'none' : 'saturate(0.98) brightness(0.99)',
                left: '50%',
                top: '52%',
                transformOrigin: 'center center',
              };

              if (offset === 0) {
                return (
                  <div
                    key={card.id}
                    className="absolute overflow-hidden rounded-[28px] shadow-[0_18px_52px_rgba(0,0,0,0.18)] pointer-events-auto"
                    style={layerStyle}
                    onClickCapture={(event) => {
                      if (!suppressClickRef.current) return;
                      event.stopPropagation();
                      suppressClickRef.current = false;
                    }}
                  >
                    <DiscoverCarouselSlide card={card} isScanning={isScanning} />
                  </div>
                );
              }

              return (
                <StackedPreviewCard
                  key={card.id}
                  card={card}
                  onSelect={() => goTo(index)}
                  style={layerStyle}
                />
              );
            })}
          </div>

          {hasNavigation ? (
            <>
              <button
                type="button"
                aria-label="Tarjeta anterior"
                onClick={goPrev}
                className="absolute left-[-10px] top-1/2 z-[70] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8e1bd] bg-white text-[#576129] shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-transform hover:scale-105 active:scale-95 md:flex"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                aria-label="Siguiente tarjeta"
                onClick={goNext}
                className="absolute right-[-10px] top-1/2 z-[70] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8e1bd] bg-white text-[#576129] shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-transform hover:scale-105 active:scale-95 md:flex"
              >
                <ChevronRight size={22} />
              </button>
            </>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Anterior"
            onClick={goPrev}
            disabled={!hasNavigation}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d8e1bd] bg-white text-xl font-black text-[#596427] shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40 md:hidden"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex flex-1 justify-center gap-1.5 overflow-hidden">
            {cards.map((card, idx) => (
              <button
                key={card.id}
                type="button"
                aria-label={`Ir a tarjeta ${idx + 1}`}
                onClick={() => goTo(idx)}
                className={[
                  'transition-all duration-300',
                  idx === activeIndex
                    ? 'h-2.5 w-8 rounded-full bg-[#c1e14f] shadow-[0_0_0_3px_rgba(193,225,79,0.18)]'
                    : 'h-2.5 w-2.5 rounded-full bg-[#ced7bb] hover:bg-[#b8c693]',
                ].join(' ')}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Siguiente"
            onClick={goNext}
            disabled={!hasNavigation}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d8e1bd] bg-white text-xl font-black text-[#596427] shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40 md:hidden"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <p className="mt-2 text-center text-[10px] font-medium text-neutral-500 sm:text-[11px]">
          Arrastra en ambos sentidos, usa las flechas o el teclado para cambiar de tarjeta. Toca o haz clic sobre la carta activa para voltearla.
        </p>
      </div>
    </section>
  );
}