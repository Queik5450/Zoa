import React from 'react';

/**
 * Cabecera "Parte arriba": imagen de fondo con texto ZOA centrado.
 */
function Header() {
  return (
    <header className="relative z-30 h-[var(--zoa-header-height)] w-[100vw] shrink-0 [margin-left:calc(50%-50vw)]">
      <div className="relative h-full w-full overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
        <svg
          viewBox="0 0 406 89"
          preserveAspectRatio="none"
          className="block h-full w-full"
          role="img"
          aria-label="ZOA"
        >
          <path d="M0 0H406V89C248.6 70.4334 159.935 69.6625 0 89V0Z" fill="#C1E734" />
          <text
            x="203"
            y="30"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#000000"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '32px', fontWeight: 800 }}
          >
            ZOA
          </text>
        </svg>
      </div>
    </header>
  );
}

export default Header;
