import React from 'react';
import logo from '../shared/assets/icons/logo.png';

/**
 * Cabecera "Parte arriba": imagen de fondo con el logo centrado.
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
        </svg>
        <img
          src={logo}
          alt="Zoa"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[clamp(88px,24vw,136px)] w-auto max-w-[96%] -translate-x-1/2 -translate-y-1/2 object-contain"
        />
      </div>
    </header>
  );
}

export default Header;
