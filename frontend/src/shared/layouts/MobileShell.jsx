import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

export default function MobileShell() {
  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#eef3f8] font-sans [--zoa-shell-width:100vw] [--zoa-header-height:clamp(76px,24vw,97px)] [--zoa-bottom-height:clamp(64px,19vw,76px)]">
      <Header />

      <div className="mx-auto flex min-h-0 w-full max-w-[var(--zoa-shell-width)] flex-1 flex-col overflow-y-auto overflow-x-hidden px-0 pb-2">
        <Outlet />
      </div>

      <footer className="fixed inset-x-0 bottom-[-6px] z-50 w-full">
        <BottomNav />
      </footer>
    </div>
  );
}
