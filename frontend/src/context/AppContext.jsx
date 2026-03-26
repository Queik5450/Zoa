import { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchObservations, 
  createObservation, 
  likeObservationDb, 
  createComment, 
  fetchComments 
} from '../api';

const AppContext = createContext();

const mockUser = { id: 1, username: "explorer_gyn", name: "Explorer Guayana", bio: "Naturalista del Escudo Guayanés 🌿", observations: 12, followers: 45, following: 30 };

export function AppProvider({ children }) {
  const [observations, setObservations] = useState([]);
  const [comments, setComments] = useState({});
  const [currentUser, setCurrentUser] = useState(mockUser);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const obsData = await fetchObservations();
        // Backend returns oldest first generally, frontend prefers newest first often
        setObservations(obsData.reverse());
        
        // Optionally preorder load all comments or load them on demand.
        // For simplicity, we can just load them on demand in the observation card 
        // or loop over them. Let's loop and load them so standard behaviour is intact:
        const allComments = {};
        for (let o of obsData) {
          allComments[o.id] = await fetchComments(o.id);
        }
        setComments(allComments);
      } catch (e) {
        console.error("Failed to load backend data", e);
      }
    };
    loadData();
  }, []);

  const addObservation = async (obs) => {
    try {
      const data = {
        species: obs.species,
        commonName: obs.commonName,
        lat: obs.lat,
        lng: obs.lng,
        user: currentUser.username,
        notes: obs.notes,
        image: obs.image
      };
      const newObs = await createObservation(data);
      setObservations(prev => [newObs, ...prev]);
      return newObs;
    } catch (e) {
      console.error(e);
    }
  };

  const likeObservation = async (id) => {
    try {
      const updatedObs = await likeObservationDb(id, currentUser.username);
      setObservations(prev => prev.map(obs => obs.id === id ? updatedObs : obs));
    } catch (e) {
      console.error(e);
    }
  };

  const addComment = async (obsId, text) => {
    try {
      const newComment = await createComment(obsId, { user: currentUser.username, text });
      setComments(prev => ({ ...prev, [obsId]: [...(prev[obsId] || []), newComment] }));
      setObservations(prev => prev.map(obs => obs.id === obsId ? { ...obs, comments: obs.comments + 1 } : obs));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider value={{ 
      observations, 
      comments, 
      currentUser, 
      isLoggedIn, 
      addObservation, 
      likeObservation, 
      addComment, 
      setIsLoggedIn,
      setObservations 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
