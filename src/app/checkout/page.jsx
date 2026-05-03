"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";

export default function Checkout() {
  const { cart, totalCarrito } = useCart();

  const [datosPedido, setDatosPedido] = useState({
    nombre: "",
    telefono: "",
    metodoEntrega: "envio",
    direccion: "",
    zona: "",
    fecha: "",
    horario: "",
    metodoPago: "transferencia",
    notas: "",
  });

  const [error, setError] = useState("");

  const numeroWhatsApp = "5491133901250";

  const renderOpcionesTexto = (opc) => {
    if (!opc) return "";

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

  const actualizarDato = (campo, valor) => {
    setDatosPedido((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    if (error) setError("");
  };

  const validarPedido = () => {
    if (cart.length === 0) {
      return "El carrito está vacío. Agregá algo rico antes de confirmar el pedido.";
    }

    if (!datosPedido.nombre.trim()) {
      return "Falta completar tu nombre.";
    }

    if (!datosPedido.telefono.trim()) {
      return "Falta completar tu teléfono.";
    }

    if (!datosPedido.fecha) {
      return "Falta elegir una fecha estimada para el pedido.";
    }

    if (!datosPedido.horario.trim()) {
      return "Falta completar un horario estimado.";
    }

    if (datosPedido.metodoEntrega === "envio") {
      if (!datosPedido.direccion.trim()) {
        return "Falta completar la dirección de envío.";
      }

      if (!datosPedido.zona.trim()) {
        return "Falta completar la zona o barrio.";
      }
    }

    return "";
  };

  const armarMensajeWhatsApp = () => {
    const productos = cart
      .map((item, index) => {
        const opciones = renderOpcionesTexto(item.opciones);

        return [
          `${index + 1}. ${item.name}`,
          opciones ? `   ${opciones}` : null,
          `   Precio: $${formatearPrecio(item.precio)}`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");

    const entrega =
      datosPedido.metodoEntrega === "envio"
        ? `Envío a domicilio\nDirección: ${datosPedido.direccion}\nZona/Barrio: ${datosPedido.zona}`
        : "Retiro / punto a coordinar";

    const metodoPagoTexto = {
      transferencia: "Transferencia bancaria",
      efectivo: "Efectivo",
      mercadopago: "Mercado Pago",
    }[datosPedido.metodoPago];

    return `Hola Dolce Duck! Quiero coordinar este pedido 🦆💜

DATOS DEL CLIENTE
Nombre: ${datosPedido.nombre}
Teléfono: ${datosPedido.telefono}

PEDIDO
${productos}

TOTAL ESTIMADO: $${formatearPrecio(totalCarrito)}

ENTREGA
${entrega}
Fecha estimada: ${datosPedido.fecha}
Horario estimado: ${datosPedido.horario}

PAGO
Método elegido: ${metodoPagoTexto}

NOTAS
${datosPedido.notas.trim() || "Sin notas adicionales."}

Quedo atento/a para confirmar disponibilidad y forma de pago.`;
  };

  const coordinarPorWhatsApp = (e) => {
    e.preventDefault();

    const errorValidacion = validarPedido();

    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    const mensaje = armarMensajeWhatsApp();
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (cart.length === 0) {
    return (
      <section className="page-vacia fade-in-up">
        <h3 className="titulo-seccion">confirmar pedido.</h3>

        <div className="checkout-wrapper checkout-empty">
          <h3 className="checkout-title">tu carrito está vacío.</h3>

          <p className="checkout-subtitle">
            Antes de coordinar el pago y la entrega, agregá algún producto al
            carrito.
          </p>

          <Link href="/menu">
            <button className="btn-coordinar-pedido">
              Ver menú
            </button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-vacia fade-in-up">
      <h3 className="titulo-seccion">¡estás a un solo paso!</h3>

      <div className="checkout-wrapper">
        <h3 className="checkout-title">coordinemos pago y entrega.</h3>

        <p className="checkout-subtitle">
          Completá estos datos para que confirmemos tu pedido por Whatsapp.
        </p>

        <form className="checkout-form" onSubmit={coordinarPorWhatsApp}>
          <div className="checkout-section">
            <h4>resumen de tu pedido.</h4>

            <div className="checkout-resumen checkout-resumen-top">
              {cart.map((item) => (
                <div key={item.cartId} className="checkout-resumen-item">
                  <p>
                    {item.name}

                    {item.opciones && (
                      <small>{renderOpcionesTexto(item.opciones)}</small>
                    )}
                  </p>

                  <span className="checkout-resumen-precio">
                    ${formatearPrecio(item.precio)}
                  </span>
                </div>
              ))}

              <div className="checkout-total-final">
                <span>Total estimado</span>
                <strong>${formatearPrecio(totalCarrito)}</strong>
              </div>
            </div>

            <Link href="/carrito">
              <button type="button" className="btn-editar-carrito">
                Editar carrito
              </button>
            </Link>
          </div>

          <div className="checkout-section">
            <h4>tus datos.</h4>

            <div className="checkout-grid">
              <div className="checkout-field">
                <label>Nombre</label>

                <input
                  type="text"
                  placeholder="Ej: Sofía"
                  value={datosPedido.nombre}
                  onChange={(e) => actualizarDato("nombre", e.target.value)}
                />
              </div>

              <div className="checkout-field">
                <label>Teléfono</label>

                <input
                  type="tel"
                  placeholder="Ej: 11 3390-1250"
                  value={datosPedido.telefono}
                  onChange={(e) => actualizarDato("telefono", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h4>entrega.</h4>

            <div className="checkout-options">
              <label className="checkout-option">
                <input
                  type="radio"
                  name="metodoEntrega"
                  value="envio"
                  checked={datosPedido.metodoEntrega === "envio"}
                  onChange={(e) =>
                    actualizarDato("metodoEntrega", e.target.value)
                  }
                />

                <span>
                  <strong>Envío</strong>
                  Lo coordinamos según zona y disponibilidad.
                </span>
              </label>

              <label className="checkout-option">
                <input
                  type="radio"
                  name="metodoEntrega"
                  value="retiro"
                  checked={datosPedido.metodoEntrega === "retiro"}
                  onChange={(e) =>
                    actualizarDato("metodoEntrega", e.target.value)
                  }
                />

                <span>
                  <strong>Retiro</strong>
                  Coordinamos un punto y horario por WhatsApp.
                </span>
              </label>
            </div>

            <div className="checkout-grid checkout-grid-extra">
              {datosPedido.metodoEntrega === "envio" && (
                <>
                  <div className="checkout-field full">
                    <label>Dirección</label>

                    <input
                      type="text"
                      placeholder="Calle, número, piso/depto"
                      value={datosPedido.direccion}
                      onChange={(e) =>
                        actualizarDato("direccion", e.target.value)
                      }
                    />
                  </div>

                  <div className="checkout-field">
                    <label>Zona / barrio</label>

                    <input
                      type="text"
                      placeholder="Ej: Palermo, Boedo, Recoleta"
                      value={datosPedido.zona}
                      onChange={(e) => actualizarDato("zona", e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="checkout-field">
                <label>Fecha estimada</label>

                <input
                  type="date"
                  value={datosPedido.fecha}
                  onChange={(e) => actualizarDato("fecha", e.target.value)}
                />
              </div>

              <div className="checkout-field">
                <label>Horario estimado</label>

                <input
                  type="text"
                  placeholder="Ej: 16 a 19 hs"
                  value={datosPedido.horario}
                  onChange={(e) => actualizarDato("horario", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h4>pago.</h4>

            <div className="checkout-options">
              <label className="checkout-option">
                <input
                  type="radio"
                  name="metodoPago"
                  value="transferencia"
                  checked={datosPedido.metodoPago === "transferencia"}
                  onChange={(e) =>
                    actualizarDato("metodoPago", e.target.value)
                  }
                />

                <span>
                  <strong>Transferencia</strong>
                  Te pasamos los datos por WhatsApp.
                </span>
              </label>

              <label className="checkout-option">
                <input
                  type="radio"
                  name="metodoPago"
                  value="mercadopago"
                  checked={datosPedido.metodoPago === "mercadopago"}
                  onChange={(e) =>
                    actualizarDato("metodoPago", e.target.value)
                  }
                />

                <span>
                  <strong>Mercado Pago</strong>
                  Coordinamos link o alias por WhatsApp.
                </span>
              </label>

              <label className="checkout-option">
                <input
                  type="radio"
                  name="metodoPago"
                  value="efectivo"
                  checked={datosPedido.metodoPago === "efectivo"}
                  onChange={(e) =>
                    actualizarDato("metodoPago", e.target.value)
                  }
                />

                <span>
                  <strong>Efectivo</strong>
                  Disponible según el tipo de entrega.
                </span>
              </label>
            </div>
          </div>

          <div className="checkout-section">
            <h4>notas para la pastelera.</h4>

            <div className="checkout-field">
              <label>Comentarios adicionales</label>

              <textarea
                placeholder="Ej: Es para un cumpleaños, preferimos tonos pastel, consultar por velitas..."
                value={datosPedido.notas}
                onChange={(e) => actualizarDato("notas", e.target.value)}
              />
            </div>
          </div>

          {error && <div className="checkout-error">{error}</div>}

          <button type="submit" className="btn-coordinar-pedido">
            Enviar pedido por WhatsApp
          </button>

          <p className="checkout-aclaracion">
            El pedido queda sujeto a confirmación. El envío puede tener costo
            adicional según zona.
          </p>
        </form>
      </div>
    </section>
  );
}