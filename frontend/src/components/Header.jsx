import React from 'react';
import topSvgUrl from '../assets/top.svg?url';

/**
 * Cabecera "Parte arriba": imagen de fondo con texto ZOA centrado.
 */
function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 w-full shrink-0">
      <div className="mx-auto h-[var(--zoa-header-height)] w-full max-w-[var(--zoa-shell-width)]">
        <img
          src={topSvgUrl}
          alt=""
          aria-hidden="true"
          className="block h-full w-full object-fill shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
        />
      </div>
    </header>
  );
}

export default Header;
