import React from 'react';

const Carrito = ({ cart, eliminarDelCarrito, renderOpcionesTexto, totalCarrito }) => {
  return (
    <section className="page-vacia fade-in-up">
      <h3 className="titulo-seccion">tu pedido.</h3>
      {cart.length === 0 ? (
        <p style={{textAlign: 'center'}}>El carrito está vacío :(</p>
      ) : (
        <div className="lista-carrito">
          {cart.map((item) => (
            <div key={item.cartId} className="item-carrito">
              <img src={item.img} alt={item.name} />
              <div className="item-info">
                <h4>{item.name}</h4>
                {item.opciones && (
                  <p className="opciones-txt">{renderOpcionesTexto(item.opciones)}</p>
                )}
              </div>
              <div className="item-precio">
                <p>${item.precio}</p>
                <button onClick={() => eliminarDelCarrito(item.cartId)}>Eliminar</button>
              </div>
            </div>
          ))}
          
          <div className="carrito-total">
            <h3>Total: ${totalCarrito}</h3>
          </div>
          <button className="btn-finalizar">Ir a pagar ${totalCarrito}</button>
        </div>
      )}
    </section>
  );
};

export default Carrito;