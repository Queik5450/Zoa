import React, { useEffect, useMemo, useState } from 'react';
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

function AnimalCard({ activeCard, cards, activeIndex, isFlipped, isScanning, onCardClick }) {
  const authorName = activeCard.authorName || '@nombreUsuario';
  const speciesLabel = activeCard.species || activeCard.name;
  const locationLabel = activeCard.location || 'Parque Nacional Canaima';
  const likesCount = activeCard.likes || '1k';
  const commentsCount = activeCard.comments || '100';
  const avatarLabel = activeCard.avatarLabel || authorName.replace(/^@/, '').slice(0, 2).toUpperCase();

  const baseLikes = useMemo(() => formatCount(likesCount), [likesCount]);
  const baseComments = useMemo(() => formatCount(commentsCount), [commentsCount]);

  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentItems, setCommentItems] = useState([
    {
      id: 1,
      author: 'wild.focus',
      text: 'La foto quedó muy limpia, buen encuadre.',
    },
    {
      id: 2,
      author: 'zoa.team',
      text: 'Parece una captura perfecta para identificar la especie.',
    },
  ]);

  useEffect(() => {
    setIsLiked(false);
    setShowComments(false);
    setCommentDraft('');
    setCommentItems([
      {
        id: 1,
        author: 'wild.focus',
        text: 'La foto quedó muy limpia, buen encuadre.',
      },
      {
        id: 2,
        author: 'zoa.team',
        text: 'Parece una captura perfecta para identificar la especie.',
      },
    ]);
  }, [activeCard.id]);

  const displayedLikes = baseLikes;

  const displayedComments = useMemo(() => {
    const numericComments = Number(String(baseComments).replace(/[^0-9.]/g, ''));
    if (Number.isNaN(numericComments)) return baseComments;

    return String(numericComments + commentItems.length - 2);
  }, [baseComments, commentItems.length]);

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
      {
        id: Date.now(),
        author: authorName.replace(/^@/, ''),
        text: trimmedComment,
      },
    ]);
    setCommentDraft('');
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-3 relative z-0 mb-4">
      <div
        className="relative w-full max-w-[260px] aspect-[292/522] cursor-pointer mx-auto"
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
              <div className="relative flex-[1.10] overflow-hidden bg-neutral-200">
                <img
                  src={activeCard.image}
                  alt={activeCard.name}
                  className="h-full w-full object-cover object-center"
                />
                {isScanning ? (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/35 backdrop-blur-[1px]">
                    <Loader2 className="mb-2 text-white animate-spin" size={40} />
                    <span className="text-sm font-semibold tracking-wide text-white">
                      Analizando especie...
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-[0.38] flex-col justify-between bg-white px-3 pb-4 pt-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#d9f06d] ring-1 ring-black/10">
                      <span className="text-[10px] font-extrabold text-black">{avatarLabel}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate text-[14px] font-bold leading-none text-black">
                        {authorName}
                      </span>
                      <span className="mt-1 block truncate text-[12px] font-medium leading-none text-neutral-500">
                        {speciesLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-500">
                  <MapPin size={12} className="shrink-0 text-neutral-500" />
                  <span className="truncate leading-none">{locationLabel}</span>
                </div>

                <div className="mt-2 flex items-center gap-4 text-[13px] font-semibold text-black">
                  <button
                    type="button"
                    onClick={handleHeartClick}
                    className="flex items-center gap-1.5 rounded-full px-1 py-1 transition-transform active:scale-95"
                  >
                    <Heart
                      size={20}
                      className={cn(
                        'transition-colors',
                        isLiked ? 'fill-[#2eae48] text-[#2eae48]' : 'fill-transparent text-neutral-500',
                      )}
                    />
                    <span>{displayedLikes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCommentsClick}
                    className="flex items-center gap-1.5 rounded-full px-1 py-1 transition-transform active:scale-95"
                  >
                    <MessageSquare size={20} className="text-neutral-600" />
                    <span>{displayedComments}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 w-full h-full rounded-[16px] bg-[#f3f3f3] p-5 flex flex-col border border-black/5 z-20"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <h2 className="text-2xl font-extrabold text-black mb-5 pt-1 tracking-tight">
              {activeCard.name}
            </h2>

            <div className="mb-5 text-left">
              <h3 className="text-base font-bold text-black mb-2">Descripción</h3>
              <p className="text-black text-[15px] font-medium leading-tight break-words overflow-y-auto max-h-[220px] custom-scrollbar">
                {activeCard.description}
              </p>
            </div>

            <div className="text-left mt-auto pb-2">
              <h3 className="text-base font-bold text-black mb-2">Ubicación</h3>
              <p className="text-black text-[15px] font-medium leading-tight break-words">
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

      {showComments ? (
        <div
          className="absolute inset-0 z-30 flex items-end bg-black/35 backdrop-blur-[2px]"
          onClick={closeComments}
        >
          <section
            className="w-full rounded-t-[28px] bg-white shadow-[0_-18px_50px_rgba(0,0,0,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/5 px-4 pb-3 pt-3">
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
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#d9f06d]">
                  <span className="text-xs font-extrabold text-black">{avatarLabel}</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-black">{authorName}</p>
                  <p className="truncate text-xs text-neutral-500">{speciesLabel}</p>
                </div>
              </div>

              <div className="mb-4 max-h-[240px] space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                {commentItems.map((comment) => (
                  <article key={comment.id} className="rounded-2xl bg-neutral-50 px-3 py-2">
                    <p className="text-xs font-semibold text-black">@{comment.author}</p>
                    <p className="mt-1 text-sm leading-snug text-neutral-700">{comment.text}</p>
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
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#133c2e] text-white transition-transform active:scale-95"
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

export default AnimalCard;
