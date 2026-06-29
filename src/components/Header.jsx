"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';

function IconoPerfil() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { cart, user } = useCart();
  const [menuPerfil, setMenuPerfil] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const perfilRef = useRef(null);

  useEffect(() => {
    if (!menuPerfil) return;
    function handleClickOutside(e) {
      if (perfilRef.current && !perfilRef.current.contains(e.target)) {
        setMenuPerfil(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuPerfil]);

  useEffect(() => {
    if (!user) { setEsAdmin(false); return; }
    fetch('/api/auth/rol')
      .then(r => r.json())
      .then(data => setEsAdmin(data.rol === 'admin'))
      .catch(() => setEsAdmin(false));
  }, [user?.id]);

  const isActive = (path) => pathname === path ? 'active' : '';

  const handleLogout = async () => {
    setMenuPerfil(false);
    await supabase.auth.signOut();
  };

  return (
    <>
      <div className="marquee">
        <div className="marquee-inner">
          <span>Dolce Duck Pastelería Artesanal</span>
          <span>¡Pedí tu antojo hoy mismo!</span>
          <span>¡ENVÍO GRATIS EN CABA!</span>
          <span>Pedidos con 3 días de anticipación mínimo</span>
          <span>Dolce Duck Pastelería Artesanal</span>
          <span>¡Pedí tu antojo hoy mismo!</span>
          <span>¡ENVÍO GRATIS EN CABA!</span>
          <span>Pedidos con 3 días de anticipación mínimo</span>
        </div>
      </div>

      <header className="header-principal">
        <Link href="/">
          <img src="/images/LOGO.png" className="logo-fuera" alt="Logo" />
        </Link>

        <nav className="navbar-flotante">
          <div className="nav-brand">
            <Link href="/"><span>dolce duck</span></Link>
          </div>

          <div className="nav-menu">
            <ul className="nav-links">
              <li><Link href="/menu"><button className={isActive('/menu')}>Menú</button></Link></li>
              <li><Link href="/nosotros"><button className={isActive('/nosotros')}>Nosotros</button></Link></li>
              <li><Link href="/contacto"><button className={isActive('/contacto')}>Contacto</button></Link></li>
            </ul>

            <div className="perfil-wrapper" ref={perfilRef}>
              {user ? (
                <>
                  <button
                    className="btn-perfil btn-perfil--activo"
                    onClick={() => setMenuPerfil(p => !p)}
                    aria-label="Menú de perfil"
                  >
                    <IconoPerfil />
                  </button>
                  {menuPerfil && (
                    <div className="perfil-dropdown">
                      <p className="perfil-email">{user.email}</p>
                      {esAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuPerfil(false)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'rgba(157, 116, 178, 0.1)',
                            border: '1px solid rgba(157, 116, 178, 0.25)',
                            borderRadius: 10,
                            padding: '5px 10px',
                            fontSize: '0.83rem',
                            fontWeight: 700,
                            color: 'var(--violeta-acento)',
                            textDecoration: 'none',
                          }}
                        >
                          ⚙️ Panel Admin
                        </Link>
                      )}
                      <Link href="/ordenes" onClick={() => setMenuPerfil(false)}>
                        Mis pedidos
                      </Link>
                      <button onClick={handleLogout}>Cerrar sesión</button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/login" className="btn-perfil btn-perfil--inactivo" aria-label="Iniciar sesión">
                  <IconoPerfil />
                </Link>
              )}
            </div>

            <Link href="/carrito">
              <button className="btn-carrito">Carrito ({cart.length})</button>
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
