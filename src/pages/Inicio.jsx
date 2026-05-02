import React from 'react';

const Inicio = ({ searchTerm, setSearchTerm, productosFiltrados, verDetalle }) => {
  return (
    <section className="page-hero">
      <div className="hero-text-container fade-in-up">
        <h1 className="hola-title">hola,</h1>
        <h2 className="antojo-subtitle">somos dolce duck.</h2>
        
        <div className="buscador-contenedor">
          <div className="buscador">
            <input 
              type="text" 
              placeholder="¿Qué antojo tenés hoy?" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button>Buscar</button>
          </div>
          
          {searchTerm && (
            <div className="resultados-busqueda slide-down">
              {productosFiltrados.length > 0 ? (
                productosFiltrados.map(prod => (
                  <div key={prod.id} className="resultado-item" onClick={() => verDetalle(prod)}>
                    <img src={prod.img} alt={prod.name} />
                    <div className="resultado-info">
                      <h4>{prod.name}</h4>
                      <p>{prod.slogan}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="sin-resultados">No encontramos ese producto :(</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="hero-image-bg">
        <img src="/images/tortainicio.jpg" alt="Fondo Torta" />
      </div>
    </section>
  );
};

export default Inicio;