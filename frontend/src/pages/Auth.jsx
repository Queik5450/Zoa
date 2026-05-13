import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import Header from '../components/Header';
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
    <div className="flex min-h-[100dvh] flex-col bg-[#eef3f8] font-sans">
      <Header />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-5">
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="mb-4 inline-flex items-center gap-2 self-start rounded-full border border-black/10 px-3 py-2 text-sm font-semibold text-black"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <h1 className="text-center text-xl font-bold text-black">Antes de analizar</h1>
        <p className="mt-2 px-2 text-center text-sm text-neutral-600">
          Inicia sesión o crea tu cuenta para continuar con el análisis de la foto.
        </p>

        <div className="mx-auto mt-5 grid w-full max-w-xs grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-xl border-2 border-black/25 bg-white py-3 text-center text-sm font-black shadow-sm ${
              mode === 'login' ? 'ring-2 ring-[#80902e] ring-offset-2' : ''
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-xl border-2 border-black/25 bg-white py-3 text-center text-sm font-black shadow-sm ${
              mode === 'register' ? 'ring-2 ring-[#80902e] ring-offset-2' : ''
            }`}
          >
            Registrarse
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-6 w-full space-y-4 rounded-3xl border-2 border-black/10 bg-[#80902e] p-6 shadow-[0_16px_40px_rgba(128,144,46,0.35)]"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white">Nombre</label>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              type="text"
              placeholder="Tu nombre o usuario"
              className="h-12 w-full rounded-2xl border border-black/5 bg-white px-4 text-sm text-black shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)] outline-none placeholder:text-neutral-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white">Correo</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              placeholder="correo@ejemplo.com"
              className="h-12 w-full rounded-2xl border border-black/5 bg-white px-4 text-sm text-black shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)] outline-none placeholder:text-neutral-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white">Contraseña</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              placeholder="••••••••"
              className="h-12 w-full rounded-2xl border border-black/5 bg-white px-4 text-sm text-black shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)] outline-none placeholder:text-neutral-400"
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#c1e14f] px-4 text-sm font-bold text-black shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-transform active:scale-[0.98]"
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