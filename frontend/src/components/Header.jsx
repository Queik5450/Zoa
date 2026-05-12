import React from 'react';

function Header() {
  return (
    <header className="relative w-full h-[90px] z-10">
      <div className="absolute top-0 w-full h-[90px]">
        <svg viewBox="0 0 400 90" className="w-full h-full" preserveAspectRatio="none" style={{ filter: 'drop-shadow(0px 3px 4px rgba(0,0,0,0.15))' }}>
          <path
            d="M 0 0 L 400 0 L 400 90 Q 200 70 0 90 Z"
            fill="#cbea30"
          />
        </svg>
      </div>
      <div className="absolute top-0 w-full h-[75px] flex justify-center items-center">
        <h1 className="text-3xl font-extrabold tracking-widest text-black mt-2">ZOA</h1>
      </div>
    </header>
  );
}

export default Header;
