import React from 'react';

const Detalle = ({ selectedProduct, navegar, opciones, setOpciones, agregarAlCarrito }) => {
  return (
    <section className="page-detalle fade-in-up">
      <button className="btn-volver" onClick={() => navegar('menu')}>← Volver</button>
      <div className="detalle-layout">
        <div className="detalle-imagenes">
          <img src={selectedProduct.img} alt={selectedProduct.name} className="img-principal" />
          {selectedProduct.tipo === 'torta' && (
            <div className="img-minis">
              <p>Ejemplos de diseño:</p>
              <img src="/images/tortacumple.jpg" alt="Ejemplo 1" />
              <img src="/images/tortainicio.jpg" alt="Ejemplo 2" />
              <img src="/images/tortasol.jpg" alt="Ejemplo 3" />
            </div>
          )}
        </div>

        <div className="detalle-info">
          <h2>{selectedProduct.name}.</h2>
          <p className="slogan-detalle">{selectedProduct.slogan}</p>
          <p className="precio-detalle">${selectedProduct.precio}</p>
          
          {selectedProduct.tipo === 'torta' && (
            <div className="form-personalizado">
              <label>Sabor de Bizcochuelo:</label>
              <select value={opciones?.sabor || ''} onChange={(e) => setOpciones({...opciones, sabor: e.target.value})}>
                <option>Vainilla</option>
                <option>Chocolate</option>
                <option>Red Velvet</option>
              </select>
              <label>Relleno:</label>
              <select value={opciones?.relleno || ''} onChange={(e) => setOpciones({...opciones, relleno: e.target.value})}>
                <option>Dulce de leche</option>
                <option>Duraznos con crema</option>
                <option>Crema Bonobon</option>
                <option>Nutella</option>
                <option>Frutillas con crema</option>
              </select>
              <label>Imagen de referencia / Diseño:</label>
              <input type="file" className="input-file" />
              <p className="nota-pastelera">* Una vez realizado el pedido, la pastelera te contactará para definir el diseño final.</p>
            </div>
          )}

          {selectedProduct.tipo === 'budin' && (
            <div className="form-personalizado">
              <label>Sabor de Budín:</label>
              <select 
                value={opciones?.sabor || ''} 
                onChange={(e) => {
                  const nuevoSabor = e.target.value;
                  const nuevoAgregado = (nuevoSabor === 'Limón' || nuevoSabor === 'Naranja') ? 'Con glaseado' : 'Con chips de chocolate';
                  setOpciones({ sabor: nuevoSabor, agregado: nuevoAgregado });
                }}
              >
                <option>Limón</option>
                <option>Naranja</option>
                <option>Vainilla</option>
                <option>Chocolate</option>
              </select>
              <label>Agregado:</label>
              <select value={opciones?.agregado || ''} onChange={(e) => setOpciones({...opciones, agregado: e.target.value})}>
                {(opciones?.sabor === 'Limón' || opciones?.sabor === 'Naranja') ? (
                  <><option>Con glaseado</option><option>Sin glaseado</option></>
                ) : (
                  <><option>Con chips de chocolate</option><option>Sin chips</option></>
                )}
              </select>
            </div>
          )}

          {selectedProduct.tipo === 'galletitas' && (
            <div className="form-personalizado">
              <label>Variedad de Masa:</label>
              <select value={opciones?.variedad || ''} onChange={(e) => setOpciones({...opciones, variedad: e.target.value})}>
                <option>Manteca</option>
                <option>Jengibre</option>
              </select>
              <label>Glaseado:</label>
              <select value={opciones?.glaseado || ''} onChange={(e) => setOpciones({...opciones, glaseado: e.target.value})}>
                <option>Sin glaseado</option>
                <option>Con glaseado</option>
              </select>
              {opciones?.glaseado === 'Con glaseado' && (
                <>
                  <label>Descripción del diseño:</label>
                  <input type="text" className="input-text" placeholder="Ej: Forma de estrella, flores rosas..." 
                    value={opciones?.descripcionGlaseado || ''} 
                    onChange={(e) => setOpciones({...opciones, descripcionGlaseado: e.target.value})} 
                  />
                  <label>Foto de referencia (opcional):</label>
                  <input type="file" className="input-file" />
                </>
              )}
            </div>
          )}

          {selectedProduct.tipo === 'pastafrola' && (
            <div className="form-personalizado">
              <label>Relleno:</label>
              <select value={opciones?.relleno || ''} onChange={(e) => setOpciones({...opciones, relleno: e.target.value})}>
                <option>Membrillo</option>
                <option>Batata</option>
              </select>
            </div>
          )}

          {selectedProduct.tipo === 'pepas' && (
            <div className="form-personalizado">
              <label>Relleno:</label>
              <select value={opciones?.relleno || ''} onChange={(e) => setOpciones({...opciones, relleno: e.target.value})}>
                <option>Dulce de leche</option>
                <option>Membrillo</option>
                <option>Batata</option>
              </select>
            </div>
          )}

          <button 
            className="btn-comprar-grande" 
            onClick={() => agregarAlCarrito(selectedProduct, opciones)}
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </section>
  );
};

export default Detalle;