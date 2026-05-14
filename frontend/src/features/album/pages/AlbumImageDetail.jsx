import React from 'react';
import { MapPin, Play } from 'lucide-react';
import { useParams } from 'react-router-dom';
import SpeechButton from '../../../shared/components/SpeechButton';

const MAP_IMG =
  'https://images.unsplash.com/photo-1569336415962-a056bdedbe8f?auto=format&fit=crop&w=900&q=80';

function AlbumImageDetail() {
  const { id } = useParams();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#edf7f9] pb-[calc(var(--zoa-bottom-height)+16px)]">
      <div className="px-4 pb-2 pt-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[35px] font-bold leading-[1] text-black">Nombre Imagen</h2>
          <SpeechButton
            text="Nombre Imagen. Localizado en Parque Nacional Canaima. Ver en realidad aumentada disponible."
            label="Escuchar"
            stopLabel="Detener"
            lang="es-VE"
            className="px-4 py-3 text-sm"
          />
        </div>
        <div className="mt-1 flex gap-4 text-[10px] font-semibold text-[#7b7b7b]">
          <span>fecha: mayo 09/2026</span>
          <span>hora: 4:43pm</span>
        </div>
      </div>

      <div className="px-0">
        <img
          src="https://images.unsplash.com/photo-1583212292454-1fe6229606b2?auto=format&fit=crop&w=900&q=80"
          alt="Imagen del registro"
          className="h-[298px] w-full object-cover"
        />
      </div>

      <section className="relative mt-0 bg-white px-4 pb-10 pt-5 shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
        <p className="flex items-center gap-1 text-[15px] font-semibold text-[#707070]">
          <MapPin className="h-4 w-4 text-red-500" />
          Localizado en:
        </p>
        <h3 className="mt-1 text-[25px] font-semibold leading-tight text-black">Parque Nacional Canaima</h3>

        <div className="absolute left-1/2 top-full -mt-5 -translate-x-1/2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-[10px] bg-[#9cb930] px-4 py-2 text-base font-semibold text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
          >
            Ver En Realidad Aumentada
            <Play className="h-5 w-5 fill-white" />
          </button>
        </div>
      </section>

      <div className="relative mx-3 mt-8 overflow-hidden rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
        <img src={MAP_IMG} alt="Mapa de ubicación" className="h-52 w-full object-cover" />
        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <div className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-red-600">
            <MapPin className="h-4 w-4" />
            Parque Nacional Canaima
          </div>
        </div>
      </div>

      <p className="mt-3 px-4 text-center text-[10px] font-semibold text-[#7b7b7b]">id: {id}</p>
    </div>
  );
}

export default AlbumImageDetail;
