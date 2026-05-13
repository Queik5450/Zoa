import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { setMockAuth } from '../utils/scanFlow';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const displayName = (username || 'usuario').trim();
    setMockAuth({
      mode: 'login',
      displayName,
      email: username.includes('@') ? username : `${username}@zoa.local`,
      authenticatedAt: Date.now(),
    });
    navigate('/');
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white font-sans">
      <Header />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-10 pb-12 pt-16">
        <h1 className="text-center text-xl font-bold text-black">Iniciar Sesión</h1>
        <p className="mt-3 text-center text-sm text-black">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-semibold text-[#80902e] underline underline-offset-2">
            Regístrate
          </Link>
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 w-full space-y-5 rounded-[28px] bg-[#80902e] p-7 shadow-[0_18px_45px_rgba(128,144,46,0.38)]"
        >
          <div>
            <label className="mb-2 block text-xs font-semibold text-white">Username o correo electrónico</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 w-full rounded-2xl border border-black/5 bg-white px-4 text-sm text-black shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)] outline-none"
              placeholder=""
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-white">Contraseña</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="h-12 w-full rounded-2xl border border-black/5 bg-white px-4 text-sm text-black shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)] outline-none"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="mt-2 h-12 w-full rounded-2xl bg-[#c1e14f] text-sm font-bold text-black shadow-[0_8px_22px_rgba(0,0,0,0.14)]"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
