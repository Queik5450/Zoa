import React from 'react';

/**
 * Cabecera "Parte arriba": imagen de fondo con texto ZOA centrado.
 */
function Header() {
  return (
    <header className="relative left-1/2 z-30 w-screen -translate-x-1/2 shrink-0">
      <svg
        viewBox="0 0 406 89"
        preserveAspectRatio="none"
        className="block h-[var(--zoa-header-height)] w-screen overflow-visible shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
        role="img"
        aria-label="ZOA"
      >
        <path d="M0 0H406V89C248.6 70.4334 159.935 69.6625 0 89V0Z" fill="#C1E734" />
        <text
          x="50%"
          y="36%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#000000"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '32px', fontWeight: 800 }}
        >
          ZOA
        </text>
      </svg>
    </header>
  );
}

export default Header;
