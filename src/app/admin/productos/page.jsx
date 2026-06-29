'use client';
import { useState, useEffect, useCallback } from 'react';

const TIPOS = ['normal', 'torta', 'budin', 'pastafrola', 'pepas', 'galletitas'];

const FORM_VACIO = {
  name: '', slogan: '', precio: '', tipo: 'normal', stock: '50', img: '', active: true,
};

const fmt = (n) => new Intl.NumberFormat('es-AR').format(n);

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');
  const [toggling, setToggling] = useState({});

  const fetchProductos = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/admin/productos', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al cargar'); return; }
      setProductos(data.productos || []);
    } catch {
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { fetchProductos(); }, [fetchProductos]);

  function openAdd() {
    setEditando(null);
    setFormData(FORM_VACIO);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(prod) {
    setEditando(prod);
    setFormData({
      name:   prod.name   ?? '',
      slogan: prod.slogan ?? '',
      precio: String(prod.precio ?? ''),
      tipo:   prod.tipo   ?? 'normal',
      stock:  String(prod.stock  ?? 0),
      img:    prod.img    ?? '',
      active: prod.active !== false,
    });
    setFormError('');
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); setEditando(null); }

  function handleFieldChange(campo, valor) {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) { setFormError('El nombre es obligatorio.'); return; }
    if (!formData.precio || isNaN(Number(formData.precio)) || Number(formData.precio) <= 0) {
      setFormError('El precio debe ser un número mayor a 0.'); return;
    }

    setGuardando(true);
    const payload = {
      name:   formData.name.trim(),
      slogan: formData.slogan.trim() || null,
      precio: Number(formData.precio),
      tipo:   formData.tipo,
      stock:  Number(formData.stock) || 0,
      img:    formData.img.trim() || null,
      active: formData.active,
    };

    try {
      let res;
      if (editando) {
        res = await fetch(`/api/admin/productos/${editando.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || 'Error al guardar.'); return; }

      closeForm();
      fetchProductos();
    } catch {
      setFormError('Error de conexión.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggleActive(prod) {
    setToggling(prev => ({ ...prev, [prod.id]: true }));
    try {
      const res = await fetch(`/api/admin/productos/${prod.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !(prod.active !== false) }),
      });
      if (res.ok) {
        setProductos(prev =>
          prev.map(p => p.id === prod.id ? { ...p, active: !(prod.active !== false) } : p)
        );
      } else {
        const data = await res.json();
        alert('Error: ' + (data.error || 'Intentá de nuevo'));
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setToggling(prev => ({ ...prev, [prod.id]: false }));
    }
  }

  async function handleEliminar(prod) {
    if (!confirm(`¿Eliminar "${prod.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/admin/productos/${prod.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProductos(prev => prev.filter(p => p.id !== prod.id));
      } else {
        const data = await res.json();
        alert('Error: ' + (data.error || 'Intentá de nuevo'));
      }
    } catch {
      alert('Error de conexión');
    }
  }

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">🛍️ Productos ({productos.length})</h2>
          <button className="btn-admin btn-admin-primary" onClick={openAdd}>
            + Agregar producto
          </button>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr className="admin-loading-row">
                  <td colSpan={6}>Cargando productos...</td>
                </tr>
              )}
              {!cargando && productos.length === 0 && (
                <tr className="admin-empty-row">
                  <td colSpan={6}>No hay productos cargados.</td>
                </tr>
              )}
              {!cargando && productos.map(prod => (
                <tr key={prod.id} style={{ opacity: prod.active === false ? 0.5 : 1 }}>
                  <td>
                    <span style={{ fontWeight: 700 }}>{prod.name}</span>
                    {prod.slogan && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginTop: 2 }}>
                        {prod.slogan}
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{
                      background: 'rgba(160,205,203,0.15)', color: '#1f6b5e',
                      padding: '2px 9px', borderRadius: 10, fontSize: '0.73rem', fontWeight: 700,
                    }}>
                      {prod.tipo}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>${fmt(prod.precio)}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: (prod.stock ?? 0) === 0 ? '#b84a4a' : (prod.stock ?? 0) < 10 ? '#9a6700' : 'var(--texto)',
                    }}>
                      {prod.stock ?? 0}
                    </span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={prod.active !== false}
                        disabled={!!toggling[prod.id]}
                        onChange={() => handleToggleActive(prod)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn-admin btn-admin-outline btn-admin-sm"
                        onClick={() => openEdit(prod)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-admin btn-admin-danger btn-admin-sm"
                        onClick={() => handleEliminar(prod)}
                      >
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Form ── */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}>
          <div className="admin-modal">
            <h3>{editando ? `Editar: ${editando.name}` : 'Nuevo producto'}</h3>

            {formError && <div className="admin-error">{formError}</div>}

            <form className="admin-form" onSubmit={handleGuardar} noValidate>
              <div className="admin-field">
                <label>Nombre *</label>
                <input
                  type="text"
                  placeholder="Ej: Brownie"
                  value={formData.name}
                  onChange={e => handleFieldChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <label>Descripción / slogan</label>
                <textarea
                  placeholder="Ej: Con merengue y dulce de leche."
                  value={formData.slogan}
                  onChange={e => handleFieldChange('slogan', e.target.value)}
                />
              </div>

              <div className="admin-form-grid">
                <div className="admin-field">
                  <label>Precio (ARS) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 35000"
                    value={formData.precio}
                    onChange={e => handleFieldChange('precio', e.target.value)}
                    required
                  />
                </div>

                <div className="admin-field">
                  <label>Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={e => handleFieldChange('tipo', e.target.value)}
                  >
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="admin-field">
                  <label>Stock / cupo</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={e => handleFieldChange('stock', e.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <label>Activo en el menú</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6 }}>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={e => handleFieldChange('active', e.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: '0.8rem', color: formData.active ? '#1f6b5e' : '#aaa' }}>
                      {formData.active ? 'Visible' : 'Oculto'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-field">
                <label>Imagen (ruta)</label>
                <input
                  type="text"
                  placeholder="Ej: /images/brownie.jpg"
                  value={formData.img}
                  onChange={e => handleFieldChange('img', e.target.value)}
                />
              </div>

              <div className="admin-form-actions">
                <button type="button" className="btn-admin btn-admin-outline" onClick={closeForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-admin btn-admin-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
