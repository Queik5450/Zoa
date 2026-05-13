import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { getMockAuth } from '../utils/scanFlow';
import { apiJson } from '../utils/api';

const FALLBACK_PHOTOS = [
  null,
  'https://picsum.photos/seed/zoaBird/400/400',
  null,
  'https://picsum.photos/seed/zoaMonkey/400/400',
  null,
  'https://picsum.photos/seed/zoaMonkey2/400/400',
];

const FALLBACK_AUDIOS = ['Nombre animal', 'Nombre animal', 'Nombre animal'];

function Profile() {
  const auth = getMockAuth();
  const [stats, setStats] = useState({
    records_total: 27,
    photos_total: 15,
    audios_total: 12,
    species_total: 27,
  });
  const [photoItems, setPhotoItems] = useState(FALLBACK_PHOTOS);
  const [audioItems, setAudioItems] = useState(FALLBACK_AUDIOS);

  useEffect(() => {
    let isActive = true;
    const userId = auth?.userId || auth?.id || null;

    if (!userId) {
      return undefined;
    }

    async function loadProfileData() {
      try {
        const [statsData, publications] = await Promise.all([
          apiJson(`/users/${userId}/stats`),
          apiJson(`/publications/user/${userId}?limit=50`),
        ]);

        if (!isActive) return;

        if (statsData) {
          setStats({
            records_total: statsData.records_total ?? 0,
            photos_total: statsData.photos_total ?? 0,
            audios_total: statsData.audios_total ?? 0,
            species_total: statsData.species_total ?? 0,
          });
        }

        if (Array.isArray(publications)) {
          const nextPhotoItems = publications
            .filter((item) => item.mediaType !== 'audio')
            .map((item) => item.image)
            .filter(Boolean)
            .slice(0, 6);
          const nextAudioItems = publications
            .filter((item) => item.mediaType === 'audio')
            .map((item) => item.name || item.scientificName || 'Audio grabado')
            .slice(0, 6);

          setPhotoItems(
            [...nextPhotoItems, ...FALLBACK_PHOTOS].slice(0, 6),
          );
          setAudioItems(
            [...nextAudioItems, ...FALLBACK_AUDIOS].slice(0, 6),
          );
        }
      } catch {
        if (!isActive) return;
      }
    }

    loadProfileData();

    return () => {
      isActive = false;
    };
  }, [auth?.id, auth?.userId]);

  if (!auth) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <p className="text-base font-semibold leading-relaxed text-neutral-800">
          No tienes perfil,{' '}
          <Link to="/register" className="font-bold text-[#80902e] underline underline-offset-2">
            Registrate aquí
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[#eef3f8] pb-24">
      <div className="shrink-0 bg-[#80902e] px-4 pb-4 pt-4">
        <div className="flex gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white/40 bg-neutral-300 shadow-md">
            <img
              src="https://picsum.photos/seed/zoaUser/200/200"
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h2 className="text-lg font-black text-black">{auth.displayName || 'Pedro Sánchez'}</h2>
            <p className="text-sm text-black/80">@pedrosanchez</p>
            <p className="mt-1 text-sm text-black/90">Entusiasta de la naturaleza | Biologo profesional</p>
            <p className="mt-2 text-xs italic text-black/70">Miembro desde 12 de mayo, 2026</p>
          </div>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-px bg-[#5c6a24] text-center text-[11px] font-semibold text-white">
        <div className="bg-[#6d7b2a] py-3">
          <div className="text-lg font-black">{stats.records_total}</div>
          Especies registradas
        </div>
        <div className="bg-[#6d7b2a] py-3">
          <div className="text-lg font-black">{stats.photos_total}</div>
          Fotos tomadas
        </div>
        <div className="bg-[#6d7b2a] py-3">
          <div className="text-lg font-black">{stats.audios_total}</div>
          Audios grabados
        </div>
      </div>

      <div className="px-4 pt-5">
        <h3 className="mb-2 text-lg font-black text-black">Fotos/Videos</h3>
        <div className="grid grid-cols-3 gap-2">
          {photoItems.map((src, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-xl bg-neutral-300 shadow-sm">
              {src ? <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
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

      <div className="mt-8 px-4 pb-4">
        <h3 className="text-lg font-black text-black">Audios</h3>
        <div className="mt-3 space-y-2">
          {audioItems.map((label, i) => (
            <Link
              key={i}
              to="/album/audio/perfil"
              className="flex items-center gap-3 rounded-2xl bg-neutral-200/90 px-3 py-3 shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-white">
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
