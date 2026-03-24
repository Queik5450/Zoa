import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import ObservationCard from '../components/ObservationCard';
import { Settings, LogOut, MapPin } from 'lucide-react';

export default function Profile() {
  const { currentUser, observations, setIsLoggedIn } = useApp();
  const navigate = useNavigate();
  const userObs = observations.filter(o => o.user === currentUser.username);
  const verified = userObs.filter(o => o.verified).length;

  return (
    <div className="pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-guayana-700 to-guayana-900 pt-12 pb-6 px-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-guayana-700 shadow-lg">
              {currentUser.name[0]}
            </div>
            <div>
              <h1 className="text-white text-lg font-bold">{currentUser.name}</h1>
              <p className="text-guayana-200 text-sm">@{currentUser.username}</p>
            </div>
          </div>
          <button onClick={() => { setIsLoggedIn(false); navigate('/login'); }} className="text-guayana-200 hover:text-white">
            <LogOut size={20} />
          </button>
        </div>
        {currentUser.bio && <p className="text-guayana-100 text-sm mt-3">{currentUser.bio}</p>}
        <div className="flex gap-4 mt-4">
          {[
            { label: 'Observaciones', value: userObs.length },
            { label: 'Verificadas', value: verified },
            { label: 'Seguidores', value: currentUser.followers },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-white text-xl font-bold">{s.value}</p>
              <p className="text-guayana-200 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">Mis Observaciones</h2>
        {userObs.length > 0 ? (
          userObs.map(obs => <ObservationCard key={obs.id} observation={obs} />)
        ) : (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🌿</p>
            <p className="text-gray-500 text-sm">Aún no tienes observaciones.</p>
            <button onClick={() => navigate('/new-observation')} className="mt-3 bg-guayana-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Registrar primera observación
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
