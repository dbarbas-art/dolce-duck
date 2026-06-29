'use client';
import { useState, useEffect } from 'react';

const ESTADOS = ['pendiente', 'pagado', 'en_preparacion', 'entregado', 'cancelado'];

const ESTADO_CONFIG = {
  pendiente:      { label: 'Pendiente',       bg: '#FFF8E6', color: '#9a6700', border: 'rgba(240,165,0,0.35)' },
  pagado:         { label: 'Pagado',          bg: '#E8F5F3', color: '#1f6b5e', border: 'rgba(46,125,110,0.35)' },
  approved:       { label: 'Pagado (MP)',     bg: '#E8F5F3', color: '#1f6b5e', border: 'rgba(46,125,110,0.35)' },
  aprobado:       { label: 'Aprobado',        bg: '#E8F5F3', color: '#1f6b5e', border: 'rgba(46,125,110,0.35)' },
  en_preparacion: { label: 'En preparación',  bg: '#EDF4FF', color: '#1a56b0', border: 'rgba(26,86,176,0.3)' },
  entregado:      { label: 'Entregado',       bg: '#F0FAF5', color: '#276749', border: 'rgba(39,103,73,0.3)' },
  cancelado:      { label: 'Cancelado',       bg: '#FFF0F0', color: '#9b1c1c', border: 'rgba(155,28,28,0.3)' },
};

const getBadge = (estado) => ESTADO_CONFIG[estado] ?? { label: estado, bg: '#f0f0f0', color: '#666', border: 'rgba(0,0,0,0.1)' };

const fmt = (n) => new Intl.NumberFormat('es-AR').format(n);
const fmtFecha = (iso) => new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
const shortId = (id) => String(id).length > 12 ? String(id).slice(0, 8) + '…' : id;

const FILTROS = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'pagado', label: 'Pagado' },
  { key: 'en_preparacion', label: 'En preparación' },
  { key: 'entregado', label: 'Entregado' },
  { key: 'cancelado', label: 'Cancelado' },
];

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [actualizando, setActualizando] = useState({});

  useEffect(() => {
    fetchPedidos();
  }, []);

  async function fetchPedidos() {
    setCargando(true);
    try {
      const res = await fetch('/api/admin/pedidos', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al cargar pedidos'); return; }
      setPedidos(data.pedidos || []);
    } catch {
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  }

  async function handleEstadoChange(id, nuevoEstado) {
    setActualizando(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado_pago: nuevoEstado } : p));
      } else {
        const data = await res.json();
        alert('Error al actualizar: ' + (data.error || 'Intentá de nuevo'));
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setActualizando(prev => ({ ...prev, [id]: false }));
    }
  }

  const pedidosFiltrados = filtro === 'todos'
    ? pedidos
    : pedidos.filter(p => p.estado_pago === filtro || (filtro === 'pagado' && p.estado_pago === 'approved'));

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">📋 Pedidos ({pedidos.length})</h2>
        <button className="btn-admin btn-admin-outline btn-admin-sm" onClick={fetchPedidos}>
          ↻ Actualizar
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-filters">
        {FILTROS.map(f => (
          <button
            key={f.key}
            className={`filter-btn${filtro === f.key ? ' active' : ''}`}
            onClick={() => setFiltro(f.key)}
          >
            {f.label}
            {f.key !== 'todos' && (
              <span style={{ marginLeft: 5, opacity: 0.75 }}>
                ({pedidos.filter(p =>
                  f.key === 'pagado'
                    ? (p.estado_pago === 'pagado' || p.estado_pago === 'approved')
                    : p.estado_pago === f.key
                ).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Cliente</th>
              <th>Tel</th>
              <th>Total</th>
              <th>Método</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr className="admin-loading-row">
                <td colSpan={7}>Cargando pedidos...</td>
              </tr>
            )}
            {!cargando && pedidosFiltrados.length === 0 && (
              <tr className="admin-empty-row">
                <td colSpan={7}>No hay pedidos con ese estado.</td>
              </tr>
            )}
            {!cargando && pedidosFiltrados.map(p => {
              const badge = getBadge(p.estado_pago);
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: 'var(--violeta-acento)', fontSize: '0.78rem' }}>
                    {shortId(p.id)}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{p.nombre_cliente || '—'}</span>
                    {p.notas && (
                      <span title={p.notas} style={{ marginLeft: 5, cursor: 'help', opacity: 0.5 }}>📝</span>
                    )}
                  </td>
                  <td style={{ color: '#666' }}>{p.telefono || '—'}</td>
                  <td style={{ fontWeight: 700 }}>${fmt(p.total)}</td>
                  <td style={{ color: '#777', fontSize: '0.78rem' }}>
                    {p.metodo_pago || 'mp'}
                  </td>
                  <td style={{ color: '#888', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {fmtFecha(p.created_at)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="estado-badge" style={{ background: badge.bg, color: badge.color, border: `1.5px solid ${badge.border}` }}>
                        {badge.label}
                      </span>
                      <select
                        className="estado-select"
                        value={p.estado_pago === 'approved' ? 'pagado' : p.estado_pago}
                        disabled={!!actualizando[p.id]}
                        onChange={(e) => handleEstadoChange(p.id, e.target.value)}
                        title="Cambiar estado"
                      >
                        {ESTADOS.map(e => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                      {actualizando[p.id] && (
                        <span style={{ fontSize: '0.7rem', color: '#aaa' }}>...</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
