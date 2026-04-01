'use client';

import { FormEvent, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface LoginFormProps {
  initialError?: string;
}

export default function LoginForm({ initialError }: LoginFormProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [error, setError] = useState(initialError ?? '');
  const [message, setMessage] = useState('');

  const cardTransition = useMemo(
    () => ({
      type: 'spring' as const,
      stiffness: 300,
      damping: 28,
      duration: shouldReduceMotion ? 0 : undefined,
    }),
    [shouldReduceMotion]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const supabase = createClient();

    if (isSignUpMode) {
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=/`;
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setMessage('Cuenta creada. Si tu proyecto requiere confirmacion por email, revisa tu bandeja.');
      }

      setIsLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    router.replace('/');
    router.refresh();
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 6 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={cardTransition}
    >
      <div className="mb-6">
        <h2 className="text-base font-medium leading-tight">
          {isSignUpMode ? 'Crear cuenta' : 'Iniciar sesión'}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {isSignUpMode
            ? 'Registra un usuario para acceder al panel.'
            : 'Correo y contraseña para entrar al panel.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="text-xs block mb-1.5">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border-b border-black/20 px-0 py-2 text-sm bg-transparent focus:outline-none focus:border-black transition-colors"
            placeholder="tu@correo.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-xs block mb-1.5">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border-b border-black/20 px-0 py-2 text-sm bg-transparent focus:outline-none focus:border-black transition-colors"
            placeholder="········"
          />
        </div>

        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : null}

        {message ? (
          <p className="text-xs text-emerald-700">{message}</p>
        ) : null}

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-full bg-black text-white py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Procesando...' : isSignUpMode ? 'Crear cuenta' : 'Entrar'}
        </motion.button>
      </form>

      <button
        type="button"
        onClick={() => {
          setError('');
          setMessage('');
          setIsSignUpMode((value) => !value);
        }}
        className="mt-5 w-full text-center text-xs underline underline-offset-2 text-gray-500 cursor-pointer"
      >
        {isSignUpMode ? '¿Ya tienes cuenta? Iniciar sesión' : '¿No tienes cuenta? Crear cuenta'}
      </button>
    </motion.div>
  );
}
