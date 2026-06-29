'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

function PagoExitosoContent() {
  const searchParams = useSearchParams();
  // MP envía: status, external_reference (nuestro pedidoId), collection_status, payment_id
  const status = searchParams.get('status') || searchParams.get('collection_status');
  const pedidoId = searchParams.get('external_reference');
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');

  const { cart, eliminarDelCarrito } = useCart();
  const [actualizando, setActualizando] = useState(true);
  const [resultado, setResultado] = useState(null); // 'ok' | 'error' | 'sin_params'

  useEffect(() => {
    // Limpiar estado local del carrito
    cart.forEach(item => eliminarDelCarrito(item.cartId));

    if (!pedidoId || status !== 'approved') {
      setActualizando(false);
      setResultado('sin_params');
      return;
    }

    async function marcarPagado() {
      try {
        const res = await fetch(`/api/ordenes/${pedidoId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'marcar_pagado',
            referencia_pago: paymentId,
          }),
        });
        setResultado(res.ok ? 'ok' : 'error');
      } catch {
        setResultado('error');
      } finally {
        setActualizando(false);
      }
    }
    marcarPagado();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (actualizando) {
    return (
      <section className="page-vacia fade-in-up" style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--texto)', fontSize: '1rem' }}>Confirmando tu pago...</p>
      </section>
    );
  }

  return (
    <section className="page-vacia fade-in-up" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>

      <h2 className="titulo-seccion" style={{ fontSize: '2rem', marginBottom: '12px' }}>
        ¡Pago exitoso!
      </h2>

      <p style={{ fontSize: '1.1rem', color: 'var(--texto)', fontWeight: 600, marginBottom: '8px' }}>
        Tu pedido está en preparación.
      </p>

      {resultado === 'error' && (
        <p style={{
          fontSize: '0.8rem', color: '#b84a4a',
          maxWidth: 420, margin: '0 auto 12px',
          background: 'rgba(184,74,74,0.07)',
          padding: '10px 16px', borderRadius: 12,
          border: '1px solid rgba(184,74,74,0.2)',
        }}>
          Mercado Pago procesó el pago, pero hubo un inconveniente al actualizar tu pedido en nuestra base de datos. El equipo lo corregirá a la brevedad.
        </p>
      )}

      <p style={{ fontSize: '0.9rem', color: '#888', maxWidth: '420px', margin: '0 auto 36px', lineHeight: 1.6 }}>
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

export default function PagoExitoso() {
  return (
    <Suspense fallback={null}>
      <PagoExitosoContent />
    </Suspense>
  );
}
