'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function Menu() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchProductos() {
      const { data } = await supabase.from('products').select('*');
      setProductos(data || []);
      setCargando(false);
    }
    fetchProductos();
  }, []);

  if (cargando) {
    return (
      <section className="page-menu fade-in-up">
        <h3 className="titulo-seccion">Nuestro menú</h3>
        <p className="cargando">Cargando productos...</p>
      </section>
    );
  }

  return (
    <section className="page-menu fade-in-up">
      <h3 className="titulo-seccion">Nuestro menú</h3>
      <div className="grilla-productos">
        {productos.map((prod) => (
          <div key={prod.id} className="tarjeta-producto">
            <Link href={`/detalle/${prod.id}`}>
              <img src={prod.img} alt={prod.name} style={{ cursor: 'pointer' }} />
            </Link>
            <div className="tarjeta-info">
              <Link href={`/detalle/${prod.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h4>{prod.name}</h4>
              </Link>
              <p>{prod.slogan}</p>
              <p className="precio-catalogo">${prod.precio}</p>
              <Link href={`/detalle/${prod.id}`}>
                <button className="btn-detalle">Ver detalle</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
