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
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#eef3f8] pb-4">
      <div className="px-4 pb-2 pt-1">
        <h2 className="text-2xl font-black text-black">{data.title}</h2>
        <p className="mt-1 text-sm text-black">Nombre Científico: {data.scientific}</p>
        <span className="mt-2 inline-block rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-black shadow-sm">
          {data.tag}
        </span>
      </div>

      <div className="px-4">
        <MoreText label="Descripción:" text={data.descriptionShort} />
        <MoreText label="Habitat:" text={data.habitatShort} />
      </div>

      <h3 className="mt-2 px-4 text-lg font-black text-black">Registros ({data.recordsCount})</h3>

      <div className="mt-3 space-y-4 px-3">
        <article className="overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="relative aspect-[16/11]">
            <img src={IMG_MONKEY} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
            <p className="absolute left-3 top-3 text-[11px] font-semibold text-white">
              Tomada por: Juan Acevedo
              <br />
              may 10, 2026
            </p>
            <p className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-white">
              <MapPin className="h-3.5 w-3.5 text-red-400" />
              Parque Nacional Canaima
            </p>
            <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs font-bold text-white">
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
        </article>

        <Link
          to="/album/audio/demo"
          className="block overflow-hidden rounded-2xl shadow-md"
          style={{
            backgroundImage: `url(${AUDIO_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative bg-black/40 p-4 backdrop-blur-[1px]">
            <div className="flex justify-between text-[10px] font-semibold text-white">
              <span>Grabado por: Carlos Mata</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3 text-red-400" />
                Parque Nacional Canaima
              </span>
            </div>
            <div className="my-3 flex h-10 items-end justify-center gap-0.5">
              {[10, 18, 14, 24, 12, 28, 16, 20, 14, 22].map((h, i) => (
                <span key={i} className="w-1 rounded-full bg-white/90" style={{ height: h }} />
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-white">
              <span>01:50</span>
              <Play className="h-7 w-7 fill-white" />
            </div>
          </div>
        </Link>
      </div>

      <p className="mt-4 px-4 text-center text-[10px] text-neutral-400">especie: {speciesId}</p>
    </div>
  );
}

export default AlbumSpeciesDetail;
