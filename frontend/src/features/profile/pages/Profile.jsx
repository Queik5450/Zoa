import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { getMockAuth } from '../../../shared/lib/scanFlow';
import { apiJson } from '../../../shared/lib/api';
import PerfilUsuario from '../../../PerfilZoa/src/components/PerfilUsuario';
import '../../../PerfilZoa/src/global.css';

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
      <div className="px-4 pt-5">
        <PerfilUsuario />
      </div>
    </div>
  );
}

export default Profile;
