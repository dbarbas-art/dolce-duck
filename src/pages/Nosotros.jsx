import React from 'react';

const Nosotros = () => {
  return (
    <section className="page-nosotros fade-in-up">
      <div className="nosotros-top">
        <div className="nosotros-texto">
          <h3 className="titulo-seccion-left">¿quiénes somos?</h3>
          <p>En Dolce Duck buscamos unir a la gente con nuestra comida. Sabemos que los mejores momentos se comparten alrededor de una mesa dulce.</p>
          <p>Nuestra pastelera, <strong>Sofía Barbás</strong>, tiene un gran sueño: compartir sus creaciones con todas las personas, llevando dulzura, amor y un toque de magia a cada rincón.</p>
        </div>
        <div className="nosotros-foto-sofi">
          <img src="/images/sofi.JPG" alt="Sofía Barbás" />
          <div className="sofi-decor"> Hecho con amor </div>
        </div>
      </div>
      
      <div className="nosotros-galeria">
        <img src="/images/historia.jpg" alt="Historia Dolce Duck" />
        <img src="/images/recuerdos1.jpg" alt="Recuerdo 1" />
        <img src="/images/recuerdos2.jpg" alt="Recuerdo 2" />
        <img src="/images/tortainicio.jpg" alt="Torta inicio" />
        <img src="/images/tortasol.jpg" alt="Torta sol" />
        <img src="/images/recuerdos3.jpg" alt="Recuerdo 3" />
      </div>
    </section>
  );
};

export default Nosotros;