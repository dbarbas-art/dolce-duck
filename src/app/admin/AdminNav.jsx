'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav">
      <Link
        href="/admin/pedidos"
        className={`admin-tab${pathname.startsWith('/admin/pedidos') ? ' active' : ''}`}
      >
        📋 Pedidos
      </Link>
      <Link
        href="/admin/productos"
        className={`admin-tab${pathname.startsWith('/admin/productos') ? ' active' : ''}`}
      >
        🛍️ Productos
      </Link>
    </nav>
  );
}
