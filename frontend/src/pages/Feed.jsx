import { useState } from 'react';
import { useApp } from '../context/AppContext';
import ObservationCard from '../components/ObservationCard';
import { SlidersHorizontal } from 'lucide-react';

export default function Feed() {
  const { observations } = useApp();
  const [filter, setFilter] = useState('recent');

  const sorted = [...observations].sort((a, b) => {
    if (filter === 'popular') return b.likes - a.likes;
    if (filter === 'verified') return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="pb-20 max-w-lg mx-auto">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 pt-10 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Feed</h1>
          <SlidersHorizontal size={20} className="text-gray-500" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[{ key: 'recent', label: '🕐 Recientes' }, { key: 'popular', label: '❤️ Populares' }, { key: 'verified', label: '✓ Verificados' }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f.key ? 'bg-guayana-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pt-4">
        {sorted.map(obs => <ObservationCard key={obs.id} observation={obs} />)}
      </div>
    </div>
  );
}
