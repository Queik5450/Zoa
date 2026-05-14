import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../shared/components/Header';
import { hydrateMockAuthFromSession } from '../../../shared/lib/auth';
import { supabase } from '../../../shared/lib/supabaseClient';
import { getPendingPublicationDraft, publishPendingPublicationDraft, savePendingPublicationDraft } from '../../../shared/lib/publicationDraft';
import { apiJson } from '../../../shared/lib/api';
import { getAuthCooldownRemainingMs, startAuthRateLimit } from '../../../shared/lib/authRateLimit';
import { getPublicationDetailPath } from '../../../shared/lib/publicationRoutes';

function Register() {
  const navigate = useNavigate();
  const submitLockRef = useRef(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitRemainingMs, setRateLimitRemainingMs] = useState(() => getAuthCooldownRemainingMs());

  useEffect(() => {
    if (rateLimitRemainingMs <= 0) return undefined;

    const intervalId = window.setInterval(() => {
      setRateLimitRemainingMs(getAuthCooldownRemainingMs());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [rateLimitRemainingMs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLockRef.current) {
      return;
    }

    const normalizedEmail = (email || '').trim().toLowerCase();
    const displayName = (fullName || normalizedEmail.split('@')[0] || 'usuario').trim();
    const cooldownRemaining = getAuthCooldownRemainingMs();

    if (cooldownRemaining > 0) {
      setRateLimitRemainingMs(cooldownRemaining);
      setSubmitError(`Demasiadas solicitudes. Espera ${Math.ceil(cooldownRemaining / 1000)}s.`);
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      try {
        const existsPayload = await apiJson(`/profiles/exists?email=${encodeURIComponent(normalizedEmail.toLowerCase())}`);
        if (existsPayload?.exists) {
          throw new Error('Este correo ya está registrado. Inicia sesión.');
        }
      } catch (preCheckError) {
        if (preCheckError?.message === 'Este correo ya está registrado. Inicia sesión.') {
          throw preCheckError;
        }
        // best-effort precheck; continue with signup if endpoint unavailable
      }

      const authResult = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: displayName,
          },
        },
      });

      if (authResult.error) {
        throw authResult.error;
      }

      const user = authResult.data?.user;
      if (!user) {
        throw new Error('No se pudo crear usuario.');
      }

      await hydrateMockAuthFromSession('register', user.user_metadata?.full_name || displayName);

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
      } else if (error?.status === 404) {
        setSubmitError('No se pudo completar el registro: un recurso requerido no respondió. Reintenta en un momento.');
      } else {
        setSubmitError(error?.message || 'No se pudo registrar.');
      }
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white font-sans text-[#111]">
      <Header compact />

      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col items-center px-5 pb-10 pt-6 sm:px-[40px] sm:pb-12 sm:pt-8">
        <div className="self-stretch flex flex-col items-center justify-center text-center">
          <h1 className="text-[clamp(2rem,5.5vw,2.9rem)] font-semibold text-black">Registro de Usuario</h1>
          <p className="mt-3 text-[15px] text-black sm:text-[16px]">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="italic text-[#7d8d42] underline underline-offset-2">
              Inicia Sesión
            </Link>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 w-full max-w-[430px] rounded-[28px] bg-[#7f962b] px-0 pb-7 pt-6 shadow-[0_12px_28px_rgba(0,0,0,0.18)] sm:mt-10 sm:pb-8 sm:pt-7"
        >
          <div className="mx-auto flex w-full max-w-[360px] flex-col gap-4 px-5 text-white sm:px-0">
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

            <div className="flex flex-col gap-[3px]">
              <label className="text-left text-[15px] sm:text-[16px]">Nombre</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-13 w-full rounded-xl bg-white px-4 text-[15px] text-black shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] outline-none sm:h-14 sm:text-[16px]"
                autoComplete="name"
              />
            </div>

            <div className="flex flex-col gap-[5px]">
              <label className="text-left text-[15px] sm:text-[16px]">
                Contraseña <span className="text-red-400">*</span>
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                minLength={8}
                className="h-13 w-full rounded-xl bg-white px-4 text-[15px] text-black shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] outline-none sm:h-14 sm:text-[16px]"
                autoComplete="new-password"
              />
              <p className="text-[10px] leading-snug text-[#c8d68b] sm:text-[11px]">
                *Debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un símbolo.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || rateLimitRemainingMs > 0}
              className="mt-2 rounded-xl bg-[#c1e734] py-3 text-center text-[15px] font-semibold text-[#1e1e1e] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.25)] disabled:opacity-70 sm:py-3.5 sm:text-[16px]"
            >
              {isSubmitting ? 'Registrando...' : 'Registrarse'}
            </button>

            {submitError ? <p className="text-sm font-medium text-red-600">{submitError}</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
