"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";

export default function Carrito() {
  const { cart, eliminarDelCarrito, totalCarrito } = useCart();

  const renderOpcionesTexto = (opc) => {
    if (!opc) return null;

    return Object.entries(opc)
      .filter(([key, val]) => val !== "" && val !== null)
      .map(([key, val]) => {
        const nombreCampo = key.charAt(0).toUpperCase() + key.slice(1);
        return `${nombreCampo}: ${val}`;
      })
      .join(" | ");
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-AR").format(precio);
  };

  return (
    <section className="page-vacia fade-in-up">
      <h3 className="titulo-seccion">tu pedido.</h3>

      {cart.length === 0 ? (
        <div className="carrito-vacio">
          <p>El carrito está vacío :(</p>

          <Link href="/menu">
            <button className="btn-volver-menu">Ver menú</button>
          </Link>
        </div>
      ) : (
        <div className="lista-carrito">
          {cart.map((item) => (
            <div key={item.cartId} className="item-carrito">
              <img src={item.img} alt={item.name} />

              <div className="item-info">
                <h4>{item.name}</h4>

                {item.opciones && (
                  <p className="opciones-txt">
                    {renderOpcionesTexto(item.opciones)}
                  </p>
                )}
              </div>

              <div className="item-precio">
                <p>${formatearPrecio(item.precio)}</p>

                <button onClick={() => eliminarDelCarrito(item.cartId)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          <div className="carrito-total">
            <h3>Total: ${formatearPrecio(totalCarrito)}</h3>
          </div>

          <Link href="/checkout">
            <button className="btn-finalizar">
              Confirmar pedido
            </button>
          </Link>

          <Link href="/menu">
            <button className="btn-seguir-comprando">
              Seguir viendo el menú
            </button>
          </Link>
        </div>
      )}
    </section>
  );
}