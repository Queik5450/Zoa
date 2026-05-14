import React, { useMemo, useState } from 'react';
import { Heart, Loader2, MapPin, MessageSquare, Send, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function formatCount(value) {
  if (typeof value === 'number') return value.toString();
  if (typeof value !== 'string') return '0';
  const normalized = value.trim().toLowerCase();
  const parsed = Number(normalized.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(parsed)) return normalized || '0';
  if (normalized.includes('k')) return `${parsed % 1 === 0 ? parsed : parsed.toFixed(1)}k`;
  if (normalized.includes('m')) return `${parsed % 1 === 0 ? parsed : parsed.toFixed(1)}m`;
  return String(parsed);
}

/** Carrusel: una tarjeta con tap para voltear (nombre, descripción, ubicación). */
function DiscoverCarouselSlide({ card, isScanning }) {
  const authorName = card.authorName || '@nombreUsuario';
  const scientificLabel = card.scientificName || card.species || card.name;
  const locationLabel = card.location || 'Parque Nacional Canaima';
  const likesCount = card.likes || '1k';
  const commentsCount = card.comments || '100';

  const baseLikes = useMemo(() => formatCount(likesCount), [likesCount]);
  const baseComments = useMemo(() => formatCount(commentsCount), [commentsCount]);

  const [isFlipped, setIsFlipped] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentItems, setCommentItems] = useState([
    { id: 1, author: 'wild.focus', text: 'La foto quedó muy limpia, buen encuadre.' },
    { id: 2, author: 'zoa.team', text: 'Parece una captura perfecta para identificar la especie.' },
  ]);

  const displayedComments = useMemo(() => {
    const numericComments = Number(String(baseComments).replace(/[^0-9.]/g, ''));
    if (Number.isNaN(numericComments)) return baseComments;
    return String(numericComments + commentItems.length - 2);
  }, [baseComments, commentItems.length]);

  const handleToggleFlip = () => {
    setIsFlipped((f) => !f);
  };

  const handleHeartClick = (event) => {
    event.stopPropagation();
    setIsLiked((current) => !current);
  };

  const handleCommentsClick = (event) => {
    event.stopPropagation();
    setShowComments(true);
  };

  const closeComments = (event) => {
    event.stopPropagation();
    setShowComments(false);
  };

  const handleSendComment = (event) => {
    event.preventDefault();
    const trimmedComment = commentDraft.trim();
    if (!trimmedComment) return;
    setCommentItems((current) => [
      ...current,
      { id: Date.now(), author: authorName.replace(/^@/, ''), text: trimmedComment },
    ]);
    setCommentDraft('');
  };

  return (
    <main className="relative z-0 mx-auto flex h-full min-h-0 w-full shrink-0 flex-col items-stretch justify-center">
      <div
        className="relative flex h-full min-h-0 w-full flex-col cursor-pointer"
        onClick={handleToggleFlip}
        style={{ perspective: '1000px' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleFlip();
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
              <div className="relative flex-[5] overflow-hidden bg-neutral-200 sm:flex-[5]">
                <img src={card.image} alt={card.name} className="h-full w-full object-cover object-center" />
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

              <div className="flex min-h-[92px] flex-none flex-col justify-start bg-white px-4 py-3 sm:min-h-[100px]">
                <div className="min-w-0">
                  <span className="block truncate text-[20px] font-black leading-tight text-black sm:text-[22px]">{card.name}</span>
                </div>

                <div className="mt-0.5 flex w-full items-center justify-between gap-2 text-[12px] font-bold text-neutral-500 sm:text-[13px]">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <MapPin size={14} className="shrink-0 text-neutral-400" />
                    <span className="truncate leading-none">{scientificLabel}</span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 text-[12px] font-bold text-neutral-500 sm:gap-3 sm:text-[13px]">
                    <button
                      type="button"
                      onClick={handleHeartClick}
                      className="flex items-center gap-1 transition-transform active:scale-95"
                    >
                      <Heart
                        size={16}
                        className={cn(
                          'transition-colors',
                          isLiked ? 'fill-[#2eae48] text-[#2eae48]' : 'text-[#2eae48]',
                        )}
                      />
                      <span>{baseLikes}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCommentsClick}
                      className="flex items-center gap-1 transition-transform active:scale-95"
                    >
                      <MessageSquare size={16} className="fill-neutral-500 text-neutral-500" />
                      <span>{displayedComments}</span>
                    </button>
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
            <h2 className="mb-4 pt-1 text-2xl font-extrabold tracking-tight text-black">{card.name}</h2>
            <div className="mb-4 min-h-0 flex-1 text-left">
              <h3 className="mb-2 text-base font-bold text-black">Descripción</h3>
              <p className="custom-scrollbar max-h-[220px] overflow-y-auto break-words text-[15px] font-medium leading-snug text-black">
                {card.description}
              </p>
            </div>
            <div className="pb-2 text-left">
              <h3 className="mb-2 text-base font-bold text-black">Ubicación</h3>
              <p className="break-words text-[15px] font-medium leading-snug text-black">{card.location}</p>
            </div>
          </div>
        </div>
      </div>

      {showComments ? (
        <div
          className="absolute inset-0 z-30 flex items-end bg-black/35 backdrop-blur-[2px]"
          onClick={closeComments}
        >
          <section
            className="w-full rounded-t-[28px] bg-white shadow-[0_-18px_50px_rgba(0,0,0,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex items-center justify-between border-b border-black/5 px-4 pb-3 pt-3">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-neutral-200" />
              <button
                type="button"
                aria-label="Cerrar comentarios"
                onClick={closeComments}
                className="absolute right-4 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-4 pb-4 pt-1">
              <div className="mb-4 max-h-[240px] space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                {commentItems.map((c) => (
                  <article key={c.id} className="rounded-2xl bg-neutral-50 px-3 py-2">
                    <p className="text-xs font-semibold text-black">@{c.author}</p>
                    <p className="mt-1 text-sm leading-snug text-neutral-700">{c.text}</p>
                  </article>
                ))}
              </div>
              <form onSubmit={handleSendComment} className="flex items-center gap-2 pb-2">
                <input
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  type="text"
                  placeholder="Escribe un comentario..."
                  className="h-11 flex-1 rounded-full border border-black/10 bg-neutral-50 px-4 text-sm text-black outline-none placeholder:text-neutral-400"
                />
                <button
                  type="submit"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#80902e] text-white transition-transform active:scale-95"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default DiscoverCarouselSlide;
