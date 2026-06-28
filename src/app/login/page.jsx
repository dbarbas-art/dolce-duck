'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

function LoginForm() {
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

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      const { data } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (!data) {
        setError('Este correo electrónico no tiene una cuenta registrada.');
      } else {
        setError('Contraseña incorrecta. Verificá tus datos.');
      }
      setCargando(false);
      return;
    }

    // Recarga completa: garantiza que el middleware del servidor lea las cookies
    // de Supabase recién seteadas sin race conditions con router.push/refresh.
    window.location.replace(redirect);
  };

  return (
    <section className="page-vacia fade-in-up">
      <h3 className="titulo-seccion">Iniciar sesión</h3>

      <div className="checkout-wrapper auth-wrapper">
        <h3 className="checkout-title">Bienvenida de nuevo</h3>
        <p className="checkout-subtitle">Ingresá para continuar con tu pedido.</p>

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

          <button type="submit" className="btn-coordinar-pedido" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <p className="checkout-aclaracion">
            ¿No tenés cuenta?{' '}
            <Link href="/registro" className="auth-link">Registrate acá</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
