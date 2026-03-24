import { CheckCircle } from 'lucide-react';

export default function SpeciesCard({ observation }) {
  return (
    <div className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <img
        src={observation.image}
        alt={observation.commonName}
        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        onError={e => { e.target.src = 'https://placehold.co/64x64/16a34a/white?text=?'; }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="font-semibold text-sm text-gray-900 truncate">{observation.commonName}</p>
          {observation.verified && <CheckCircle size={14} className="text-guayana-600 flex-shrink-0" />}
        </div>
        <p className="text-xs italic text-gray-500 truncate">{observation.species}</p>
        <p className="text-xs text-gray-400 mt-1">@{observation.user} · {observation.date}</p>
      </div>
    </div>
  );
}
