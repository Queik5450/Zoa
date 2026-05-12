import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { getMockAuth } from '../utils/scanFlow';

const PHOTOS = [
  null,
  'https://images.unsplash.com/photo-1551986782-d0169e1df9fa?auto=format&fit=crop&w=400&q=80',
  null,
  'https://images.unsplash.com/photo-1583212292454-1fe6229606b2?auto=format&fit=crop&w=400&q=80',
  null,
  'https://images.unsplash.com/photo-1583212292454-1fe6229606b2?auto=format&fit=crop&w=400&q=80',
];

const AUDIOS = ['Nombre animal', 'Nombre animal', 'Nombre animal'];

function Profile() {
  const auth = getMockAuth();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#eef3f8] pb-4">
      <div className="bg-[#80902e] px-4 pb-4 pt-4">
        <div className="flex gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white/40 bg-neutral-300 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h2 className="text-lg font-black text-black">{auth?.displayName || 'Pedro Sánchez'}</h2>
            <p className="text-sm text-black/80">@pedrosanchez</p>
            <p className="mt-1 text-sm text-black/90">Entusiasta de la naturaleza | Biologo profesional</p>
            <p className="mt-2 text-xs italic text-black/70">Miembro desde 12 de mayo, 2026</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-[#5c6a24] text-center text-[11px] font-semibold text-white">
        <div className="bg-[#6d7b2a] py-3">
          <div className="text-lg font-black">27</div>
          Especies registradas
        </div>
        <div className="bg-[#6d7b2a] py-3">
          <div className="text-lg font-black">15</div>
          Fotos tomadas
        </div>
        <div className="bg-[#6d7b2a] py-3">
          <div className="text-lg font-black">12</div>
          Audios grabados
        </div>
      </div>

      <div className="px-4 pt-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-black text-black">Fotos/Videos</h3>
          {!auth ? (
            <Link to="/login" className="text-xs font-semibold text-[#80902e] underline">
              Inicia sesión
            </Link>
          ) : null}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {PHOTOS.map((src, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-xl bg-neutral-300 shadow-sm">
              {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : null}
            </div>
          ))}
        </div>
        <Link
          to="/album/imagen/perfil"
          className="mx-auto mt-4 flex h-11 w-40 items-center justify-center rounded-2xl bg-[#c1e14f] text-sm font-bold text-black shadow-md"
        >
          Ver más
        </Link>
      </div>

      <div className="mt-8 px-4">
        <h3 className="text-lg font-black text-black">Audios</h3>
        <div className="mt-3 space-y-2">
          {AUDIOS.map((label, i) => (
            <Link
              key={i}
              to="/album/audio/perfil"
              className="flex items-center gap-3 rounded-2xl bg-neutral-200/90 px-3 py-3 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700 text-white">
                <Play className="ml-0.5 h-4 w-4 fill-white" />
              </span>
              <span className="text-sm font-semibold text-neutral-800">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
