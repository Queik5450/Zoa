import React, { useRef } from 'react';
import { Home as HomeIcon, Loader2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import camaraSvg from './incons/camara.svg?raw';

const tintSvg = (svg, color) =>
  svg.replace(/fill="(?:#7B7B7B|#7b7b7b|white|#FFFFFF)"/g, `fill="${color}"`);

function BottomNav({ isScanning, onFileChange }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative mt-auto h-[90px] w-full">
      <div className="absolute bottom-0 w-full h-[90px]">
        <svg viewBox="0 0 400 90" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M 0 35 L 140 35 C 160 35 170 80 200 80 C 230 80 240 35 260 35 L 400 35 L 400 90 L 0 90 Z"
            fill="#cbea30"
          />
        </svg>
      </div>

      <div className="absolute bottom-0 w-full h-[55px] flex justify-between px-16 items-center">
        <HomeIcon
          size={40}
          className="text-black fill-black cursor-pointer"
          onClick={() => navigate('/')}
        />
        <User
          size={40}
          strokeWidth={3}
          className="text-black cursor-pointer"
          onClick={() => navigate('/profile')}
        />
      </div>

      <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2">
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