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
  const [cargando, setCargando] = useState(false);

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    setMensaje('¡Cuenta creada! Revisá tu email para confirmar el registro y luego iniciá sesión.');
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

        <form className="checkout-form" onSubmit={handleRegistro}>
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="checkout-field" style={{ marginTop: '14px' }}>
              <label>Confirmar contraseña</label>
              <input
                type="password"
                placeholder="Repetí tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
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
