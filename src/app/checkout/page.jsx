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

  const [erroresCampo, setErroresCampo] = useState({});
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [pedidoSinPago, setPedidoSinPago] = useState(null);

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
    if (erroresCampo[campo]) {
      setErroresCampo((prev) => ({ ...prev, [campo]: "" }));
    }
  };

  const validarCampos = () => {
    const errs = {};

    if (!datosPedido.nombre.trim()) {
      errs.nombre = "El nombre es obligatorio.";
    }

    const soloDigitos = datosPedido.telefono.replace(/\D/g, "");
    if (!datosPedido.telefono.trim()) {
      errs.telefono = "El teléfono es obligatorio.";
    } else if (soloDigitos.length < 8) {
      errs.telefono = "El teléfono debe contener solo números y al menos 8 dígitos.";
    }

    if (!datosPedido.fecha) {
      errs.fecha = "Elegí una fecha estimada.";
    }

    if (!datosPedido.horario) {
      errs.horario = "Elegí un horario disponible.";
    }

    if (datosPedido.metodoEntrega === "envio") {
      if (!datosPedido.direccion.trim()) {
        errs.direccion = "La dirección de envío es obligatoria.";
      }
      if (!datosPedido.zona.trim()) {
        errs.zona = "La zona o barrio es obligatoria.";
      }
    }

    return errs;
  };

  const confirmarYPagar = async (e) => {
    e.preventDefault();
    setError("");

    const errs = validarCampos();
    if (Object.keys(errs).length > 0) {
      setErroresCampo(errs);
      // Scroll suave al primer campo con error
      const primerCampoId = Object.keys(errs)[0];
      document.getElementById(`field-${primerCampoId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
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

      if (!res.ok) {
        setError(result.error || "Hubo un problema al procesar tu pedido. Por favor, intentá de nuevo.");
        setEnviando(false);
        return;
      }

      if (result.init_point) {
        window.location.href = result.init_point;
        return;
      }

      setPedidoSinPago({ id: result.pedidoId, total: result.total });
      setEnviando(false);
    } catch {
      setError("Error de conexión. Por favor, verificá tu internet e intentá de nuevo.");
      setEnviando(false);
    }
  };

  const err = (campo) => erroresCampo[campo];
  const inputClass = (campo) => err(campo) ? "input-error" : "";

  if (pedidoSinPago) {
    return (
      <section className="page-vacia fade-in-up">
        <h3 className="titulo-seccion">Pedido recibido</h3>
        <div className="checkout-wrapper auth-wrapper" style={{ textAlign: "center" }}>
          <h3 className="checkout-title">¡Tu pedido N°{pedidoSinPago.id} está guardado!</h3>
          <p className="checkout-subtitle">
            Hubo un problema al conectar con Mercado Pago, pero tu pedido quedó registrado.
            Podés retomar el pago desde &quot;Mis pedidos&quot; cuando quieras.
          </p>
          <Link href="/ordenes">
            <button className="btn-coordinar-pedido">Ir a Mis pedidos</button>
          </Link>
        </div>
      </section>
    );
  }

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

        <form className="checkout-form" onSubmit={confirmarYPagar} noValidate>

          {/* Resumen */}
          <div className="checkout-section">
            <h4>Resumen de tu pedido</h4>
            <div className="checkout-resumen checkout-resumen-top">
              {cart.map((item) => (
                <div key={item.cartId} className="checkout-resumen-item">
                  <p>
                    {item.name}
                    {item.opciones && <small>{renderOpcionesTexto(item.opciones)}</small>}
                  </p>
                  <span className="checkout-resumen-precio">${formatearPrecio(item.precio)}</span>
                </div>
              ))}
              <div className="checkout-total-final">
                <span>Total</span>
                <strong>${formatearPrecio(totalCarrito)}</strong>
              </div>
            </div>
            <Link href="/carrito">
              <button type="button" className="btn-editar-carrito">Editar carrito</button>
            </Link>
          </div>

          {/* Datos del cliente */}
          <div className="checkout-section">
            <h4>Tus datos</h4>
            <div className="checkout-grid">

              <div className="checkout-field" id="field-nombre">
                <label>Nombre</label>
                <input
                  type="text"
                  placeholder="Ej: Sofía"
                  value={datosPedido.nombre}
                  className={inputClass("nombre")}
                  onChange={(e) => actualizarDato("nombre", e.target.value)}
                />
                {err("nombre") && <span className="campo-error-msg">{err("nombre")}</span>}
              </div>

              <div className="checkout-field" id="field-telefono">
                <label>Teléfono</label>
                <input
                  type="tel"
                  placeholder="Ej: 11 3390-1250"
                  value={datosPedido.telefono}
                  className={inputClass("telefono")}
                  onChange={(e) => {
                    // Filtra letras; permite dígitos, espacios, guiones y paréntesis
                    const val = e.target.value.replace(/[^0-9\s\-()]/g, "");
                    actualizarDato("telefono", val);
                  }}
                />
                {err("telefono") && <span className="campo-error-msg">{err("telefono")}</span>}
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
                  <div className="checkout-field full" id="field-direccion">
                    <label>Dirección</label>
                    <input
                      type="text"
                      placeholder="Calle, número, piso/depto"
                      value={datosPedido.direccion}
                      className={inputClass("direccion")}
                      onChange={(e) => actualizarDato("direccion", e.target.value)}
                    />
                    {err("direccion") && <span className="campo-error-msg">{err("direccion")}</span>}
                  </div>

                  <div className="checkout-field" id="field-zona">
                    <label>Zona / barrio</label>
                    <input
                      type="text"
                      placeholder="Ej: Palermo, Boedo, Recoleta"
                      value={datosPedido.zona}
                      className={inputClass("zona")}
                      onChange={(e) => actualizarDato("zona", e.target.value)}
                    />
                    {err("zona") && <span className="campo-error-msg">{err("zona")}</span>}
                  </div>
                </>
              )}

              <div className="checkout-field" id="field-fecha">
                <label>Fecha estimada</label>
                <input
                  type="date"
                  min={minFecha}
                  value={datosPedido.fecha}
                  className={inputClass("fecha")}
                  onChange={(e) => actualizarDato("fecha", e.target.value)}
                />
                {err("fecha") && <span className="campo-error-msg">{err("fecha")}</span>}
              </div>

              <div className="checkout-field" id="field-horario">
                <label>Horario disponible</label>
                <select
                  value={datosPedido.horario}
                  className={inputClass("horario")}
                  onChange={(e) => actualizarDato("horario", e.target.value)}
                >
                  <option value="">Elegí un horario</option>
                  <option value="09:00 a 13:00">09:00 a 13:00</option>
                  <option value="13:00 a 17:00">13:00 a 17:00</option>
                  <option value="17:00 a 20:00">17:00 a 20:00</option>
                </select>
                {err("horario") && <span className="campo-error-msg">{err("horario")}</span>}
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

          <button type="submit" className="btn-coordinar-pedido" disabled={enviando}>
            {enviando ? "Procesando pedido..." : "Confirmar y Pagar"}
          </button>

          <p className="checkout-aclaracion">
            Serás redirigido a Mercado Pago para completar el pago de forma segura.
            El envío puede tener costo adicional según zona.
          </p>
        </form>
      </div>
    </section>
  );
}
