import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import NewObservation from './pages/NewObservation';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Identify from './pages/Identify';
import Dataset from './pages/Dataset';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<><Home /><Navbar /></>} />
            <Route path="/explore" element={<><Explore /><Navbar /></>} />
            <Route path="/new-observation" element={<><NewObservation /><Navbar /></>} />
            <Route path="/feed" element={<><Feed /><Navbar /></>} />
            <Route path="/profile" element={<><Profile /><Navbar /></>} />
            <Route path="/identify" element={<><Identify /><Navbar /></>} />
            <Route path="/dataset" element={<><Dataset /><Navbar /></>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
