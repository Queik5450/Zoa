import { useState, useRef } from 'react';
import { ChevronLeft, Camera, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { identifySpeciesApi } from '../api';

export default function Identify() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInput = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const identify = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const result = await identifySpeciesApi(image);
      setResults(result.suggestions);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 max-w-lg mx-auto">
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Identificar Especie</h1>
          <p className="text-xs text-gray-500">IA para fauna guayanesa</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div
          onClick={() => fileInput.current?.click()}
          className="w-full h-56 bg-gray-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden border-2 border-dashed border-gray-300"
        >
          {image ? (
            <img src={image} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera size={36} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 font-medium">Subir foto para identificar</p>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP</p>
            </>
          )}
        </div>
        <input ref={fileInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />

        <button
          onClick={identify}
          disabled={!image || loading}
          className="w-full bg-guayana-600 text-white font-semibold py-3 rounded-2xl hover:bg-guayana-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Analizando...</> : '🔍 Identificar Especie'}
        </button>

        {results && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900">Sugerencias</h2>
            {results.map((r, i) => (
              <div key={i} className={`flex gap-3 p-3 rounded-2xl border ${i === 0 ? 'border-guayana-300 bg-guayana-50' : 'border-gray-100 bg-white'}`}>
                <img src={r.image} alt={r.commonName} className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                  onError={e => { e.target.src = 'https://placehold.co/64x64/16a34a/white?text=?'; }} />
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="font-semibold text-sm">{r.commonName}</p>
                    {i === 0 && <CheckCircle size={14} className="text-guayana-600" />}
                  </div>
                  <p className="text-xs italic text-gray-500 mb-2">{r.species}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-guayana-500 h-1.5 rounded-full" style={{ width: `${r.confidence}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-guayana-700">{r.confidence}%</span>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => navigate('/new-observation')} className="w-full border border-guayana-600 text-guayana-600 font-semibold py-2.5 rounded-2xl text-sm hover:bg-guayana-50 transition-colors">
              Registrar Observación
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
