"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { catalogoPasteleria } from '../../../data/productos';
import { useCart } from '../../../context/CartContext'; // Asegurate de que esta ruta sea correcta

export default function DetalleProducto() {
  const { id } = useParams();
  const router = useRouter();
  const { agregarAlCarrito } = useCart();
  
  const [producto, setProducto] = useState(null);
  const [opciones, setOpciones] = useState({});

  useEffect(() => {
    const encontrado = catalogoPasteleria.find(p => p.id === parseInt(id));
    if (encontrado) {
      setProducto(encontrado);
      // Inicializar opciones según el tipo (tu lógica anterior)
      if (encontrado.tipo === 'torta') setOpciones({ sabor: 'Vainilla', relleno: 'Dulce de leche' });
      else if (encontrado.tipo === 'budin') setOpciones({ sabor: 'Limón', agregado: 'Con glaseado' });
      else if (encontrado.tipo === 'galletitas') setOpciones({ variedad: 'Manteca', glaseado: 'Sin glaseado', descripcion: '', archivo: null });
      else if (encontrado.tipo === 'pastafrola' || encontrado.tipo === 'pepas') setOpciones({ relleno: 'Membrillo' });
    }
  }, [id]);

  if (!producto) return <p>Cargando...</p>;

  const handleAgregar = () => {
    agregarAlCarrito(producto, opciones);
    // Opcional: router.push('/carrito');
  };

  return (
    <div className="page-detalle fade-in-up">
      <button className="btn-volver" onClick={() => router.back()}>← Volver</button>
      
      <div className="detalle-layout">
        <div className="detalle-imagenes">
          <img src={producto.img} alt={producto.name} className="img-principal" />
        </div>

        <div className="detalle-info">
          <h2>{producto.name}.</h2>
          <p className="slogan-detalle">{producto.slogan}</p>
          <p className="precio-detalle">${producto.precio}</p>

          {/* --- FORMULARIO DINÁMICO --- */}
          <div className="form-personalizado">
            {producto.tipo === 'galletitas' && (
              <>
                <label>Variedad:</label>
                <select onChange={(e) => setOpciones({...opciones, variedad: e.target.value})}>
                  <option value="Manteca">Manteca</option>
                  <option value="Jengibre">Jengibre</option>
                </select>

                <label>Glaseado:</label>
                <select onChange={(e) => setOpciones({...opciones, glaseado: e.target.value})}>
                  <option value="Sin glaseado">Sin glaseado</option>
                  <option value="Con glaseado">Con glaseado (personalizado)</option>
                </select>

                {opciones.glaseado === 'Con glaseado' && (
                  <div className="fade-in-up">
                    <label>Describí tu diseño:</label>
                    <textarea 
                      className="input-text" 
                      placeholder="Ej: Colores pasteles, forma de patito..."
                      onChange={(e) => setOpciones({...opciones, descripcion: e.target.value})}
                    />
                    <label>Subir imagen de referencia:</label>
                    <input type="file" className="input-file" />
                    <p className="nota-pastelera">* El diseño final será coordinado por WhatsApp.</p>
                  </div>
                )}
              </>
            )}

            {producto.tipo === 'torta' && (
              <>
                <label>Sabor del bizcochuelo:</label>
                <select onChange={(e) => setOpciones({...opciones, sabor: e.target.value})}>
                  <option value="Vainilla">Vainilla</option>
                  <option value="Chocolate">Chocolate</option>
                </select>
                <label>Relleno principal:</label>
                <select onChange={(e) => setOpciones({...opciones, relleno: e.target.value})}>
                  <option value="Dulce de leche">Dulce de leche</option>
                  <option value="Ganache de chocolate">Ganache de chocolate</option>
                </select>
              </>
            )}

            {/* Podés seguir agregando los otros tipos (budin, pepas) aquí igual que en tu App.jsx anterior */}
          </div>

          <button className="btn-comprar-grande" onClick={handleAgregar}>
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
}