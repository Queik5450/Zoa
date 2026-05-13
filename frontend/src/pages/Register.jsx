import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { setMockAuth } from '../utils/scanFlow';
import { apiJson } from '../utils/api';
import { supabase } from '../utils/supabaseClient';

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim();
    const displayName = (username || normalizedEmail.split('@')[0] || 'usuario').trim();

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const authResult = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: displayName,
            username: displayName,
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

      setMockAuth({
        mode: 'register',
        displayName: user.user_metadata?.full_name || displayName,
        email: user.email || normalizedEmail,
        userId: user.id,
        authenticatedAt: Date.now(),
      });

      await apiJson('/profiles/sync', {
        method: 'POST',
        body: {
          user_id: user.id,
          email: user.email || normalizedEmail,
          display_name: user.user_metadata?.full_name || displayName,
          avatar_url: user.user_metadata?.avatar_url || null,
        },
      });

      navigate('/');
    } catch (error) {
      setSubmitError(error?.message || 'No se pudo registrar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white font-sans">
      <Header />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-10 pb-12 pt-16">
        <h1 className="text-center text-xl font-bold text-black">Registrarse en ZOA</h1>
        <p className="mt-3 text-center text-sm text-black">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-[#80902e] underline underline-offset-2">
            Inicia Sesión
          </Link>
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 w-full space-y-4 rounded-[28px] bg-[#80902e] p-7 shadow-[0_18px_45px_rgba(128,144,46,0.38)]"
        >
          <div>
            <label className="mb-2 block text-xs font-semibold text-white">Correo electrónico</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="h-12 w-full rounded-2xl border border-black/5 bg-white px-4 text-sm text-black shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)] outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-white">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 w-full rounded-2xl border border-black/5 bg-white px-4 text-sm text-black shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)] outline-none"
              required
            />
            <p className="mt-2 text-[11px] leading-snug text-[#c8d68b]">
              *El nombre de usuario solo puede contener caracteres alfanuméricos o guiones simples, y no puede comenzar
              ni terminar con un guion.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-white">
              Contraseña <span className="text-red-400">*</span>
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={8}
              className="h-12 w-full rounded-2xl border border-black/5 bg-white px-4 text-sm text-black shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)] outline-none"
            />
            <p className="mt-2 text-[11px] leading-snug text-[#c8d68b]">
              *Debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un símbolo.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-12 w-full rounded-2xl bg-[#c1e14f] text-sm font-bold text-black shadow-[0_8px_22px_rgba(0,0,0,0.14)]"
          >
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </button>
          {submitError ? <p className="text-sm font-medium text-red-100">{submitError}</p> : null}
        </form>
      </div>
    </div>
  );
}

export default Register;
