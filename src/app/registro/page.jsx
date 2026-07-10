'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function Registro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
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
    } else if (password.length < 6) {
      errs.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Confirmá tu contraseña.';
    } else if (password && confirmPassword !== password) {
      errs.confirmPassword = 'Las contraseñas no coinciden.';
    }
    return errs;
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    const errs = validarCampos();
    if (Object.keys(errs).length > 0) {
      setErroresCampo(errs);
      return;
    }
    setErroresCampo({});

    setCargando(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError('Ocurrió un error al crear la cuenta. Por favor, intentá de nuevo.');
      setCargando(false);
      return;
    }

    // Supabase devuelve identities vacío cuando el email ya está registrado
    if (!data?.user?.identities || data.user.identities.length === 0) {
      setError('Este email ya está registrado. Por favor, iniciá sesión.');
      setCargando(false);
      return;
    }

    setMensaje('¡Registro exitoso! Por favor, revisá tu casilla de email (y la carpeta de spam) para confirmar tu cuenta antes de iniciar sesión.');
    setCargando(false);
  };

  return (
    <section className="page-vacia fade-in-up">
      <h3 className="titulo-seccion">crear cuenta.</h3>

      <div className="checkout-wrapper auth-wrapper">
        <h3 className="checkout-title">sumate a dolce duck.</h3>
        <p className="checkout-subtitle">
          Creá tu cuenta para guardar tus pedidos y agilizar el checkout.
        </p>

        <form className="checkout-form" onSubmit={handleRegistro} noValidate>
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                className={inputClass('password')}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (erroresCampo.password) setErroresCampo((prev) => ({ ...prev, password: '' }));
                }}
              />
              {err('password') && <span className="campo-error-msg">{err('password')}</span>}
            </div>

            <div className="checkout-field" style={{ marginTop: '14px' }}>
              <label>Confirmar contraseña</label>
              <input
                type="password"
                placeholder="Repetí tu contraseña"
                value={confirmPassword}
                className={inputClass('confirmPassword')}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (erroresCampo.confirmPassword) setErroresCampo((prev) => ({ ...prev, confirmPassword: '' }));
                }}
              />
              {err('confirmPassword') && <span className="campo-error-msg">{err('confirmPassword')}</span>}
            </div>
          </div>

          {error && <div className="checkout-error">{error}</div>}

          {mensaje && <div className="checkout-exito">{mensaje}</div>}

          <button
            type="submit"
            className="btn-coordinar-pedido"
            disabled={cargando || !!mensaje}
          >
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="checkout-aclaracion">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="auth-link">
              Iniciá sesión
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
