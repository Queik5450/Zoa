import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../shared/components/Header';
import { hydrateMockAuthFromSession } from '../../../shared/lib/auth';
import { supabase, isSupabaseConfigured } from '../../../shared/lib/supabaseClient';
import { getPendingPublicationDraft, publishPendingPublicationDraft, savePendingPublicationDraft } from '../../../shared/lib/publicationDraft';
import { getAuthCooldownRemainingMs, startAuthRateLimit } from '../../../shared/lib/authRateLimit';
import { getPublicationDetailPath } from '../../../shared/lib/publicationRoutes';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitRemainingMs, setRateLimitRemainingMs] = useState(() => getAuthCooldownRemainingMs());
  

  React.useEffect(() => {
    if (rateLimitRemainingMs <= 0) return undefined;

    const intervalId = window.setInterval(() => {
      setRateLimitRemainingMs(getAuthCooldownRemainingMs());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [rateLimitRemainingMs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = (email || '').trim().toLowerCase();
    const displayName = (normalizedEmail.split('@')[0] || 'usuario').trim();

    const cooldownRemaining = getAuthCooldownRemainingMs();
    if (cooldownRemaining > 0) {
      setRateLimitRemainingMs(cooldownRemaining);
      setSubmitError(`Demasiadas solicitudes. Espera ${Math.ceil(cooldownRemaining / 1000)}s.`);
      return;
    }

    if (!normalizedEmail || !password) {
      setSubmitError('Por favor ingresa correo y contraseña.');
      return;
    }

    if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (!isSupabaseConfigured) {
        setSubmitError('El cliente de Supabase no está configurado. Revisa las variables de entorno.');
        return;
      }

      const authResult = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (authResult.error) throw authResult.error;

      const user = authResult.data?.user;
      if (!user) throw new Error('No se pudo iniciar sesión.');

      await hydrateMockAuthFromSession('login', user.user_metadata?.full_name || displayName);

      const pendingDraft = getPendingPublicationDraft();
      if (pendingDraft) {
        savePendingPublicationDraft(pendingDraft);
        const published = await publishPendingPublicationDraft(pendingDraft);
        navigate(getPublicationDetailPath(published?.id || '', published?.media_type || pendingDraft?.mediaType), { replace: true });
        return;
      }

      navigate('/');
    } catch (error) {
      const is429 = error?.status === 429 || (error?.message && /429|Too Many Requests/i.test(error.message));
      if (is429) {
        startAuthRateLimit();
        const nextRemaining = getAuthCooldownRemainingMs();
        setRateLimitRemainingMs(nextRemaining);
        setSubmitError(`Demasiadas solicitudes. Espera ${Math.ceil(nextRemaining / 1000)}s.`);
      } else {
        setSubmitError(error?.message || 'No se pudo iniciar sesión.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google OAuth login removed — button disabled due to non-working provider.

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white font-sans text-[#111]">
      <Header compact />

      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col items-center px-5 pb-10 pt-6 sm:px-[40px] sm:pb-12 sm:pt-8">
          <div className="self-stretch flex flex-col items-center justify-center text-center">
            <h1 className="text-[clamp(2rem,5.5vw,2.9rem)] font-semibold text-black">Iniciar Sesión</h1>
            <p className="mt-3 text-[15px] text-black">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="italic text-[#7d8d42] underline underline-offset-2">
                Regístrate
              </Link>
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 w-full max-w-[430px] rounded-[28px] bg-[#7f962b] px-0 pb-7 pt-6 shadow-[0_12px_28px_rgba(0,0,0,0.18)] sm:mt-10 sm:pb-8 sm:pt-7"
          >
            <div className="mx-auto flex w-full max-w-[360px] flex-col gap-4 px-5 text-white sm:px-0">
              {/* Nombre eliminado: no es obligatorio */}

              <div className="flex flex-col gap-[3px]">
                <label className="text-left text-[15px] sm:text-[16px]">Correo electrónico</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="h-13 w-full rounded-xl bg-white px-4 text-[15px] text-black shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] outline-none sm:h-14 sm:text-[16px]"
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-[5px]">
                <label className="text-left text-[15px] sm:text-[16px]">Contraseña</label>
                <input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                    if (submitError) setSubmitError('');
                  }}
                  type="password"
                  required
                  className="h-13 w-full rounded-xl bg-white px-4 text-[15px] text-black shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] outline-none sm:h-14 sm:text-[16px]"
                  autoComplete="current-password"
                />
                {passwordError ? (
                  <p className="text-sm font-medium text-red-600">{passwordError}</p>
                ) : (
                  <p className="text-xs text-white/90">Mínimo 8 caracteres. Usa una contraseña segura.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || rateLimitRemainingMs > 0}
                className="mt-2 rounded-xl bg-[#c1e734] py-3 text-center text-[15px] font-semibold text-[#1e1e1e] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] disabled:opacity-70 sm:py-3.5 sm:text-[16px]"
              >
                {isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>

              {submitError ? <p className="text-sm font-medium text-red-600">{submitError}</p> : null}
            </div>
          </form>
      </div>
    </div>
  );
}

export default Login;
