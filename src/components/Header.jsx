"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';

export default function Header() {
  const pathname = usePathname();
  const { cart } = useCart();

  const isActive = (path) => pathname === path ? 'active' : '';

  return (
    <>
      <div className="marquee">
        <div className="marquee-inner">
          <span>Dolce Duck - Pastelería artesanal</span>
          <span>Pedí tu antojo hoy</span>
          <span>Dolce Duck - Pastelería artesanal</span>
          <span>Pedí tu antojo hoy</span>
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
            <Link href="/carrito">
              <button className="btn-carrito">Carrito ({cart.length})</button>
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}