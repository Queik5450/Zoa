import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, ChevronLeft, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import AudioRecorder from '../components/AudioRecorder';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ onSelect }) {
  const [marker, setMarker] = useState(null);
  useMapEvents({
    click(e) {
      setMarker(e.latlng);
      onSelect(e.latlng);
    }
  });
  return marker ? <Marker position={marker} /> : null;
}

export default function NewObservation() {
  const navigate = useNavigate();
  const { addObservation } = useApp();
  const [form, setForm] = useState({ species: '', commonName: '', notes: '', date: new Date().toISOString().split('T')[0] });
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [location, setLocation] = useState(null);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const fileInput = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImageURL(URL.createObjectURL(file));
    }
  };

  const handleGPS = () => {
    navigator.geolocation?.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert('No se pudo obtener la ubicación.')
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.species || !location) {
      alert('Por favor completa la especie y ubicación.');
      return;
    }
    addObservation({
      ...form,
      lat: location.lat,
      lng: location.lng,
      image: imageURL || 'https://placehold.co/640x360/16a34a/white?text=Sin+Imagen',
    });
    setSuccess(true);
    setTimeout(() => navigate('/feed'), 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-guayana-600 flex flex-col items-center justify-center text-white px-6">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
          <Check size={40} className="text-guayana-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">¡Registrado!</h2>
        <p className="text-guayana-100 text-center">Tu observación fue enviada. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-lg mx-auto">
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Nueva Observación</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        {/* Photo */}
        <div
          onClick={() => fileInput.current?.click()}
          className="w-full h-48 bg-gray-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden border-2 border-dashed border-gray-300"
        >
          {imageURL ? (
            <img src={imageURL} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera size={32} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Toca para agregar foto</p>
            </>
          )}
        </div>
        <input ref={fileInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />

        {/* Species info */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre científico *</label>
            <input
              value={form.species}
              onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
              placeholder="Ej. Ara macao"
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-guayana-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre común</label>
            <input
              value={form.commonName}
              onChange={e => setForm(f => ({ ...f, commonName: e.target.value }))}
              placeholder="Ej. Guacamayo Escarlata"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-guayana-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-guayana-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Describe el avistamiento..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-guayana-400 resize-none"
            />
          </div>
        </div>

        {/* Audio */}
        <AudioRecorder />

        {/* Location */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-600">Ubicación *</label>
            <button type="button" onClick={handleGPS} className="flex items-center gap-1 text-xs text-guayana-600 font-medium hover:underline">
              <MapPin size={12} /> Usar GPS
            </button>
          </div>
          {location && (
            <p className="text-xs text-guayana-700 bg-guayana-50 px-3 py-1.5 rounded-lg">
              📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}
          <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: '200px' }}>
            <MapContainer center={[6.5, -62.0]} zoom={6} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker onSelect={loc => setLocation({ lat: loc.lat, lng: loc.lng })} />
            </MapContainer>
          </div>
          <p className="text-xs text-gray-400">Toca el mapa para seleccionar ubicación</p>
        </div>

        <button
          type="submit"
          className="w-full bg-guayana-600 text-white font-semibold py-3 rounded-2xl hover:bg-guayana-700 transition-colors text-sm"
        >
          Publicar Observación
        </button>
      </form>
    </div>
  );
}
