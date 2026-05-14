import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMockAuth, getPendingStats } from '../../../shared/lib/scanFlow';
import { apiJson, apiUrl } from '../../../shared/lib/api';
import PerfilUsuario from '../../../PerfilZoa/src/components/PerfilUsuario';
import '../../../PerfilZoa/src/global.css';

function Profile() {
  const auth = getMockAuth();
  const [stats, setStats] = useState(null);
  const [photoItems, setPhotoItems] = useState([]);
  const [audioItems, setAudioItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [hasPublications, setHasPublications] = useState(null);

  useEffect(() => {
    let isActive = true;
    const userId = auth?.userId || auth?.id || null;

    if (!userId) {
      setProfileLoaded(true);
      return undefined;
    }

    async function loadProfileData() {
      try {
        const [statsData, publications, profileData] = await Promise.all([
          apiJson(`/users/${userId}/stats`),
          apiJson(`/publications/user/${userId}?limit=50`),
          apiJson(`/profiles/${userId}`),
        ]);

        if (!isActive) return;

        // Always set stats (use zeroes when the API returns null) so the UI
        // leaves the loading state even if there is no stats record yet.
        const pending = getPendingStats();
        const pendingPhotos = (pending && pending[userId] && pending[userId].photos) ? pending[userId].photos : 0;

        setStats({
          records_total: statsData?.records_total ?? 0,
          photos_total: (statsData?.photos_total ?? 0) + pendingPhotos,
          audios_total: statsData?.audios_total ?? 0,
          species_total: statsData?.species_total ?? 0,
        });

        if (profileData) setProfile(profileData);
        else setProfile(null);

        setProfileLoaded(true);

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

          const nextHasPublications = nextPhotoItems.length > 0 || nextAudioItems.length > 0;

          setHasPublications(nextHasPublications);
          setPhotoItems(nextPhotoItems);
          setAudioItems(nextAudioItems);
        }
      } catch {
        if (!isActive) return;
        setHasPublications(false);
        setPhotoItems([]);
        setAudioItems([]);
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

  if (profileLoaded && !profile) {
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
      <div className="px-3 pt-4 sm:px-4 md:px-6 lg:px-8 xl:px-10">
        {profileLoaded && hasPublications === false ? (
          <div className="mb-4 rounded-2xl border border-[#7b8d2f]/20 bg-white px-4 py-3 text-sm font-semibold text-[#7b8d2f] shadow-sm">
            No tiene publicaciones asociadas.
          </div>
        ) : null}
        <PerfilUsuario
          profile={profile}
          stats={stats}
          photos={photoItems}
          audios={audioItems}
          onSave={async (updated) => {
            try {
              await apiJson('/profiles/sync', {
                method: 'POST',
                body: {
                  user_id: auth?.userId || auth?.id,
                  display_name: updated.display_name,
                  avatar_url: updated.avatar_url,
                  bio: updated.bio,
                },
              });
              const refreshed = await apiJson(`/profiles/${auth?.userId || auth?.id}`);
              setProfile(refreshed);
            } catch (err) {
              console.error('Failed saving profile', err);
            }
          }}
          onUploadAvatar={async (file) => {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch(apiUrl(`/profiles/${auth?.userId || auth?.id}/avatar`), { method: 'POST', body: fd });
            // apiJson cannot be used for multipart easily here, use fetch
            const json = await res.json();
            if (json?.avatar_url) {
              // sync profile with new avatar
              await apiJson('/profiles/sync', {
                method: 'POST',
                body: {
                  user_id: auth?.userId || auth?.id,
                  avatar_url: json.avatar_url,
                },
              });
              setProfile((p) => ({ ...(p || {}), avatar_url: json.avatar_url }));
              return json.avatar_url;
            }
            return null;
          }}
        />
      </div>
    </div>
  );
}

export default Profile;
