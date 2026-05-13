import React from 'react';
import { MapPin, Play } from 'lucide-react';
import { useParams } from 'react-router-dom';

const MAP_IMG =
  'https://images.unsplash.com/photo-1569336415962-a056bdedbe8f?auto=format&fit=crop&w=900&q=80';

function AlbumImageDetail() {
  const { id } = useParams();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#eef3f8] pb-4">
      <div className="px-4 pb-2 pt-1">
        <h2 className="text-xl font-black text-black">Nombre Imagen</h2>
        <p className="mt-1 text-xs font-medium text-neutral-500">
          fecha: mayo 09/2026 <span className="mx-2">·</span> hora: 4:43pm
        </p>
      </div>

      <div className="px-3">
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1583212292454-1fe6229606b2?auto=format&fit=crop&w=900&q=80"
            alt=""
            className="aspect-[4/5] w-full object-cover"
          />
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
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-bold text-red-600 shadow">
          <MapPin className="h-4 w-4" />
          Parque Nacional Canaima
        </div>
      </div>

      <p className="mt-3 px-4 text-center text-[10px] text-neutral-400">id: {id}</p>
    </div>
  );
}

export default AlbumImageDetail;
