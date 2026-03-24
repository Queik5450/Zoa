import { Link, useLocation } from 'react-router-dom';
import { Home, Map, PlusCircle, BookOpen, User } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const links = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/explore', icon: Map, label: 'Explorar' },
    { to: '/new-observation', icon: PlusCircle, label: 'Registrar', primary: true },
    { to: '/feed', icon: BookOpen, label: 'Feed' },
    { to: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {links.map(({ to, icon: Icon, label, primary }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} className="flex flex-col items-center justify-center flex-1 py-1 group">
              {primary ? (
                <div className="bg-guayana-600 rounded-full p-2.5 -mt-5 shadow-lg group-hover:bg-guayana-700 transition-colors">
                  <Icon size={24} className="text-white" />
                </div>
              ) : (
                <Icon size={22} className={active ? 'text-guayana-600' : 'text-gray-400 group-hover:text-gray-600'} />
              )}
              <span className={`text-xs mt-1 ${primary ? 'text-guayana-600 font-medium' : active ? 'text-guayana-600 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
