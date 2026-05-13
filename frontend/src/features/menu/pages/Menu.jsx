import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function MenuPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col p-6 max-w-md mx-auto relative font-sans">
      <header className="flex items-center mb-8">
        <ArrowLeft size={32} className="cursor-pointer" onClick={() => navigate(-1)} />
        <h1 className="text-3xl font-extrabold ml-4">Menú</h1>
      </header>
      <div className="flex flex-col gap-4">
        <button className="bg-white p-4 rounded-xl shadow-sm text-left text-lg font-bold">Ajustes</button>
        <button className="bg-white p-4 rounded-xl shadow-sm text-left text-lg font-bold">Acerca de Zoa</button>
      </div>
    </div>
  );
}

export default MenuPage;