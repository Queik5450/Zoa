import React from 'react';
import PropTypes from 'prop-types';

const PerfilUsuario = ({ profile = null, stats = {}, photos = [], audios = [], onSave = () => {}, onUploadAvatar = null, className = '' }) => {
  const [editing, setEditing] = React.useState(false);
  const [local, setLocal] = React.useState({
    display_name: profile?.display_name || '',
    avatar_url: profile?.avatar_url || '',
    bio: profile?.bio || '',
  });

  React.useEffect(() => {
    setLocal({
      display_name: profile?.display_name || '',
      avatar_url: profile?.avatar_url || '',
      bio: profile?.bio || '',
    });
  }, [profile]);

  const handleFile = async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file || !onUploadAvatar) return;
    try {
      const url = await onUploadAvatar(file);
      if (url) setLocal((s) => ({ ...s, avatar_url: url }));
    } catch (err) {
      console.error('avatar upload failed', err);
    }
  };

  const save = async (e) => {
    e && e.preventDefault();
    await onSave(local);
    setEditing(false);
  };

  return (
    <form className={`w-full max-w-6xl mx-auto overflow-hidden rounded-2xl bg-white shadow-sm ${className}`} onSubmit={save}>
      <div className="relative overflow-hidden bg-[#c6ea2f] px-4 pb-5 pt-14 sm:px-6 sm:pb-6 sm:pt-16 lg:px-8 lg:pb-8 lg:pt-18">
        <div className="absolute inset-x-0 bottom-0 h-12 bg-white/35 blur-2xl" />
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6 lg:right-8 lg:top-8">
          <button type="button" onClick={() => setEditing((s) => !s)} className="rounded-md bg-white/85 px-3 py-1 shadow-sm transition hover:bg-white">
            {editing ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>
        <div className="relative flex flex-col md:flex-row items-start gap-4 lg:gap-6 xl:gap-8">
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={local.avatar_url || '/image-17@2x.png'}
                alt="avatar"
                className="h-28 w-28 rounded-full object-cover shadow sm:h-32 sm:w-32 xl:h-36 xl:w-36"
              />
              {editing && (
                <input type="file" accept="image/*" onChange={handleFile} className="absolute bottom-0 right-0 h-full w-full opacity-0" />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div>
              <h2 className="text-2xl font-bold leading-tight sm:text-3xl xl:text-4xl">{local.display_name || 'Usuario'}</h2>
              <div className="text-sm text-gray-700">{profile?.email || ''}</div>
            </div>

            {!editing && (
              <p className="mt-2 max-w-3xl text-gray-800">{local.bio || 'Sin descripción'}</p>
            )}

            {editing && (
              <div className="mt-3 max-w-3xl rounded-xl bg-white/80 p-3 shadow-sm backdrop-blur">
                <input className="mb-2 w-full rounded-lg border border-black/10 p-2" value={local.display_name} onChange={(e) => setLocal({ ...local, display_name: e.target.value })} />
                <textarea rows={3} className="w-full rounded-lg border border-black/10 p-2" value={local.bio} onChange={(e) => setLocal({ ...local, bio: e.target.value })} />
                <div className="mt-3 flex gap-2">
                  <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 text-white">Guardar</button>
                  <button type="button" onClick={() => setEditing(false)} className="rounded-lg bg-black/10 px-4 py-2">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 border-t bg-[#7b8d2f] p-3 text-center text-white sm:gap-4 sm:p-4">
        <div>
          <div className="text-xl font-bold">{stats?.species_total ?? stats?.records_total ?? 0}</div>
          <div className="text-xs">Especies registradas</div>
        </div>
        <div>
          <div className="text-xl font-bold">{stats?.photos_total ?? 0}</div>
          <div className="text-xs">Fotos tomadas</div>
        </div>
        <div>
          <div className="text-xl font-bold">{stats?.audios_total ?? 0}</div>
          <div className="text-xs">Audios grabados</div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-5 sm:px-6 lg:px-8 lg:pb-6">
        <h3 className="text-xl sm:text-2xl font-bold">Fotos</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-4">
        {photos && photos.length ? photos.slice(0, 6).map((p, i) => (
          <div key={i} className="aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden">
            {p ? <img src={p} alt="foto" className="w-full h-full object-cover" /> : null}
          </div>
        )) : <div className="col-span-3 text-gray-500">Sin fotos</div>}
        </div>

        <h3 className="mt-6 text-xl sm:text-2xl font-bold">Audios</h3>
        <div className="mt-3 flex flex-col gap-2">
          {(audios || []).slice(0,3).map((a, idx) => (
            <div key={idx} className="w-full rounded-xl bg-gray-100 p-3">{a}</div>
          ))}
        </div>
      </div>
    </form>
  );
};

PerfilUsuario.propTypes = {
  profile: PropTypes.object,
  stats: PropTypes.object,
  photos: PropTypes.array,
  audios: PropTypes.array,
  onSave: PropTypes.func,
  onUploadAvatar: PropTypes.func,
  className: PropTypes.string,
};

export default PerfilUsuario;
