"use client";

import React, { useState, useEffect } from "react";
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
    notas: "",
  });

  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Computed client-side only to avoid server/client hydration mismatch
  const [minFecha, setMinFecha] = useState("");
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setMinFecha(d.toISOString().split("T")[0]);
  }, []);

  const renderOpcionesTexto = (opc) => {
    if (!opc) return "";
    return Object.entries(opc)
      .filter(([, val]) => val !== "" && val !== null)
      .map(([campo, val]) => {
        const nombre = campo.charAt(0).toUpperCase() + campo.slice(1);
        return `${nombre}: ${val}`;
      })
      .join(" | ");
  };

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-AR").format(precio);

  const actualizarDato = (campo, valor) => {
    setDatosPedido((prev) => ({ ...prev, [campo]: valor }));
    if (error) setError("");
  };

  const validarPedido = () => {
    if (cart.length === 0)
      return "El carrito está vacío. Agregá algo rico antes de confirmar.";
    if (!datosPedido.nombre.trim()) return "Falta completar tu nombre.";
    if (!datosPedido.telefono.trim()) return "Falta completar tu teléfono.";
    if (!datosPedido.fecha) return "Falta elegir una fecha estimada.";
    if (!datosPedido.horario.trim()) return "Falta completar un horario estimado.";
    if (datosPedido.metodoEntrega === "envio") {
      if (!datosPedido.direccion.trim()) return "Falta completar la dirección de envío.";
      if (!datosPedido.zona.trim()) return "Falta completar la zona o barrio.";
    }
    return "";
  };

  const confirmarYPagar = async (e) => {
    e.preventDefault();

    const errorValidacion = validarPedido();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setEnviando(true);

    const direccionFinal =
      datosPedido.metodoEntrega === "envio"
        ? `${datosPedido.direccion} - ${datosPedido.zona}`
        : "Retiro - a coordinar";

    try {
      const res = await fetch("/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_cliente: datosPedido.nombre,
          telefono: datosPedido.telefono,
          direccion: direccionFinal,
          notas: datosPedido.notas,
          metodo_pago: "mercadopago",
          metodo_entrega: datosPedido.metodoEntrega,
          fecha: datosPedido.fecha,
          horario: datosPedido.horario,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.init_point) {
        setError("Hubo un problema al procesar tu pedido. Por favor, intenta de nuevo o comunícate con nosotros.");
        setEnviando(false);
        return;
      }

      window.location.href = result.init_point;
    } catch {
      setError("Hubo un problema al procesar tu pedido. Por favor, intenta de nuevo o comunícate con nosotros.");
      setEnviando(false);
    }
  };

  if (cart.length === 0) {
    return (
      <section className="page-vacia fade-in-up">
        <h3 className="titulo-seccion">Confirmar pedido</h3>
        <div className="checkout-wrapper checkout-empty">
          <h3 className="checkout-title">Tu carrito está vacío</h3>
          <p className="checkout-subtitle">
            Antes de pagar, agregá algún producto al carrito.
          </p>
          <Link href="/menu">
            <button className="btn-coordinar-pedido">Ver menú</button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-vacia fade-in-up">
      <h3 className="titulo-seccion">¡Estás a un solo paso!</h3>

      <div className="checkout-wrapper">
        <h3 className="checkout-title">Confirmá tu pedido</h3>

        <p className="checkout-subtitle">
          Completá tus datos y pagá de forma segura con Mercado Pago.
        </p>

        <form className="checkout-form" onSubmit={confirmarYPagar}>
          {/* Resumen */}
          <div className="checkout-section">
            <h4>Resumen de tu pedido</h4>

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
                <span>Total</span>
                <strong>${formatearPrecio(totalCarrito)}</strong>
              </div>
            </div>

            <Link href="/carrito">
              <button type="button" className="btn-editar-carrito">
                Editar carrito
              </button>
            </Link>
          </div>

          {/* Datos del cliente */}
          <div className="checkout-section">
            <h4>Tus datos</h4>

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

          {/* Entrega */}
          <div className="checkout-section">
            <h4>Entrega</h4>

            <div className="checkout-options">
              <label className="checkout-option">
                <input
                  type="radio"
                  name="metodoEntrega"
                  value="envio"
                  checked={datosPedido.metodoEntrega === "envio"}
                  onChange={(e) => actualizarDato("metodoEntrega", e.target.value)}
                />
                <span>
                  <strong>Envío a domicilio</strong>
                  Lo coordinamos según zona y disponibilidad.
                </span>
              </label>

              <label className="checkout-option">
                <input
                  type="radio"
                  name="metodoEntrega"
                  value="retiro"
                  checked={datosPedido.metodoEntrega === "retiro"}
                  onChange={(e) => actualizarDato("metodoEntrega", e.target.value)}
                />
                <span>
                  <strong>Retiro</strong>
                  Te avisamos la dirección una vez confirmado el pago.
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
                      onChange={(e) => actualizarDato("direccion", e.target.value)}
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
                  min={minFecha}
                  value={datosPedido.fecha}
                  onChange={(e) => actualizarDato("fecha", e.target.value)}
                />
              </div>

              <div className="checkout-field">
                <label>Horario disponible</label>
                <select
                  value={datosPedido.horario}
                  onChange={(e) => actualizarDato("horario", e.target.value)}
                >
                  <option value="">Elegí un horario</option>
                  <option value="09:00 a 13:00">09:00 a 13:00</option>
                  <option value="13:00 a 17:00">13:00 a 17:00</option>
                  <option value="17:00 a 20:00">17:00 a 20:00</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="checkout-section">
            <h4>Notas para la pastelera</h4>

            <div className="checkout-field">
              <label>Comentarios adicionales (opcional)</label>
              <textarea
                placeholder="Ej: Es para un cumpleaños, preferimos tonos pastel, consultar por velitas..."
                value={datosPedido.notas}
                onChange={(e) => actualizarDato("notas", e.target.value)}
              />
            </div>
          </div>

          {error && <div className="checkout-error">{error}</div>}

          <button
            type="submit"
            className="btn-coordinar-pedido"
            disabled={enviando}
          >
            {enviando ? "Procesando pedido..." : "Confirmar y Pagar"}
          </button>

          <p className="checkout-aclaracion">
            Serás redirigido a Mercado Pago para completar el pago de forma
            segura. El envío puede tener costo adicional según zona.
          </p>
        </form>
      </div>
    </section>
  );
}
