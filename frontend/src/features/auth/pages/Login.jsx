import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../shared/components/Header';
import { hydrateMockAuthFromSession } from '../../../shared/lib/auth';
import { supabase, isSupabaseConfigured } from '../../../shared/lib/supabaseClient';
import { apiJson } from '../../../shared/lib/api';
import { getPendingPublicationDraft, publishPendingPublicationDraft, savePendingPublicationDraft } from '../../../shared/lib/publicationDraft';
import { getAuthCooldownRemainingMs, startAuthRateLimit } from '../../../shared/lib/authRateLimit';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitRemainingMs, setRateLimitRemainingMs] = useState(() => getAuthCooldownRemainingMs());
  const [resolvedEmail, setResolvedEmail] = useState('');

  React.useEffect(() => {
    if (rateLimitRemainingMs <= 0) return undefined;

    const intervalId = window.setInterval(() => {
      setRateLimitRemainingMs(getAuthCooldownRemainingMs());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [rateLimitRemainingMs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const displayName = (username || 'usuario').trim();

    const buildLoginEmail = (raw) => {
      const trimmed = (raw || '').trim();
      if (!trimmed) return '';
      if (trimmed.includes('@')) return trimmed.toLowerCase();

      // Normalize and remove diacritics, replace spaces with dots, strip invalid chars
      const normalized = trimmed.normalize('NFKD').replace(/([\u0300-\u036f])/g, '');
      const slug = normalized.replace(/\s+/g, '.').replace(/[^A-Za-z0-9._-]/g, '').toLowerCase();
      return slug ? `${slug}@zoa.local` : '';
    };

    let emailValue = buildLoginEmail(username);
    setResolvedEmail('');
    const cooldownRemaining = getAuthCooldownRemainingMs();

    if (cooldownRemaining > 0) {
      setRateLimitRemainingMs(cooldownRemaining);
      setSubmitError(`Demasiadas solicitudes. Espera ${Math.ceil(cooldownRemaining / 1000)}s.`);
      return;
    }

    // Clear previous field errors
    setUsernameError('');
    setPasswordError('');

    if (!username.trim() || !password) {
      setSubmitError('Por favor ingresa usuario y contraseña.');
      return;
    }

    // Password length validation
    if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    // If user provided a username (no @), try resolving to an existing profile email first
    if (!username.includes('@')) {
      try {
        const resolveRes = await apiJson(`/profiles/resolve?username=${encodeURIComponent(username.trim())}`);
        if (resolveRes?.found && resolveRes?.email) {
          emailValue = resolveRes.email;
          setResolvedEmail(resolveRes.email);
        }
      } catch (err) {
        // ignore resolve errors and fallback to generated local email
        // eslint-disable-next-line no-console
        console.warn('profiles.resolve failed', err);
      }
    }

    // Validate final email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue || !emailRegex.test(emailValue)) {
      setSubmitError('Nombre de usuario o correo inválido. Usa un correo válido o un username sin caracteres especiales.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {

      if (!isSupabaseConfigured) {
        setSubmitError('El cliente de Supabase no está configurado. Revisa las variables de entorno.');
        return;
      }

      // Log request info (never log raw password)
      // eslint-disable-next-line no-console
      console.log('Signing in with', { email: emailValue, passwordLength: password.length });

      const authResult = await supabase.auth.signInWithPassword({ email: emailValue, password });

      if (authResult.error) {
        // Prefer Supabase error message, but include status if available
        const err = authResult.error;
        const errMsg = err.message || err.error_description || JSON.stringify(err);
        const status = err.status || err.statusCode || (err.response && err.response.status);
        const display = status ? `${errMsg} (status ${status})` : errMsg;
        throw new Error(display);
      }

      const user = authResult.data?.user;
      if (!user) {
        throw new Error('No se pudo iniciar sesión.');
      }

      await hydrateMockAuthFromSession('login', user.user_metadata?.full_name || displayName);

      const pendingDraft = getPendingPublicationDraft();
      if (pendingDraft) {
        savePendingPublicationDraft(pendingDraft);
        const published = await publishPendingPublicationDraft(pendingDraft);
        navigate(`/publicacion?id=${published?.id || ''}`, { replace: true });
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
      <Header />

      <div className="mx-auto flex w-full max-w-[406px] flex-1 flex-col items-center px-4 pb-8 pt-8 sm:px-[35px] sm:pb-10 sm:pt-12">
        <div className="self-stretch flex flex-col items-center justify-center text-center">
          <h1 className="text-[clamp(1.55rem,5vw,2.2rem)] font-semibold text-black">Iniciar Sesión</h1>
          <p className="mt-3 text-[14px] text-black sm:text-[15px]">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="italic text-[#7d8d42] underline underline-offset-2">
              Regístrate
            </Link>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-12 w-full max-w-[360px] rounded-[20px] bg-[#7f962b] px-0 pb-[24px] pt-5 shadow-[0_4px_4px_rgba(0,0,0,0.25)] sm:mt-[84px] sm:pb-[31px] sm:pt-6"
        >
          <div className="mx-auto flex w-full max-w-[320px] flex-col gap-3 px-4 text-white sm:px-0">
            {/* Google login removed — use email/username and password */}

            <div className="flex flex-col gap-[3px]">
              <label className="text-left text-[14px] sm:text-[15px]">Username o correo electronico</label>
              <input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (usernameError) setUsernameError('');
                  if (submitError) setSubmitError('');
                }}
                className="h-11 w-full rounded-lg bg-white pl-3 text-black shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] outline-none sm:h-[33px]"
                placeholder="Username o correo electronico"
                autoComplete="username"
              />
              {usernameError ? (
                <p className="text-sm font-medium text-red-600">{usernameError}</p>
              ) : (
                <>
                  <p className="text-xs text-white/90">Puedes usar correo o username. Los espacios se convertirán en puntos y se eliminarán caracteres especiales. Ej: José Pereira → jose.pereira@zoa.local</p>
                  {resolvedEmail ? (
                    <p className="text-sm text-white/100">Se intentará iniciar sesión con: <span className="font-medium">{resolvedEmail}</span></p>
                  ) : null}
                </>
              )}
            </div>

            <div className="flex flex-col gap-[5px]">
              <label className="text-left text-[14px] sm:text-[15px]">Contraseña</label>
              <input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                  if (submitError) setSubmitError('');
                }}
                type="password"
                required
                className="h-11 w-full rounded-lg bg-white pl-3 text-black shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] outline-none sm:h-[33px]"
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
              className="mt-1 rounded-lg bg-[#c1e734] py-2 text-center text-[14px] font-semibold text-[#1e1e1e] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] disabled:opacity-70 sm:text-[15px]"
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
