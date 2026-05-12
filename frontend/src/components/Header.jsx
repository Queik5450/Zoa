import React from 'react';

function Header() {
  return (
    <header className="relative z-10 h-[88px] w-full shrink-0">
      <div className="absolute inset-x-0 top-0 h-[88px]">
        <svg
          viewBox="0 0 400 90"
          className="h-full w-full"
          preserveAspectRatio="none"
          style={{ filter: 'drop-shadow(0px 3px 4px rgba(0,0,0,0.12))' }}
        >
          <path d="M 0 0 L 400 0 L 400 90 Q 200 72 0 90 Z" fill="#c1e14f" />
        </svg>
      </div>
      <div className="absolute inset-x-0 top-0 flex h-[72px] items-center justify-center">
        <h1 className="mt-1 text-3xl font-black tracking-[0.2em] text-black">ZOA</h1>
      </div>
    </header>
  );
}

export default Header;
