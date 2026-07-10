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
  const [erroresCampo, setErroresCampo] = useState({});
  const [cargando, setCargando] = useState(false);

  const err = (campo) => erroresCampo[campo];
  const inputClass = (campo) => (err(campo) ? 'input-error' : '');

  const validarCampos = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'El email es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Ingresá un email válido.';
    }
    if (!password) {
      errs.password = 'La contraseña es obligatoria.';
    }
    return errs;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const errs = validarCampos();
    if (Object.keys(errs).length > 0) {
      setErroresCampo(errs);
      return;
    }
    setErroresCampo({});
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

        <form className="checkout-form" onSubmit={handleLogin} noValidate>
          <div className="checkout-section">
            <div className="checkout-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                className={inputClass('email')}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (erroresCampo.email) setErroresCampo((prev) => ({ ...prev, email: '' }));
                }}
              />
              {err('email') && <span className="campo-error-msg">{err('email')}</span>}
            </div>
            <div className="checkout-field" style={{ marginTop: '14px' }}>
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                className={inputClass('password')}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (erroresCampo.password) setErroresCampo((prev) => ({ ...prev, password: '' }));
                }}
              />
              {err('password') && <span className="campo-error-msg">{err('password')}</span>}
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
