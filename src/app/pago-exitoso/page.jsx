'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

export default function PagoExitoso() {
  const { cart, eliminarDelCarrito } = useCart();

  useEffect(() => {
    cart.forEach(item => eliminarDelCarrito(item.cartId));
  // Solo al montar — vacía el carrito una vez al entrar a esta pantalla
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="page-vacia fade-in-up" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>

      <h2 className="titulo-seccion" style={{ fontSize: '2rem', marginBottom: '12px' }}>
        ¡Pago exitoso!
      </h2>

      <p style={{
        fontSize: '1.1rem',
        color: 'var(--texto)',
        fontWeight: 600,
        marginBottom: '8px',
      }}>
        Tu pedido está en camino.
      </p>

      <p style={{
        fontSize: '0.9rem',
        color: '#888',
        maxWidth: '420px',
        margin: '0 auto 36px',
        lineHeight: 1.6,
      }}>
        En breve nos ponemos en contacto para coordinar la entrega. ¡Gracias por elegirnos!
      </p>

      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/">
          <button className="btn-coordinar-pedido" style={{ background: 'var(--pale-cyan)' }}>
            Volver al inicio
          </button>
        </Link>
        <Link href="/ordenes">
          <button className="btn-coordinar-pedido">
            Ver mis pedidos
          </button>
        </Link>
      </div>
    </section>
  );
}
