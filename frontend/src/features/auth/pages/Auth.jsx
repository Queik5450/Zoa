import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import Header from '../../../shared/components/Header';
import { getMockAuth, getPendingScan, setMockAuth } from '../../../shared/lib/scanFlow';
import { hydrateMockAuthFromSession, signInWithGoogle } from '../../../shared/lib/auth';
import { supabase } from '../../../shared/lib/supabaseClient';
import { apiJson } from '../../../shared/lib/api';
import { getAuthCooldownRemainingMs, startAuthRateLimit } from '../../../shared/lib/authRateLimit';

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitRemainingMs, setRateLimitRemainingMs] = useState(() => getAuthCooldownRemainingMs());

  const pendingScan = useMemo(() => getPendingScan(), []);

  useEffect(() => {
    let isActive = true;

    async function syncSession() {
      const sessionAuth = await hydrateMockAuthFromSession('login', 'usuario');

      if (!isActive) {
        return;
      }

      if (sessionAuth) {
        navigate(pendingScan ? '/analysis' : '/', { replace: true });
        return;
      }

      if (!pendingScan) {
        navigate('/', { replace: true });
        return;
      }

      if (getMockAuth()) {
        navigate('/analysis', { replace: true });
      }
    }

    syncSession().catch(() => {
      if (isActive && !pendingScan) {
        navigate('/', { replace: true });
      }
    });

    return () => {
      isActive = false;
    };
  }, [navigate, pendingScan]);

  useEffect(() => {
    if (rateLimitRemainingMs <= 0) return undefined;

    const intervalId = window.setInterval(() => {
      setRateLimitRemainingMs(getAuthCooldownRemainingMs());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [rateLimitRemainingMs]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    const displayName = (fullName || normalizedEmail.split('@')[0] || 'usuario').trim();
    const cooldownRemaining = getAuthCooldownRemainingMs();

    if (cooldownRemaining > 0) {
      setRateLimitRemainingMs(cooldownRemaining);
      setSubmitError(`Demasiadas solicitudes. Espera ${Math.ceil(cooldownRemaining / 1000)}s.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (mode === 'register') {
        try {
          const existsPayload = await apiJson(`/profiles/exists?email=${encodeURIComponent(normalizedEmail.toLowerCase())}`);
          if (existsPayload?.exists) {
            throw new Error('Este correo ya está registrado. Inicia sesión.');
          }
        } catch (preCheckError) {
          if (preCheckError?.message === 'Este correo ya está registrado. Inicia sesión.') {
            throw preCheckError;
          }
          // best-effort precheck; continue if endpoint unavailable
        }
      }

      const authResult =
        mode === 'register'
          ? await supabase.auth.signUp({
              email: normalizedEmail,
              password,
              options: {
                data: {
                  full_name: displayName,
                },
              },
            })
          : await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            });

      if (authResult.error) {
        throw authResult.error;
      }

      const user = authResult.data?.user;
      if (!user) {
        throw new Error('No se pudo obtener usuario desde Supabase.');
      }

      const resolvedDisplayName = user.user_metadata?.full_name || displayName;
      const resolvedEmail = user.email || normalizedEmail;

      setMockAuth({
        mode,
        displayName: resolvedDisplayName,
        email: resolvedEmail,
        userId: user.id,
        authenticatedAt: Date.now(),
      });

      await apiJson('/profiles/sync', {
        method: 'POST',
        body: {
          user_id: user.id,
          email: resolvedEmail,
          display_name: resolvedDisplayName,
          avatar_url: user.user_metadata?.avatar_url || null,
        },
      });

      navigate('/analysis', { replace: true });
    } catch (error) {
      const is429 = error?.status === 429 || (error?.message && /429|Too Many Requests/i.test(error.message));
      if (is429) {
        startAuthRateLimit();
        const nextRemaining = getAuthCooldownRemainingMs();
        setRateLimitRemainingMs(nextRemaining);
        setSubmitError(`Demasiadas solicitudes. Espera ${Math.ceil(nextRemaining / 1000)}s.`);
      } else {
        setSubmitError(error?.message || 'No se pudo autenticar.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await signInWithGoogle('/auth');
    } catch (error) {
      setSubmitError(error?.message || 'No se pudo iniciar sesión con Google.');
      setIsSubmitting(false);
    }
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
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white px-4 text-sm font-bold text-black shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            Continuar con Google
          </button>

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
            disabled={isSubmitting || rateLimitRemainingMs > 0}
            className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#c1e14f] px-4 text-sm font-bold text-black shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-transform active:scale-[0.98]"
          >
            {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
            {isSubmitting ? 'Procesando...' : mode === 'login' ? 'Entrar y analizar' : 'Crear cuenta y analizar'}
          </button>

          {submitError ? <p className="text-sm font-medium text-red-600">{submitError}</p> : null}
        </form>
      </div>
    </div>
  );
}

export default AuthPage;