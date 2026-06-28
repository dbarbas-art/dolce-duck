'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [accionando, setAccionando] = useState({});
  const [errorAccion, setErrorAccion] = useState('');

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

  // Normaliza los estados de MP ('approved') y los propios ('pagado')
  const esPagado = (estado) => estado === 'pagado' || estado === 'approved';
  const esPendiente = (estado) => estado === 'pendiente';

  const estadoConfig = {
    pendiente: {
      label: 'Pendiente de pago',
      bg: '#FFF8E6',
      color: '#9a6700',
      border: 'rgba(240, 165, 0, 0.35)',
      icono: '⏳',
    },
    pagado: {
      label: 'Pagado',
      bg: '#E8F5F3',
      color: '#1f6b5e',
      border: 'rgba(46, 125, 110, 0.35)',
      icono: '✓',
    },
    approved: {
      label: 'Pagado',
      bg: '#E8F5F3',
      color: '#1f6b5e',
      border: 'rgba(46, 125, 110, 0.35)',
      icono: '✓',
    },
  };

  const getBadge = (estado) => estadoConfig[estado] ?? {
    label: estado,
    bg: '#f0f0f0',
    color: '#666',
    border: 'rgba(0,0,0,0.1)',
    icono: '•',
  };

  const handleCancelar = async (id) => {
    if (!confirm('¿Cancelar este pedido? Esta acción no se puede deshacer.')) return;
    setErrorAccion('');
    setAccionando(prev => ({ ...prev, [id]: 'cancelando' }));
    try {
      const res = await fetch(`/api/ordenes/${id}`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok) {
        setOrdenes(prev => prev.filter(o => o.id !== id));
      } else {
        setErrorAccion(`Error al cancelar el pedido: ${data.error || 'Error desconocido.'}`);
      }
    } catch (e) {
      setErrorAccion(`Error de conexión: ${e.message || 'Intentá de nuevo.'}`);
    } finally {
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

      {errorAccion && (
        <div className="checkout-error" style={{ maxWidth: 780, margin: '0 auto 16px', whiteSpace: 'pre-wrap' }}>
          {errorAccion}
        </div>
      )}

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
              {(() => {
                const badge = getBadge(orden.estado_pago);
                return (
                  <span style={{
                    background: badge.bg,
                    color: badge.color,
                    border: `1.5px solid ${badge.border}`,
                    padding: '5px 14px',
                    borderRadius: 20,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                    <span style={{ fontSize: '0.85rem' }}>{badge.icono}</span>
                    {badge.label}
                  </span>
                );
              })()}
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

            {esPendiente(orden.estado_pago) && (
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <Link href={`/pago/${orden.id}`} style={{ flex: 1, minWidth: 140 }}>
                  <button
                    className="btn-coordinar-pedido"
                    style={{ fontSize: '0.82rem', padding: '9px 20px', width: '100%' }}
                  >
                    Pagar ahora
                  </button>
                </Link>
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

            {esPagado(orden.estado_pago) && (
              <div style={{ marginTop: 16 }}>
                <button
                  disabled
                  style={{
                    fontSize: '0.8rem', padding: '9px 20px',
                    background: '#f5f5f5', border: '1.5px solid #ddd',
                    color: '#aaa', borderRadius: 20, cursor: 'not-allowed',
                    fontWeight: 600, fontFamily: 'inherit', width: '100%',
                  }}
                >
                  No se puede cancelar un pedido pagado
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
