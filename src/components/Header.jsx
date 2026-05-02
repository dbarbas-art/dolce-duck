import React from 'react';

const Header = ({ navegar, currentPage, cartLength }) => {
  return (
    <>
      <div className="marquee">
        <div className="marquee-inner">
          <span>Dolce Duck - Pastelería artesanal</span>
          <span>Pedí tu antojo hoy</span>
          <span>Dolce Duck - Pastelería artesanal</span>
          <span>Pedí tu antojo hoy</span>
        </div>
      </div>

      <header className="header-principal">
        <img 
          src="/images/LOGO.png" 
          className="logo-fuera" 
          alt="Logo Dolce Duck" 
          onClick={() => navegar('inicio')}
        />
        
        <nav className="navbar-flotante">
          <div className="nav-brand" onClick={() => navegar('inicio')}>
            <span>dolce duck</span>
          </div>

          <div className="nav-menu">
            <ul className="nav-links">
              <li><button onClick={() => navegar('menu')} className={currentPage === 'menu' ? 'active' : ''}>Menú</button></li>
              <li><button onClick={() => navegar('nosotros')} className={currentPage === 'nosotros' ? 'active' : ''}>Nosotros</button></li>
              <li><button onClick={() => navegar('contacto')} className={currentPage === 'contacto' ? 'active' : ''}>Contacto</button></li>
            </ul>
            <button className="btn-carrito" onClick={() => navegar('carrito')}>
              Carrito ({cartLength})
            </button>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;