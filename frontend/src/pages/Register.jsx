import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', name: '' });
  const { setIsLoggedIn } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-guayana-700 to-guayana-900 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🌿</span>
          <h1 className="text-3xl font-bold text-white mt-2">BioGuayana</h1>
          <p className="text-guayana-200 text-sm mt-1">Únete a la comunidad</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Crear cuenta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Nombre completo', placeholder: 'Ana Naturalist', type: 'text' },
              { key: 'username', label: 'Usuario', placeholder: 'ana_nat', type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'ana@email.com', type: 'email' },
              { key: 'password', label: 'Contraseña', placeholder: '••••••••', type: 'password' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-guayana-400"
                />
              </div>
            ))}
            <button type="submit" className="w-full bg-guayana-600 text-white font-semibold py-3 rounded-xl hover:bg-guayana-700 transition-colors">
              Crear cuenta
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-guayana-600 font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
