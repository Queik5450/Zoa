import React from 'react';
import { Camera, Map, BookOpen, Menu } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-green-50 flex flex-col font-sans">
      {/* Navbar Minimal */}
      <header className="bg-green-700 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold tracking-widest">ZOA</h1>
        <Menu size={24} className="cursor-pointer" />
      </header>

      {/* Zona Principal */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-green-900 mb-2">Biodiversidad Activa</h2>
          <p className="text-green-700 max-w-sm mx-auto">Inicia un escaneo para registrar flora y fauna en la Guayana Venezolana.</p>
        </div>

        {/* Botón Scanner principal */}
        <button className="bg-green-600 hover:bg-green-500 text-white rounded-full p-10 shadow-xl transform transition hover:scale-105 active:scale-95">
          <Camera size={64} />
        </button>
        <p className="text-sm font-semibold text-green-800 uppercase tracking-widest">Tocar para Escanear</p>
      </main>

      {/* Bottom Nav */}
      <nav className="bg-white border-t border-green-200 flex justify-around p-4 pb-6">
        <button className="flex flex-col items-center text-green-600">
          <Map size={24} />
          <span className="text-xs mt-1 font-medium">Mapa</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 hover:text-green-600">
          <BookOpen size={24} />
          <span className="text-xs mt-1 font-medium">GuayanaDex</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
