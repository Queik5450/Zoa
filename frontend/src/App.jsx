import React, { useState, useRef } from 'react';
import { Menu, Search, Home, User, Camera, MessageSquare, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const MOCK_CARD = [
  {
    id: 1,
    name: 'Desconocido',
    description: 'No hay datos disponibles.',
    location: 'No especificada',
    image: 'https://1000marcas.net/wp-content/uploads/2025/04/Signo-de-interrogacion.png'
  },

];

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Estados para el escaneo de IA
  const fileInputRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cards, setCards] = useState(MOCK_CARD);

  const activeCard = cards[activeIndex];

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Crear preview local instantáneo
    const localImageUrl = URL.createObjectURL(file);

    setIsScanning(true);
    setIsFlipped(false); // Volver al frente al escanear

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Llamar a nuestro backend Gemini (FastAPI)
      const response = await fetch('https://zoa-5p6r.onrender.com/api/scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al analizar la imagen');
      }

      const data = await response.json();
      
      // Agregar el nuevo resultado como una carta y moverse a ella
      const newCard = {
        id: data.id || Date.now(),
        name: data.common_name || 'Desconocido',
        description: data.description || 'Desconocido',
        location: data.scientific_name ? `Especie: ${data.scientific_name}` : 'No especificada',
        image: localImageUrl
      };

      setCards([newCard, ...cards]);
      setActiveIndex(0); // Enfocar la nueva imagen recién escaneada

    } catch (error) {
      console.error(error);
      alert('Hubo un error contactando la IA: ' + error.message);
    } finally {
      setIsScanning(false);
      // Limpiar el input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative h-[100dvh] w-full max-w-md mx-auto bg-[#f9f9f9] overflow-hidden flex flex-col font-sans">
      
      {/* Input oculto para la cámara */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Navbar */}
      <header className="relative z-10 bg-[#cbea30] pb-4 pt-6 px-6 flex justify-between items-center shadow-sm h-20">
        <Menu size={32} strokeWidth={3} className="text-black cursor-pointer" />
        <h1 className="text-3xl font-extrabold tracking-widest text-black">ZOA</h1>
        <Search size={32} strokeWidth={3} className="text-black cursor-pointer" />
      </header>
      
      {/* Curva debajo del header */}
      <div className="w-full h-8 bg-transparent relative z-10">
        <svg viewBox="0 0 400 30" className="w-full h-full" preserveAspectRatio="none">
          <path d="M 0 0 L 400 0 L 400 10 Q 200 40 0 10 Z" fill="#cbea30"/>
        </svg>
      </div>

      {/* Main Content - Card Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-0 mb-4 mt-2">
        <div 
          className="relative w-full max-w-[340px] aspect-[2/3.2] perspective-1000 cursor-pointer mx-auto"
          onClick={handleCardClick}
          style={{ perspective: "1000px" }}
        >
          <div 
            className="w-full h-full relative duration-500 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            style={{ 
              transformStyle: "preserve-3d", 
              transition: "transform 0.6s",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
          >
            
            {/* FRONT OF CARD */}
            <div 
              className="absolute inset-0 w-full h-full rounded-[2rem] overflow-hidden bg-white flex flex-col border-[6px] border-white/60"
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              <div className="flex-1 overflow-hidden relative">
                {isScanning ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10">
                    <Loader2 className="text-white animate-spin mb-2" size={48} />
                    <span className="text-white font-bold text-lg">Analizando especie...</span>
                  </div>
                ) : null}
                <img 
                  src={activeCard.image} 
                  alt={activeCard.name} 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="bg-[#cbea30] pt-4 pb-5 px-6 flex justify-between items-center h-24">
                <span className="text-2xl font-extrabold text-black">{isScanning ? 'Escaneando...' : activeCard.name}</span>
                <MessageSquare size={28} strokeWidth={3} className="text-black fill-black" />
              </div>
            </div>

            {/* BACK OF CARD */}
            <div 
              className="absolute inset-0 w-full h-full rounded-[2rem] bg-[#d9d9d9] p-8 flex flex-col border border-gray-200 shadow-inner z-20"
              style={{ 
                backfaceVisibility: "hidden", 
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)" 
              }}
            >
              <h2 className="text-3xl font-extrabold text-black mb-8 pt-2">{activeCard.name}</h2>
              
              <div className="mb-8 text-left">
                <h3 className="text-xl font-bold text-black mb-3">Descripción</h3>
                <p className="text-black text-[17px] font-bold leading-tight break-words overflow-y-auto max-h-[250px] custom-scrollbar">
                  {activeCard.description}
                </p>
              </div>

              <div className="text-left mt-auto pb-4">
                <h3 className="text-xl font-bold text-black mb-3">Ubicación</h3>
                <p className="text-black text-[17px] font-bold leading-tight break-words">
                  {activeCard.location}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex space-x-2 mt-6">
          {cards.map((_, idx) => (
            <div 
              key={idx} 
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                idx === activeIndex ? "bg-[#133c2e]" : "border border-gray-400 bg-transparent"
              )}
            />
          ))}
        </div>
      </main>

      {/* Bottom Navbar with Curvature for FAB */}
      <div className="relative mt-auto h-[90px] w-full">
        {/* Curva SVG para contener el botón */}
        <div className="absolute bottom-0 w-full h-[90px]">
          <svg viewBox="0 0 400 90" className="w-full h-full" preserveAspectRatio="none">
            <path 
                d="M 0 35 L 140 35 C 160 35 170 80 200 80 C 230 80 240 35 260 35 L 400 35 L 400 90 L 0 90 Z" 
                fill="#cbea30" 
            />
          </svg>
        </div>

        {/* Íconos Nav Bar Bottom */}
        <div className="absolute bottom-0 w-full h-[55px] flex justify-between px-16 items-center">
            <Home size={40} className="text-black fill-black cursor-pointer" />
            <User size={40} strokeWidth={3} className="text-black cursor-pointer" />
        </div>

        {/* Floating Action Button (Camera) */}
        <div className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2">
          <button 
            onClick={handleCameraClick}
            disabled={isScanning}
            className="bg-[#cbea30] w-24 h-24 rounded-full border-[8px] outline-none border-[#f9f9f9] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all z-20">
            {isScanning ? <Loader2 size={44} className="text-black animate-spin" /> : <Camera size={44} strokeWidth={3} className="text-black fill-black" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;