import { Link } from 'react-router-dom';
import { PlusCircle, Map, TrendingUp, Users, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ObservationCard from '../components/ObservationCard';

export default function Home() {
  const { observations } = useApp();
  const recent = observations.slice(0, 3);
  const stats = [
    { label: 'Observaciones', value: observations.length, icon: Camera },
    { label: 'Especies', value: '120+', icon: TrendingUp },
    { label: 'Usuarios', value: '48', icon: Users },
  ];

  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-guayana-700 to-guayana-900 text-white px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌿</span>
            <h1 className="text-2xl font-bold">BioGuayana</h1>
          </div>
          <p className="text-guayana-100 text-sm mb-6">
            Ciencia ciudadana en el Escudo Guayanés · Bolívar · Delta Amacuro
          </p>
          <div className="flex gap-3">
            <Link
              to="/new-observation"
              className="flex items-center gap-2 bg-white text-guayana-700 px-4 py-2.5 rounded-full font-semibold text-sm hover:bg-guayana-50 transition-colors shadow-md"
            >
              <PlusCircle size={18} /> Registrar
            </Link>
            <Link
              to="/explore"
              className="flex items-center gap-2 border border-white/60 text-white px-4 py-2.5 rounded-full font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              <Map size={18} /> Explorar
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
              <Icon size={20} className="text-guayana-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link to="/identify" className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-3 hover:bg-amber-100 transition-colors">
            <span className="text-2xl">🔍</span>
            <div>
              <p className="font-semibold text-sm text-amber-800">Identificar</p>
              <p className="text-xs text-amber-600">IA para especies</p>
            </div>
          </Link>
          <Link to="/dataset" className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-2xl p-3 hover:bg-blue-100 transition-colors">
            <span className="text-2xl">🗂️</span>
            <div>
              <p className="font-semibold text-sm text-blue-800">Dataset</p>
              <p className="text-xs text-blue-600">Curación de datos</p>
            </div>
          </Link>
        </div>

        {/* Recent observations */}
        <h2 className="text-lg font-bold text-gray-900 mb-3">Recientes</h2>
        {recent.map(obs => <ObservationCard key={obs.id} observation={obs} />)}

        <Link to="/feed" className="block text-center text-guayana-600 font-medium text-sm py-2 hover:underline">
          Ver todas las observaciones →
        </Link>
      </div>
    </div>
  );
}
