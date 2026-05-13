import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../shared/components/Header';
import { hydrateMockAuthFromSession, signInWithGoogle } from '../../../shared/lib/auth';
import { supabase } from '../../../shared/lib/supabaseClient';
import { getPendingPublicationDraft, publishPendingPublicationDraft, savePendingPublicationDraft } from '../../../shared/lib/publicationDraft';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailValue = username.includes('@') ? username.trim() : `${username.trim()}@zoa.local`;
    const displayName = (username || 'usuario').trim();

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const authResult = await supabase.auth.signInWithPassword({
        email: emailValue,
        password,
      });

      if (authResult.error) {
        throw authResult.error;
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
        setIsRateLimited(true);
        setSubmitError('Demasiadas solicitudes. Intenta de nuevo en unos minutos.');
        setTimeout(() => setIsRateLimited(false), 30000);
      } else {
        setSubmitError(error?.message || 'No se pudo iniciar sesión.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await signInWithGoogle('/login');
    } catch (error) {
      setSubmitError(error?.message || 'No se pudo iniciar sesión con Google.');
      setIsSubmitting(false);
    }
  };

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
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="rounded-lg bg-white py-2 text-center text-[14px] font-semibold text-[#1e1e1e] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] disabled:opacity-70 sm:text-[15px]"
            >
              Continuar con Google
            </button>

            <div className="flex flex-col gap-[3px]">
              <label className="text-left text-[14px] sm:text-[15px]">Username o correo electronico</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 w-full rounded-lg bg-white pl-3 text-black shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] outline-none sm:h-[33px]"
                placeholder="Username o correo electronico"
                autoComplete="username"
              />
            </div>

            <div className="flex flex-col gap-[5px]">
              <label className="text-left text-[14px] sm:text-[15px]">Contraseña</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="h-11 w-full rounded-lg bg-white pl-3 text-black shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] outline-none sm:h-[33px]"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isRateLimited}
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
