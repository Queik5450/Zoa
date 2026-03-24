import { useState } from 'react';
import { Search, SlidersHorizontal, List, Map as MapIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MapView from '../components/MapView';
import SpeciesCard from '../components/SpeciesCard';

export default function Explore() {
  const { observations } = useApp();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('map');
  const [filter, setFilter] = useState('all');

  const filtered = observations.filter(obs => {
    const matchesSearch = obs.commonName.toLowerCase().includes(search.toLowerCase()) ||
      obs.species.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'verified' && obs.verified) || (filter === 'unverified' && !obs.verified);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pb-20">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100 px-4 pt-10 pb-3 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Explorar Guayana</h1>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar especie..."
              className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-guayana-400"
            />
          </div>
          <div className="flex border border-gray-200 rounded-full overflow-hidden">
            <button onClick={() => setView('map')} className={`px-3 py-2 text-sm flex items-center gap-1 ${view === 'map' ? 'bg-guayana-600 text-white' : 'text-gray-500'}`}>
              <MapIcon size={14} />
            </button>
            <button onClick={() => setView('list')} className={`px-3 py-2 text-sm flex items-center gap-1 ${view === 'list' ? 'bg-guayana-600 text-white' : 'text-gray-500'}`}>
              <List size={14} />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          {['all', 'verified', 'unverified'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-guayana-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f === 'all' ? 'Todos' : f === 'verified' ? '✓ Verificados' : 'Sin verificar'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-3">
        <p className="text-xs text-gray-500 mb-3">{filtered.length} observaciones</p>
        {view === 'map' ? (
          <MapView observations={filtered} height="calc(100vh - 280px)" />
        ) : (
          <div className="space-y-3">
            {filtered.map(obs => <SpeciesCard key={obs.id} observation={obs} />)}
            {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No se encontraron especies.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
