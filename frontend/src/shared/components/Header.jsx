import React from 'react';
import logo from '../assets/icons/logo.png';

/**
 * Cabecera "Parte arriba": imagen de fondo con el logo centrado.
 */
function Header({ compact = false }) {
  const headerHeightClass = compact ? 'h-[clamp(96px,24vw,122px)]' : 'h-[var(--zoa-header-height)]';
  // Aumenta considerablemente el tamaño del logo cuando se requiera
  const logoHeightClass = compact ? 'h-[clamp(80px,30vw,220px)]' : 'h-[clamp(100px,35vw,260px)]';

  return (
    <header className={`relative z-30 w-[100vw] shrink-0 [margin-left:calc(50%-50vw)] ${headerHeightClass}`}>
      <div className="relative h-full w-full overflow-hidden shadow-[0_6px_14px_rgba(0,0,0,0.14)]">
        <svg
          viewBox="0 0 406 89"
          preserveAspectRatio="none"
          className="block h-full w-full"
          role="img"
          aria-label="ZOA"
        >
          <path d="M0 0H406V89C248.6 70.4334 159.935 69.6625 0 89V0Z" fill="#C1E734" />
        </svg>
        <img
          src={logo}
          alt="Zoa"
          className={`pointer-events-none absolute left-1/2 top-1/2 w-auto max-w-[96%] -translate-x-1/2 -translate-y-1/2 object-contain ${logoHeightClass} `}
        />
      </div>
    </header>
  );
}

export default Header;
