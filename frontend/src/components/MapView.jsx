import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const verifiedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const unverifiedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

export default function MapView({ observations = [], height = '400px', onMapClick }) {
  const navigate = useNavigate();

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden">
      <MapContainer
        center={[6.5, -62.0]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        onClick={onMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {observations.map(obs => (
          <Marker
            key={obs.id}
            position={[obs.lat, obs.lng]}
            icon={obs.verified ? verifiedIcon : unverifiedIcon}
          >
            <Popup>
              <div className="text-sm w-40">
                <img src={obs.image} alt={obs.commonName} className="w-full h-24 object-cover rounded mb-1"
                  onError={e => { e.target.src = 'https://placehold.co/160x96/16a34a/white?text=Sin+Imagen'; }} />
                <strong className="block">{obs.commonName}</strong>
                <em className="text-gray-500 text-xs">{obs.species}</em>
                <p className="text-xs mt-1">@{obs.user} · {obs.date}</p>
                <button onClick={() => navigate('/feed')} className="mt-1 text-xs text-guayana-600 underline">
                  Ver detalles
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
