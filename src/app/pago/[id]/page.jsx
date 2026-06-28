'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PagoPendiente() {
  const { id } = useParams();
  const router = useRouter();
  const [orden, setOrden] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrden() {
      const res = await fetch('/api/ordenes', { cache: 'no-store' });
      if (res.status === 401) {
        router.push(`/login?redirect=/pago/${id}`);
        return;
      }
      const data = await res.json();
      const encontrada = (data.ordenes || []).find(o => String(o.id) === String(id));
      if (!encontrada) {
        setError('No se encontró el pedido, o ya fue cancelado.');
        setCargando(false);
        return;
      }
      if (encontrada.estado_pago === 'pagado' || encontrada.estado_pago === 'approved') {
        router.replace('/ordenes');
        return;
      }
      setOrden(encontrada);
      setCargando(false);
    }
    fetchOrden();
  }, [id, router]);

  const handlePagar = async () => {
    setPagando(true);
    setError('');
    try {
      const res = await fetch(`/api/ordenes/${id}`);
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        setError(data.error || 'No se pudo generar el link de pago. Comunicate con nosotros.');
        setPagando(false);
      }
    } catch {
      setError('Error de conexión. Por favor, intentá de nuevo.');
      setPagando(false);
    }
  };

  const formatearPrecio = (p) => new Intl.NumberFormat('es-AR').format(p);

  if (cargando) {
    return (
      <section className="page-vacia fade-in-up">
        <h3 className="titulo-seccion">Confirmar pago</h3>
        <p style={{ textAlign: 'center', color: 'var(--texto)' }}>Cargando tu pedido...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-vacia fade-in-up">
        <h3 className="titulo-seccion">Confirmar pago</h3>
        <div className="checkout-wrapper auth-wrapper" style={{ textAlign: 'center' }}>
          <p className="checkout-error" style={{ marginBottom: 16 }}>{error}</p>
          <Link href="/ordenes">
            <button className="btn-coordinar-pedido">Ver mis pedidos</button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-vacia fade-in-up">
      <h3 className="titulo-seccion">¡Casi listo!</h3>

      <div className="checkout-wrapper" style={{ maxWidth: 560 }}>

        {/* Banner confirmación */}
        <div style={{
          background: 'rgba(46, 125, 110, 0.08)',
          border: '1.5px solid rgba(46, 125, 110, 0.28)',
          borderRadius: 20,
          padding: '20px 24px',
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '2rem', marginBottom: 8 }}>🎂</p>
          <h3 style={{ color: '#1f6b5e', fontWeight: 800, fontSize: '1.1rem', marginBottom: 6 }}>
            ¡Pedido confirmado!
          </h3>
          <p style={{ color: '#555', fontSize: '0.88rem', lineHeight: 1.55 }}>
            Falta un solo paso para empezar a cocinarlo: realizá el pago.
          </p>
        </div>

        {/* Resumen del pedido */}
        <div className="checkout-section">
          <h4>Resumen · Pedido N° {orden.id}</h4>
          <div className="checkout-resumen checkout-resumen-top">
            {(orden.items || []).map((item, i) => (
              <div key={i} className="checkout-resumen-item">
                <p>{item.name}</p>
                <span className="checkout-resumen-precio">${formatearPrecio(item.precio)}</span>
              </div>
            ))}
            <div className="checkout-total-final">
              <span>Total</span>
              <strong>${formatearPrecio(orden.total)}</strong>
            </div>
          </div>
          {orden.direccion && (
            <p style={{ marginTop: 10, fontSize: '0.82rem', color: '#777' }}>
              Entrega: {orden.direccion}
            </p>
          )}
        </div>

        {error && <div className="checkout-error" style={{ marginTop: 12 }}>{error}</div>}

        <button
          className="btn-coordinar-pedido"
          onClick={handlePagar}
          disabled={pagando}
          style={{ marginTop: 20 }}
        >
          {pagando ? 'Redirigiendo a Mercado Pago...' : 'Pagar con Mercado Pago'}
        </button>

        <p className="checkout-aclaracion" style={{ marginTop: 10 }}>
          Serás redirigido a Mercado Pago de forma segura.
          Si cerrás esta pestaña, podés retomar el pago desde &quot;Mis pedidos&quot;.
        </p>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <Link href="/ordenes" className="auth-link">Ir a Mis pedidos</Link>
        </div>
      </div>
    </section>
  );
}
