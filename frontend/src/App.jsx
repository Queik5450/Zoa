import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MobileShell from './layouts/MobileShell';
import Home from './pages/Home';
import AuthPage from './pages/Auth';
import AnalysisPage from './pages/Analysis';
import MenuPage from './pages/Menu';
import Profile from './pages/Profile';
import Map from './pages/Map';
import Album from './pages/Album';
import AlbumImageDetail from './pages/AlbumImageDetail';
import AlbumAudioDetail from './pages/AlbumAudioDetail';
import AlbumSpeciesDetail from './pages/AlbumSpeciesDetail';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MobileShell />}>
          <Route index element={<Home />} />
          <Route path="map" element={<Map />} />
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
