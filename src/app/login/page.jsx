'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Email o contraseña incorrectos. Verificá tus datos.');
      setCargando(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <section className="page-vacia fade-in-up">
      <h3 className="titulo-seccion">iniciar sesión.</h3>

      <div className="checkout-wrapper auth-wrapper">
        <h3 className="checkout-title">bienvenida de nuevo.</h3>
        <p className="checkout-subtitle">
          Ingresá para continuar con tu pedido.
        </p>

        <form className="checkout-form" onSubmit={handleLogin}>
          <div className="checkout-section">
            <div className="checkout-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="checkout-field" style={{ marginTop: '14px' }}>
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="checkout-error">{error}</div>}

          <button
            type="submit"
            className="btn-coordinar-pedido"
            disabled={cargando}
          >
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <p className="checkout-aclaracion">
            ¿No tenés cuenta?{' '}
            <Link href="/registro" className="auth-link">
              Registrate acá
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
