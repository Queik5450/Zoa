import React from 'react';
import { Menu as MenuIcon, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="relative z-10 bg-[#cbea30] pb-4 pt-6 px-6 flex justify-between items-center shadow-sm h-20">
      <MenuIcon size={32} strokeWidth={3} className="text-black cursor-pointer" onClick={() => navigate('/menu')} />
      <h1 className="text-3xl font-extrabold tracking-widest text-black">ZOA</h1>
      <Search size={32} strokeWidth={3} className="text-black cursor-pointer" />
    </header>
  );
}

export default Header;
