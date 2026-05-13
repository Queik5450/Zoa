import React from 'react';
import { MapPin, Play } from 'lucide-react';
import { useParams } from 'react-router-dom';

const MAP_IMG =
  'https://images.unsplash.com/photo-1569336415962-a056bdedbe8f?auto=format&fit=crop&w=900&q=80';

const BG =
  'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=900&q=80';

function Waveform() {
  const heights = [12, 22, 16, 28, 18, 32, 14, 26, 20, 30, 16, 24, 12, 20];
  return (
    <div className="flex h-10 items-center justify-center gap-0.5 px-2">
      {heights.map((h, i) => (
        <span key={i} className="w-1 rounded-full bg-white/90" style={{ height: h }} />
      ))}
    </div>
  );
}

function AlbumAudioDetail() {
  const { id } = useParams();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#eef3f8] pb-4">
      <div className="px-4 pb-2 pt-1">
        <h2 className="text-xl font-black text-black">Nombre Audio</h2>
        <p className="mt-1 text-xs font-medium text-neutral-500">
          fecha: mayo 09/2026 <span className="mx-2">·</span> hora: 4:43pm
        </p>
      </div>

      <div className="px-3">
        <div
          className="relative overflow-hidden rounded-2xl bg-neutral-900 shadow-xl"
          style={{ backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
          <div className="relative p-4 pt-3">
            <div className="flex items-start justify-between gap-2 text-[11px] font-semibold text-white">
              <span>Grabado por: Carlos Mata</span>
              <span className="flex items-center gap-0.5 text-right">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-red-400" />
                Parque Nacional Canaima
              </span>
            </div>
            <Waveform />
            <div className="mt-2 flex items-end justify-between text-xs text-white">
              <span>01:50</span>
              <button type="button" className="rounded-full bg-white/20 p-2" aria-label="Reproducir">
                <Play className="h-6 w-6 fill-white text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 px-4">
        <p className="flex items-center gap-1 text-sm font-medium text-neutral-500">
          <MapPin className="h-4 w-4 text-red-500" />
          Localizado en:
        </p>
        <p className="mt-1 text-lg font-bold text-neutral-800">Parque Nacional Canaima</p>
      </div>

      <div className="relative mx-3 mt-4 h-48 overflow-hidden rounded-2xl">
        <img src={MAP_IMG} alt="" className="h-full w-full object-cover" />
        <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-[#c1e14f] px-4 py-2 text-xs font-bold text-white shadow-md"
          >
            Ver En Realidad Aumentada
            <Play className="h-4 w-4 fill-white" />
          </button>
        </div>
      </div>

      <p className="mt-3 px-4 text-center text-[10px] text-neutral-400">id: {id}</p>
    </div>
  );
}

export default AlbumAudioDetail;
