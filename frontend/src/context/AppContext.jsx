import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

const mockObservations = [
  { id: 1, species: "Ara macao", commonName: "Guacamayo Escarlata", lat: 6.3, lng: -61.5, user: "carlos_bio", date: "2024-03-15", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Beautiful_red_macaw.jpg/640px-Beautiful_red_macaw.jpg", likes: 24, comments: 5, verified: true, notes: "Observado en el Parque Nacional Canaima, volando en grupos de 3.", likedBy: [] },
  { id: 2, species: "Pteronura brasiliensis", commonName: "Nutria Gigante", lat: 7.2, lng: -63.1, user: "maria_eco", date: "2024-03-20", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Pteronura_brasiliensis_-_giant_otter.jpg/640px-Pteronura_brasiliensis_-_giant_otter.jpg", likes: 31, comments: 8, verified: true, notes: "Familia de 5 individuos en el río Caroní.", likedBy: [] },
  { id: 3, species: "Morpho helenor", commonName: "Mariposa Morpho", lat: 5.8, lng: -62.3, user: "ana_nat", date: "2024-04-01", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Beautiful_blue_morpho_butterfly.jpg/640px-Beautiful_blue_morpho_butterfly.jpg", likes: 15, comments: 2, verified: false, notes: "Especie azul iridiscente en el sotobosque.", likedBy: [] },
  { id: 4, species: "Tapirus terrestris", commonName: "Tapir Amazónico", lat: 6.8, lng: -63.5, user: "pedro_campo", date: "2024-04-05", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Tapirus_terrestris_001.JPG/640px-Tapirus_terrestris_001.JPG", likes: 42, comments: 12, verified: true, notes: "Huellas frescas cerca del río y avistamiento al anochecer.", likedBy: [] },
  { id: 5, species: "Harpia harpyja", commonName: "Águila Arpía", lat: 7.5, lng: -61.8, user: "luis_bird", date: "2024-04-10", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Harpia_harpyja_001.jpg/640px-Harpia_harpyja_001.jpg", likes: 58, comments: 18, verified: true, notes: "Nido activo con un polluelo, zona de tepuyes.", likedBy: [] }
];

const mockComments = {
  1: [{ id: 1, user: "maria_eco", text: "¡Increíble avistamiento!", date: "2024-03-16" }, { id: 2, user: "ana_nat", text: "Hermoso ejemplar.", date: "2024-03-17" }],
  2: [{ id: 1, user: "carlos_bio", text: "Especie en peligro, qué alegría verla.", date: "2024-03-21" }],
  3: [],
  4: [{ id: 1, user: "luis_bird", text: "¿Zona protegida?", date: "2024-04-06" }],
  5: [{ id: 1, user: "pedro_campo", text: "El rey del cielo amazónico.", date: "2024-04-11" }],
};

const mockUser = { id: 1, username: "explorer_gyn", name: "Explorer Guayana", bio: "Naturalista del Escudo Guayanés 🌿", observations: 12, followers: 45, following: 30 };

export function AppProvider({ children }) {
  const [observations, setObservations] = useState(mockObservations);
  const [comments, setComments] = useState(mockComments);
  const [currentUser, setCurrentUser] = useState(mockUser);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const addObservation = (obs) => {
    const newObs = { ...obs, id: observations.length + 1, likes: 0, comments: 0, verified: false, likedBy: [], user: currentUser.username, date: new Date().toISOString().split('T')[0] };
    setObservations(prev => [newObs, ...prev]);
    return newObs;
  };

  const likeObservation = (id) => {
    setObservations(prev => prev.map(obs => {
      if (obs.id === id) {
        const alreadyLiked = obs.likedBy.includes(currentUser.username);
        return {
          ...obs,
          likes: alreadyLiked ? obs.likes - 1 : obs.likes + 1,
          likedBy: alreadyLiked ? obs.likedBy.filter(u => u !== currentUser.username) : [...obs.likedBy, currentUser.username]
        };
      }
      return obs;
    }));
  };

  const addComment = (obsId, text) => {
    const newComment = { id: Date.now(), user: currentUser.username, text, date: new Date().toISOString().split('T')[0] };
    setComments(prev => ({ ...prev, [obsId]: [...(prev[obsId] || []), newComment] }));
    setObservations(prev => prev.map(obs => obs.id === obsId ? { ...obs, comments: obs.comments + 1 } : obs));
  };

  return (
    <AppContext.Provider value={{ observations, comments, currentUser, isLoggedIn, addObservation, likeObservation, addComment, setIsLoggedIn }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
