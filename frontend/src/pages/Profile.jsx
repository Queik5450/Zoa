import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col p-6 max-w-md mx-auto relative font-sans">
      <header className="flex items-center mb-8">
        <ArrowLeft size={32} className="cursor-pointer" onClick={() => navigate(-1)} />
        <h1 className="text-3xl font-extrabold ml-4">Perfil</h1>
      </header>
      
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mb-4">
          <User size={48} className="text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold">Guayanadex Explorer</h2>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm text-center">
        <p className="font-bold text-lg">0 Especies descubiertas</p>
      </div>
    </div>
  );
}

export default Profile;