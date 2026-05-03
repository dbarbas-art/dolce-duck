"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { catalogoPasteleria } from "../../../data/productos";
import { useCart } from "../../../context/CartContext";

export default function DetalleProducto() {
  const { id } = useParams();
  const router = useRouter();
  const { agregarAlCarrito } = useCart();

  const [producto, setProducto] = useState(null);
  const [opciones, setOpciones] = useState({});

  useEffect(() => {
    const encontrado = catalogoPasteleria.find((p) => p.id === parseInt(id));

    if (encontrado) {
      setProducto(encontrado);

      if (encontrado.tipo === "torta") {
        setOpciones({
          sabor: "Vainilla",
          relleno: "Dulce de leche",
          cobertura: "Buttercream",
          comentario: "",
        });
      } else if (encontrado.tipo === "budin") {
        setOpciones({
          sabor: "Limón",
          agregado: "Con glaseado",
        });
      } else if (encontrado.tipo === "galletitas") {
        setOpciones({
          variedad: "Manteca",
          glaseado: "Sin glaseado",
          descripcion: "",
          archivo: null,
        });
      } else if (encontrado.tipo === "pastafrola") {
        setOpciones({
          relleno: "Membrillo",
        });
      } else if (encontrado.tipo === "pepas") {
        setOpciones({
          relleno: "Membrillo",
        });
      } else {
        setOpciones({});
      }
    }
  }, [id]);

  if (!producto) return <p>Cargando...</p>;

  const actualizarOpcion = (campo, valor) => {
    setOpciones((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleAgregar = () => {
    agregarAlCarrito(producto, opciones);
  };

  return (
    <div className="page-detalle fade-in-up">
      <button className="btn-volver" onClick={() => router.back()}>
        ← Volver
      </button>

      <div className="detalle-layout">
        <div className="detalle-imagenes">
          <img src={producto.img} alt={producto.name} className="img-principal" />
        </div>

        <div className="detalle-info">
          <h2>{producto.name}.</h2>
          <p className="slogan-detalle">{producto.slogan}</p>
          <p className="precio-detalle">${producto.precio}</p>

          <div className="form-personalizado">
            {producto.tipo === "galletitas" && (
              <>
                <label>Variedad:</label>
                <select
                  value={opciones.variedad || "Manteca"}
                  onChange={(e) => actualizarOpcion("variedad", e.target.value)}
                >
                  <option value="Manteca">Manteca</option>
                  <option value="Jengibre">Jengibre</option>
                </select>

                <label>Glaseado:</label>
                <select
                  value={opciones.glaseado || "Sin glaseado"}
                  onChange={(e) => actualizarOpcion("glaseado", e.target.value)}
                >
                  <option value="Sin glaseado">Sin glaseado</option>
                  <option value="Con glaseado">Con glaseado personalizado</option>
                </select>

                {opciones.glaseado === "Con glaseado" && (
                  <div className="fade-in-up">
                    <label>Describí tu diseño:</label>
                    <textarea
                      className="input-text"
                      placeholder="Ej: Colores pasteles, forma de patito..."
                      value={opciones.descripcion || ""}
                      onChange={(e) =>
                        actualizarOpcion("descripcion", e.target.value)
                      }
                    />

                    <label>Subir imagen de referencia:</label>
                    <input
                      type="file"
                      className="input-file"
                      onChange={(e) =>
                        actualizarOpcion("archivo", e.target.files?.[0]?.name || null)
                      }
                    />

                    <p className="nota-pastelera">
                      * El diseño final será coordinado por WhatsApp.
                    </p>
                  </div>
                )}
              </>
            )}

            {producto.tipo === "torta" && (
              <>
                <label>Sabor del bizcochuelo:</label>
                <select
                  value={opciones.sabor || "Vainilla"}
                  onChange={(e) => actualizarOpcion("sabor", e.target.value)}
                >
                  <option value="Vainilla">Vainilla</option>
                  <option value="Chocolate">Chocolate</option>
                  <option value="Red velvet">Red velvet</option>
                  <option value="Limón">Limón</option>
                </select>

                <label>Relleno principal:</label>
                <select
                  value={opciones.relleno || "Dulce de leche"}
                  onChange={(e) => actualizarOpcion("relleno", e.target.value)}
                >
                  <option value="Dulce de leche">Dulce de leche</option>
                  <option value="Ganache de chocolate">Ganache de chocolate</option>
                  <option value="Crema y frutillas">Crema y frutillas</option>
                  <option value="Buttercream">Buttercream</option>
                </select>

                <label>Cobertura:</label>
                <select
                  value={opciones.cobertura || "Buttercream"}
                  onChange={(e) => actualizarOpcion("cobertura", e.target.value)}
                >
                  <option value="Buttercream">Buttercream</option>
                  <option value="Ganache">Ganache</option>
                  <option value="Chantilly">Chantilly</option>
                  <option value="A coordinar">A coordinar</option>
                </select>

                <label>Comentario sobre el diseño:</label>
                <textarea
                  className="input-text"
                  placeholder="Ej: Colores, temática, frase, cantidad de personas..."
                  value={opciones.comentario || ""}
                  onChange={(e) => actualizarOpcion("comentario", e.target.value)}
                />

                <p className="nota-pastelera">
                  * El diseño final y el precio pueden coordinarse por WhatsApp.
                </p>
              </>
            )}

            {producto.tipo === "budin" && (
              <>
                <label>Sabor del budín:</label>
                <select
                  value={opciones.sabor || "Limón"}
                  onChange={(e) => actualizarOpcion("sabor", e.target.value)}
                >
                  <option value="Limón">Limón</option>
                  <option value="Naranja">Naranja</option>
                  <option value="Chocolate">Chocolate</option>
                  <option value="Vainilla">Vainilla</option>
                </select>

                <label>Agregado:</label>
                <select
                  value={opciones.agregado || "Con glaseado"}
                  onChange={(e) => actualizarOpcion("agregado", e.target.value)}
                >
                  <option value="Con glaseado">Con glaseado</option>
                  <option value="Sin glaseado">Sin glaseado</option>
                  <option value="Con chips de chocolate">Con chips de chocolate</option>
                  <option value="Con frutos secos">Con frutos secos</option>
                </select>
              </>
            )}

            {producto.tipo === "pastafrola" && (
              <>
                <label>Relleno:</label>
                <select
                  value={opciones.relleno || "Membrillo"}
                  onChange={(e) => actualizarOpcion("relleno", e.target.value)}
                >
                  <option value="Membrillo">Membrillo</option>
                  <option value="Batata">Batata</option>
                  <option value="Dulce de leche">Dulce de leche</option>
                </select>
              </>
            )}

            {producto.tipo === "pepas" && (
              <>
                <label>Relleno:</label>
                <select
                  value={opciones.relleno || "Membrillo"}
                  onChange={(e) => actualizarOpcion("relleno", e.target.value)}
                >
                  <option value="Membrillo">Membrillo</option>
                  <option value="Batata">Batata</option>
                  <option value="Dulce de leche">Dulce de leche</option>
                </select>
              </>
            )}

            {producto.tipo === "normal" && (
              <p className="nota-pastelera">
                Este producto no necesita personalización. Podés agregarlo directo
                al carrito.
              </p>
            )}
          </div>

          <button className="btn-comprar-grande" onClick={handleAgregar}>
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
}