"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";

function agruparItems(cart) {
  const mapa = new Map();
  for (const item of cart) {
    const clave = `${item.product_id}-${JSON.stringify(item.opciones)}`;
    if (mapa.has(clave)) {
      const grupo = mapa.get(clave);
      grupo.cantidad += 1;
      grupo.precioTotal += item.precio;
      grupo.cartIds.push(item.cartId);
    } else {
      mapa.set(clave, { ...item, cantidad: 1, precioTotal: item.precio, cartIds: [item.cartId] });
    }
  }
  return Array.from(mapa.values());
}

export default function Carrito() {
  const { cart, eliminarDelCarrito, totalCarrito, cargando } = useCart();
  const [eliminando, setEliminando] = useState(new Set());

  const renderOpcionesTexto = (opc) => {
    if (!opc) return null;
    return Object.entries(opc)
      .filter(([, val]) => val !== "" && val !== null)
      .map(([key, val]) => {
        const nombreCampo = key.charAt(0).toUpperCase() + key.slice(1);
        return `${nombreCampo}: ${val}`;
      })
      .join(" | ");
  };

  const formatearPrecio = (precio) => new Intl.NumberFormat("es-AR").format(precio);

  const handleEliminarGrupo = async (cartIds) => {
    cartIds.forEach(id => setEliminando(prev => new Set(prev).add(id)));
    await Promise.all(cartIds.map(id => eliminarDelCarrito(id)));
    cartIds.forEach(id =>
      setEliminando(prev => { const next = new Set(prev); next.delete(id); return next; })
    );
  };

  const itemsAgrupados = agruparItems(cart);
  const enEliminacion = (cartIds) => cartIds.some(id => eliminando.has(id));

  if (cargando) {
    return (
      <section className="page-vacia fade-in-up">
        <h3 className="titulo-seccion">Tu pedido</h3>
        <p style={{ textAlign: 'center', color: 'var(--texto)' }}>Cargando tu carrito...</p>
      </section>
    );
  }

  return (
    <section className="page-vacia fade-in-up">
      <h3 className="titulo-seccion">Tu pedido</h3>

      {cart.length === 0 ? (
        <div className="carrito-vacio">
          <p>El carrito está vacío :(</p>
          <Link href="/menu">
            <button className="btn-volver-menu">Ver menú</button>
          </Link>
        </div>
      ) : (
        <div className="lista-carrito">
          {itemsAgrupados.map((grupo) => (
            <div key={grupo.cartIds[0]} className="item-carrito">
              <img src={grupo.img} alt={grupo.name} />

              <div className="item-info">
                <h4>
                  {grupo.name}
                  {grupo.cantidad > 1 && (
                    <span style={{ color: 'var(--violeta-acento)', fontWeight: 700, marginLeft: '6px' }}>
                      x{grupo.cantidad}
                    </span>
                  )}
                </h4>
                {grupo.opciones && (
                  <p className="opciones-txt">{renderOpcionesTexto(grupo.opciones)}</p>
                )}
              </div>

              <div className="item-precio">
                <p>${formatearPrecio(grupo.precioTotal)}</p>
                <button
                  onClick={() => handleEliminarGrupo(grupo.cartIds)}
                  disabled={enEliminacion(grupo.cartIds)}
                >
                  {enEliminacion(grupo.cartIds) ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}

          <div className="carrito-total">
            <h3>Total: ${formatearPrecio(totalCarrito)}</h3>
          </div>

          <Link href="/checkout">
            <button className="btn-finalizar">Confirmar pedido</button>
          </Link>

          <Link href="/menu">
            <button className="btn-seguir-comprando">Seguir viendo el menú</button>
          </Link>
        </div>
      )}
    </section>
  );
}
