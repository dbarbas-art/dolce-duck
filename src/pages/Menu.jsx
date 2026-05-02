import React from 'react';
import { catalogoPasteleria } from '../data/productos';

const Menu = ({ verDetalle }) => {
  return (
    <section className="page-menu fade-in-up">
      <h3 className="titulo-seccion">nuestro menú.</h3>
      <div className="grilla-productos">
        {catalogoPasteleria.map((prod) => (
          <div key={prod.id} className="tarjeta-producto" onClick={() => verDetalle(prod)}>
            <img src={prod.img} alt={prod.name} />
            <div className="tarjeta-info">
              <h4>{prod.name}.</h4>
              <p>{prod.slogan}</p>
              <p className="precio-catalogo">${prod.precio}</p>
              <button className="btn-detalle">Ver Detalle</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Menu;