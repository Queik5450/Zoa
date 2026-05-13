import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Play, Heart, MessageSquare } from 'lucide-react';
import { SPECIES_DETAIL } from '../../../shared/data/zoaMocks';

const IMG_MONKEY =
  'https://images.unsplash.com/photo-1583212292454-1fe6229606b2?auto=format&fit=crop&w=900&q=80';
const AUDIO_BG =
  'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=900&q=80';

function MoreText({ text, label }) {
  const [open, setOpen] = useState(false);
  const needsTrim = text.length > 72;
  return (
    <div className="border-b border-neutral-200 py-3">
      <p className="text-sm font-bold text-black">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-800">
        {open || !needsTrim ? text : `${text.slice(0, 72)}… `}
        {needsTrim ? (
          <button type="button" className="font-bold text-[#80902e] underline" onClick={() => setOpen((o) => !open)}>
            {open ? 'menos' : 'más'}
          </button>
        ) : null}
      </p>
    </div>
  );
}

function AlbumSpeciesDetail() {
  const { speciesId } = useParams();
  const data = SPECIES_DETAIL[speciesId] ?? SPECIES_DETAIL['mono-capuchino'];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#edf7f9] pb-[calc(var(--zoa-bottom-height)+16px)]">
      <div className="px-4 pb-1 pt-2">
        <h2 className="text-[35px] font-bold leading-[1] text-black">{data.title}</h2>
        <p className="mt-1 text-[15px] font-semibold text-black">Nombre Científico: {data.scientific}</p>
        <span className="mt-2 inline-flex rounded-[40px] bg-white px-4 py-[2px] text-[11px] font-semibold text-black shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
          {data.tag}
        </span>
      </div>

      <div className="px-4">
        <MoreText label="Descripción:" text={data.descriptionShort} />
        <MoreText label="Habitat:" text={data.habitatShort} />
      </div>

      <div className="h-px bg-[#b8b8b8]" />
      <h3 className="px-4 pb-3 pt-3 text-[15px] font-bold text-black">Registros ({data.recordsCount})</h3>

      <div className="space-y-4 px-3">
        <Link to="/album/imagen/demo" className="block overflow-hidden rounded-[20px] shadow-[0_4px_10px_rgba(0,0,0,0.45)]">
          <div className="relative aspect-[365/267]">
            <img src={IMG_MONKEY} alt="Registro visual" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <div className="absolute left-3 top-3 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
              <p className="text-[15px] font-semibold">Tomada por: Juan Acevedo</p>
              <p className="text-[10px] font-semibold">may 10, 2026</p>
            </div>

            <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
              <MapPin className="h-3.5 w-3.5 text-red-400" />
              Parque Nacional Canaima
            </div>

            <div className="absolute bottom-3 right-3 flex items-center gap-4 text-xs font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                1k
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                100
              </span>
            </div>
          </div>
        </Link>

        <Link
          to="/album/audio/demo"
          className="block overflow-hidden rounded-[20px] shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
          style={{
            backgroundImage: `url(${AUDIO_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="bg-black/35 px-4 pb-3 pt-2 backdrop-blur-[1px]">
            <div className="flex items-start justify-between gap-4 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
              <p className="text-[13px] font-semibold">Grabado por: Carlos Mata</p>
              <p className="flex items-center gap-1 text-[10px] font-semibold">
                <MapPin className="h-3 w-3 text-red-400" />
                Parque Nacional Canaima
              </p>
            </div>

            <div className="my-3 flex h-9 items-end justify-center gap-[3px]">
              {[10, 18, 14, 24, 12, 28, 16, 20, 14, 22, 12, 18].map((h, i) => (
                <span key={i} className="w-[3px] rounded-full bg-white/90" style={{ height: h }} />
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
              <span>01:50</span>
              <Play className="h-7 w-7 fill-white" />
            </div>
          </div>
        </Link>

        <Link to="/album/imagen/demo-2" className="block overflow-hidden rounded-[20px] shadow-[0_4px_10px_rgba(0,0,0,0.45)]">
          <div className="relative aspect-[365/267]">
            <img src={IMG_MONKEY} alt="Segundo registro" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute left-3 top-3 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
              <p className="text-[15px] font-semibold">Tomada por: Juan Acevedo</p>
              <p className="text-[10px] font-semibold">may 10, 2026</p>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
              <MapPin className="h-3.5 w-3.5 text-red-400" />
              Parque Nacional Canaima
            </div>
          </div>
        </Link>
      </div>

      <p className="mt-4 px-4 text-center text-[10px] text-neutral-500">especie: {speciesId}</p>
    </div>
  );
}

export default AlbumSpeciesDetail;
