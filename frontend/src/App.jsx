import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MobileShell from './shared/layouts/MobileShell';
import Home from './features/home/pages/Home';
import AuthPage from './features/auth/pages/Auth';
import AnalysisPage from './features/analysis/pages/Analysis';
import MenuPage from './features/menu/pages/Menu';
import Profile from './features/profile/pages/Profile';
import Map from './features/map/pages/Map';
import Album from './features/album/pages/Album';
import AlbumImageDetail from './features/album/pages/AlbumImageDetail';
import AlbumAudioDetail from './features/album/pages/AlbumAudioDetail';
import AlbumSpeciesDetail from './features/album/pages/AlbumSpeciesDetail';
import Publicacion from './features/publicacion/pages/Publicacion';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MobileShell />}>
          <Route index element={<Home />} />
          <Route path="map" element={<Map />} />
          <Route path="publicacion" element={<Publicacion />} />
          <Route path="album/imagen/:id" element={<AlbumImageDetail />} />
          <Route path="album/audio/:id" element={<AlbumAudioDetail />} />
          <Route path="album/especie/:speciesId" element={<AlbumSpeciesDetail />} />
          <Route path="album" element={<Album />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/menu" element={<MenuPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
