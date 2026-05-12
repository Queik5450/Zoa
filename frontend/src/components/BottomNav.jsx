import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import camaraSvg from './incons/camara.svg?raw';
import homeSvg from './incons/home.svg?raw';
import perfilSvg from './incons/perfil.svg?raw';
import mapaSvg from './incons/mapa.svg?raw';
import miZoologicoSvg from './incons/Book.svg?raw';

const ACCENT = '#c1e14f';
const MUTED = '#7B7B7B';

const tintSvg = (svg, color) =>
  svg.replace(/fill="(?:#7B7B7B|#7b7b7b|white|#FFFFFF|none)"/g, `fill="${color}"`);

function NavItem({ active, svgRaw, label, onClick }) {
  const color = active ? ACCENT : MUTED;
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-0.5 pb-0.5">
      <span
        className="flex h-11 w-11 items-center justify-center"
        dangerouslySetInnerHTML={{ __html: tintSvg(svgRaw, color) }}
      />
      <span className={`text-[10px] font-semibold ${active ? 'text-[#c1e14f]' : 'text-neutral-500'}`}>{label}</span>
    </button>
  );
}

function BottomNav({ isScanning, onFileChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const path = location.pathname;

  const isHome = path === '/' || path === '';
  const isMap = path.startsWith('/map');
  const isAlbum = path.startsWith('/album');
  const isProfile = path.startsWith('/profile');

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative mt-auto h-[118px] w-full shrink-0">
      <div className="absolute bottom-0 h-[102px] w-full">
        <svg
          viewBox="0 0 400 92"
          className="h-full w-full"
          preserveAspectRatio="none"
          style={{ filter: 'drop-shadow(0px -2px 5px rgba(0,0,0,0.08))' }}
        >
          <path
            d="M 0 38 L 138 38 C 158 38 168 84 200 84 C 232 84 242 38 262 38 L 400 38 L 400 92 L 0 92 Z"
            fill="#ffffff"
            stroke="#e8e8e8"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="absolute bottom-2 flex w-full items-end justify-between px-5 pb-1">
        <div className="flex w-[34%] justify-between gap-1 pr-1">
          <NavItem active={isHome} svgRaw={homeSvg} label="Inicio" onClick={() => navigate('/')} />
          <NavItem active={isMap} svgRaw={mapaSvg} label="Mapa" onClick={() => navigate('/map')} />
        </div>
        <div className="w-[76px]" aria-hidden />
        <div className="flex w-[34%] justify-between gap-1 pl-1">
          <NavItem active={isAlbum} svgRaw={miZoologicoSvg} label="Mi Album" onClick={() => navigate('/album')} />
          <NavItem active={isProfile} svgRaw={perfilSvg} label="Perfil" onClick={() => navigate('/profile')} />
        </div>
      </div>

      <div className="absolute bottom-[38%] left-1/2 z-20 -translate-x-1/2">
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onFileChange} className="hidden" />
        <button
          type="button"
          onClick={handleCameraClick}
          disabled={isScanning}
          className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#c1e14f] shadow-[0_10px_22px_rgba(193,225,79,0.55)] outline-none ring-4 ring-white transition-transform active:scale-95 disabled:cursor-not-allowed"
          aria-label="Abrir cámara"
        >
          {isScanning ? (
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/70 border-t-transparent" />
          ) : (
            <span
              className="h-9 w-[40px]"
              aria-hidden
              dangerouslySetInnerHTML={{ __html: tintSvg(camaraSvg, '#ffffff') }}
            />
          )}
        </button>
      </div>
    </div>
  );
}

export default BottomNav;
