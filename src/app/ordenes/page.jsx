'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [accionando, setAccionando] = useState({});

  useEffect(() => {
    async function fetchOrdenes() {
      const res = await fetch('/api/ordenes', { cache: 'no-store' });
      if (res.status === 401) {
        setError('Tenés que iniciar sesión para ver tus pedidos.');
        setCargando(false);
        return;
      }
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setOrdenes(data.ordenes || []);
      }
      setCargando(false);
    }
    fetchOrdenes();
  }, []);

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat('es-AR').format(precio);

  const formatearFecha = (iso) =>
    new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

  const badgeColor = {
    pendiente: '#f0a500',
    pagado: '#2e7d6e',
    cancelado: '#b84a4a',
  };

  const handleCancelar = async (id) => {
    if (!confirm('¿Cancelar este pedido? Esta acción no se puede deshacer.')) return;
    setAccionando(prev => ({ ...prev, [id]: 'cancelando' }));
    try {
      const res = await fetch(`/api/ordenes/${id}`, { method: 'PATCH' });
      if (res.ok) {
        // Elimina el pedido cancelado de la lista de forma inmediata
        setOrdenes(prev => prev.filter(o => o.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'No se pudo cancelar el pedido.');
      }
    } catch {
      alert('Error de conexión. Intentá de nuevo.');
    } finally {
      setAccionando(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleRetomar = async (id) => {
    setAccionando(prev => ({ ...prev, [id]: 'retomando' }));
    try {
      const res = await fetch(`/api/ordenes/${id}`);
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert(data.error || 'No se pudo generar el link de pago. Comunicate con nosotros por WhatsApp.');
        setAccionando(prev => ({ ...prev, [id]: null }));
      }
    } catch {
      alert('Error de conexión. Intentá de nuevo.');
      setAccionando(prev => ({ ...prev, [id]: null }));
    }
  };

  if (cargando) {
    return (
      <section className="page-vacia fade-in-up">
        <h3 className="titulo-seccion">Mis pedidos</h3>
        <p style={{ textAlign: 'center', color: 'var(--texto)' }}>Cargando historial...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-vacia fade-in-up">
        <h3 className="titulo-seccion">Mis pedidos</h3>
        <div className="checkout-wrapper" style={{ maxWidth: 480, textAlign: 'center' }}>
          <p className="checkout-error">{error}</p>
          <Link href="/login?redirect=/ordenes">
            <button className="btn-coordinar-pedido" style={{ marginTop: 16 }}>
              Iniciar sesión
            </button>
          </Link>
        </div>
      </section>
    );
  }

  if (ordenes.length === 0) {
    return (
      <section className="page-vacia fade-in-up">
        <h3 className="titulo-seccion">Mis pedidos</h3>
        <div className="checkout-wrapper" style={{ maxWidth: 480, textAlign: 'center' }}>
          <p className="checkout-subtitle">Todavía no hiciste ningún pedido.</p>
          <Link href="/menu">
            <button className="btn-coordinar-pedido" style={{ marginTop: 16 }}>
              Ver menú
            </button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-vacia fade-in-up">
      <h3 className="titulo-seccion">Mis pedidos</h3>

      <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ordenes.map((orden) => (
          <div key={orden.id} className="checkout-wrapper" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: '0.78rem', color: '#aaa' }}>{formatearFecha(orden.created_at)}</p>
                <p style={{ fontWeight: 800, color: 'var(--violeta-acento)', fontSize: '1rem' }}>
                  Pedido N° {orden.id}
                </p>
              </div>
              <span style={{
                background: badgeColor[orden.estado_pago] ?? '#aaa',
                color: 'white',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: '0.78rem',
                fontWeight: 700,
              }}>
                {orden.estado_pago}
              </span>
            </div>

            <div className="checkout-resumen checkout-resumen-top">
              {(orden.items || []).map((item, i) => (
                <div key={i} className="checkout-resumen-item">
                  <p>
                    {item.name}
                    {item.opciones && (
                      <small>
                        {Object.entries(item.opciones)
                          .filter(([, v]) => v && v !== '')
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' | ')}
                      </small>
                    )}
                  </p>
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

            {orden.estado_pago === 'pendiente' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleRetomar(orden.id)}
                  className="btn-coordinar-pedido"
                  disabled={!!accionando[orden.id]}
                  style={{ fontSize: '0.82rem', padding: '9px 20px', flex: 1, minWidth: 140 }}
                >
                  {accionando[orden.id] === 'retomando' ? 'Generando link...' : 'Retomar pago'}
                </button>
                <button
                  onClick={() => handleCancelar(orden.id)}
                  disabled={!!accionando[orden.id]}
                  style={{
                    fontSize: '0.82rem', padding: '9px 20px',
                    background: 'none', border: '1.5px solid #b84a4a',
                    color: '#b84a4a', borderRadius: 20, cursor: 'pointer',
                    fontWeight: 700, fontFamily: 'inherit', flex: 1, minWidth: 140,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff0f0'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {accionando[orden.id] === 'cancelando' ? 'Cancelando...' : 'Cancelar pedido'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
