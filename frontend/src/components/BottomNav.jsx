import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import camaraSvg from './incons/camara.svg?raw';
import homeSvg from './incons/home.svg?raw';
import perfilSvg from './incons/perfil.svg?raw';
import mapaSvg from './incons/mapa.svg?raw';
import miZoologicoSvg from './incons/Book.svg?raw';

// Función para cambiar el color de los íconos SVG

const tintSvg = (svg, color) =>
  svg.replace(/fill="(?:#7B7B7B|#7b7b7b|white|#FFFFFF|none)"/g, `fill="${color}"`);

function BottomNav({ isScanning, onFileChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative mt-auto h-[100px] w-full">
      <div className="absolute bottom-0 w-full h-[93px]">
        <svg viewBox="0 0 400 90" className="w-full h-full" preserveAspectRatio="none" style={{ filter: 'drop-shadow(0px -2px 4px rgba(0,0,0,0.1))' }}>
          <path
            d="M 0 35 L 140 35 C 160 35 170 80 200 80 C 230 80 240 35 260 35 L 400 35 L 400 90 L 0 90 Z"
            fill="#ffffff"
            stroke="#9bb51e"
            strokeWidth="3"
          />
        </svg>
      </div>

      <div className="absolute bottom-0 w-full h-[120px] flex justify-between px-10 items-center">
        {/* Left icons */}
        <div className="flex w-[32%] justify-between px-2 items-center pt-2">
          <div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => navigate('/')}>
            <span
              className="h-10 w-10 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: tintSvg(homeSvg, location.pathname === '/' ? '#9bb51e' : '#7B7B7B') }}
            />
            <span className={`text-xs mt-1 ${location.pathname === '/' ? 'text-[#9bb51e] font-semibold' : 'text-[#7B7B7B]'}`}>Inicio</span>
          </div>
          <div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => navigate('/profile')}>
            <span
              className="h-10 w-10 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: tintSvg(perfilSvg, location.pathname === '/profile' ? '#9bb51e' : '#7B7B7B') }}
            />
            <span className={`text-xs mt-1 ${location.pathname === '/profile' ? 'text-[#9bb51e] font-semibold' : 'text-[#7B7B7B]'}`}>Perfil</span>
          </div>
        </div>

        {/* Right icons */}
        <div className="flex w-[32%] justify-between px-2 items-center pt-2">
          <div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => navigate('/map')}>
            <span
              className="h-10 w-10 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: tintSvg(mapaSvg, location.pathname === '/map' ? '#9bb51e' : '#7B7B7B') }}
            />
            <span className={`text-xs mt-1 ${location.pathname === '/map' ? 'text-[#9bb51e] font-semibold' : 'text-[#7B7B7B]'}`}>Mapa</span>
          </div>
          <div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => navigate('/zoo')}>
            <span
              className="h-10 w-10 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: tintSvg(miZoologicoSvg, location.pathname === '/zoo' ? '#9bb51e' : '#7B7B7B') }}
            />
            <span className={`text-xs mt-1 ${location.pathname === '/zoo' ? 'text-[#9bb51e] font-semibold' : 'text-[#7B7B7B]'}`}>Mi Zoológico</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleCameraClick}
          disabled={isScanning}
          className="flex h-[82px] w-[82px] items-center justify-center rounded-full border-[8px] border-[#f9f9f9] bg-[#9bb51e] shadow-[0_10px_20px_rgba(0,0,0,0.18)] outline-none transition-transform hover:scale-105 active:scale-95 z-20 disabled:cursor-not-allowed"
          aria-label="Abrir cámara"
        >
          {isScanning ? (
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/70 border-t-transparent" />
          ) : (
            <span
              className="h-9 w-[40px]"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: tintSvg(camaraSvg, '#ffffff') }}
            />
          )}
        </button>
      </div>
    </div>
  );
}

export default BottomNav;