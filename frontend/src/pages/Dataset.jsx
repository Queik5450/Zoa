import { useState } from 'react';
import { ChevronLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Dataset() {
  const navigate = useNavigate();
  const { observations } = useApp();
  const [statuses, setStatuses] = useState({});

  const setStatus = (id, status) => setStatuses(s => ({ ...s, [id]: status }));

  const statusColor = (s) => {
    if (s === 'approved') return 'text-guayana-600 bg-guayana-50';
    if (s === 'rejected') return 'text-red-500 bg-red-50';
    return 'text-amber-500 bg-amber-50';
  };

  const counts = {
    total: observations.length,
    approved: Object.values(statuses).filter(s => s === 'approved').length,
    rejected: Object.values(statuses).filter(s => s === 'rejected').length,
    pending: observations.length - Object.keys(statuses).length,
  };

  return (
    <div className="pb-20 max-w-lg mx-auto">
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Curación de Dataset</h1>
          <p className="text-xs text-gray-500">Datos para entrenamiento de IA</p>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Total', value: counts.total, color: 'text-gray-700' },
            { label: 'Aprobados', value: counts.approved, color: 'text-guayana-600' },
            { label: 'Rechazados', value: counts.rejected, color: 'text-red-500' },
            { label: 'Pendientes', value: counts.pending, color: 'text-amber-500' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-2 text-center shadow-sm">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {observations.map(obs => {
            const status = statuses[obs.id];
            return (
              <div key={obs.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex gap-3 p-3">
                  <img src={obs.image} alt={obs.commonName} className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                    onError={e => { e.target.src = 'https://placehold.co/64x64/16a34a/white?text=?'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{obs.commonName}</p>
                    <p className="text-xs italic text-gray-500 truncate">{obs.species}</p>
                    <p className="text-xs text-gray-400">@{obs.user} · {obs.date}</p>
                    <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(status)}`}>
                      {status === 'approved' ? <CheckCircle size={10} /> : status === 'rejected' ? <XCircle size={10} /> : <Clock size={10} />}
                      {status === 'approved' ? 'Aprobado' : status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                    </div>
                  </div>
                </div>
                {!status && (
                  <div className="flex border-t border-gray-100">
                    <button
                      onClick={() => setStatus(obs.id, 'approved')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-guayana-600 hover:bg-guayana-50 transition-colors"
                    >
                      <CheckCircle size={16} /> Aprobar
                    </button>
                    <div className="w-px bg-gray-100" />
                    <button
                      onClick={() => setStatus(obs.id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <XCircle size={16} /> Rechazar
                    </button>
                  </div>
                )}
                {status && (
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => setStatuses(s => { const n = { ...s }; delete n[obs.id]; return n; })}
                      className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cambiar decisión
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
