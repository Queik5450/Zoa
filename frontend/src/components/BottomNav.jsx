import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import camaraSvg from './icons/camara.svg?raw';
import homeSvg from './icons/home.svg?raw';
import perfilSvg from './icons/perfil.svg?raw';
import mapaSvg from './icons/mapa.svg?raw';
import miZoologicoSvg from './icons/Book.svg?raw';

const ACCENT = '#96b232'; // Aproximado al verde oscuro de la imagen
const MUTED = '#7B7B7B';

const cleanSvgColors = (svg, color) => {
  if (!svg) return '';
  let cleaned = svg.replace(/fill="([^"]+)"/gi, (match, p1) => {
    if (p1.toLowerCase() === 'none' || p1.toLowerCase() === '#ffffff' || p1.toLowerCase() === 'white') return match;
    return `fill="${color}"`;
  });
  cleaned = cleaned.replace(/stroke="([^"]+)"/gi, (match, p1) => {
    if (p1.toLowerCase() === 'none') return match;
    return `stroke="${color}"`;
  });
  cleaned = cleaned.replace(/filter="url\(#.*?\)"/gi, '');
  return cleaned;
};

function NavItem({ active, svgRaw, label, onClick }) {
  const color = active ? ACCENT : MUTED;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`appearance-none border-0 bg-transparent p-0 text-inherit outline-none relative flex flex-col items-center justify-center pt-2 transition-all ${
        active ? 'opacity-100' : 'opacity-80'
      }`}
    >
      <span
        className="flex h-[26px] w-[26px] shrink-0 items-center justify-center bg-transparent [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: cleanSvgColors(svgRaw, color) }}
      />
      <span
        className={`mt-1 truncate text-center text-[11px] font-bold leading-none tracking-tight ${active ? 'text-[#96b232]' : 'text-[#7B7B7B]'}`}
      >
        {label}
      </span>
    </button>
  );
}

/** Barra inferior estilo mock "Parte abajo": blanca con hendidura central y FAB con gradiente. */
function BottomNav({ isScanning, onFileChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const path = location.pathname;

  const isHome = path === '/' || path === '';
  const isMap = path.startsWith('/map');
  const isAlbum = path.startsWith('/album');
  const isProfile = path.startsWith('/profile');

  return (
    <div
      className="relative h-[var(--zoa-bottom-height)] w-[100vw] [margin-left:calc(50%-50vw)]"
    >
      <svg
        viewBox="0 0 405 78"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 block h-full w-full"
        aria-hidden="true"
      >
        <path d="M141.601 13.9629C150.416 22.7978 158.193 28.809 167.59 32.916C177.067 37.0578 188.12 39.2322 203.425 40.4971L203.49 40.502L203.556 40.499C217.209 39.8456 225.498 38.1983 234.207 34.1572C242.804 30.1683 251.805 23.8429 266.815 13.9727L404 1.09863V77H1V1.0957L141.601 13.9629Z" fill="white" stroke="#7B7B7B" strokeWidth="2" />
      </svg>

      <div className="absolute inset-x-0 bottom-0 flex h-[calc(var(--zoa-bottom-height)-16px)] w-full items-end px-2 pb-1">
        <div className="flex w-[40%] items-end justify-around pr-1">
          <NavItem active={isHome} svgRaw={homeSvg} label="Inicio" onClick={() => navigate('/')} />
          <NavItem active={isMap} svgRaw={mapaSvg} label="Mapa" onClick={() => navigate('/map')} />
        </div>
        <div className="w-[20%]" />
        <div className="flex w-[40%] items-end justify-around pl-1">
          <NavItem active={isAlbum} svgRaw={miZoologicoSvg} label="Mi Album" onClick={() => navigate('/album')} />
          <NavItem active={isProfile} svgRaw={perfilSvg} label="Perfil" onClick={() => navigate('/profile')} />
        </div>
      </div>

      <div className="absolute bottom-[22px] left-1/2 z-30 -translate-x-1/2 rounded-full bg-white p-1">
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
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-0 bg-[#96b232] shadow-[0_8px_16px_rgba(0,0,0,0.3)] outline-none transition-transform active:scale-95 disabled:cursor-not-allowed"
          aria-label="Abrir cámara"
        >
          {isScanning ? (
            <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/70 border-t-transparent" />
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
              aria-hidden
              dangerouslySetInnerHTML={{ __html: cleanSvgColors(camaraSvg, '#ffffff') }}
            />
          )}
        </button>
      </div>
    </div>
  );
}

export default BottomNav;
