import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, LogIn, UserPlus } from 'lucide-react';
import { getMockAuth, getPendingScan, setMockAuth } from '../utils/scanFlow';

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const pendingScan = useMemo(() => getPendingScan(), []);

  useEffect(() => {
    if (!pendingScan) {
      navigate('/', { replace: true });
      return;
    }

    if (getMockAuth()) {
      navigate('/analysis', { replace: true });
    }
  }, [navigate, pendingScan]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const displayName = (fullName || email.split('@')[0] || 'usuario').trim();

    setMockAuth({
      mode,
      displayName,
      email,
      authenticatedAt: Date.now(),
    });

    navigate('/analysis', { replace: true });
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(155,181,30,0.18),_transparent_38%),linear-gradient(180deg,_#f8f9f2_0%,_#f2f4eb_100%)] px-4 py-6">
      <div className="w-full max-w-md rounded-[32px] border border-black/5 bg-white/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.12)] backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-sm font-semibold text-black"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <div className="mb-6">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9bb51e] text-white shadow-[0_10px_20px_rgba(155,181,30,0.3)]">
            <Camera size={22} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-black">Antes de analizar</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Inicia sesión o crea tu cuenta para continuar con el análisis de la foto.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-full bg-neutral-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={mode === 'login' ? 'rounded-full bg-white py-2 text-black shadow-sm' : 'py-2 text-neutral-500'}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={mode === 'register' ? 'rounded-full bg-white py-2 text-black shadow-sm' : 'py-2 text-neutral-500'}
          >
            Registrarme
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-black">Nombre</label>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              type="text"
              placeholder="Tu nombre o usuario"
              className="h-12 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-sm outline-none placeholder:text-neutral-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-black">Correo</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              placeholder="correo@ejemplo.com"
              className="h-12 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-sm outline-none placeholder:text-neutral-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-black">Contraseña</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              placeholder="••••••••"
              className="h-12 w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 text-sm outline-none placeholder:text-neutral-400"
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#133c2e] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(19,60,46,0.24)] transition-transform active:scale-[0.98]"
          >
            {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
            {mode === 'login' ? 'Entrar y analizar' : 'Crear cuenta y analizar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;