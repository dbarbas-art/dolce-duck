import React, { useState } from 'react';
import './index.css';

// Importa tus componentes nuevos
import Header from './components/Header';
import Inicio from './pages/Inicio';
import Menu from './pages/Menu';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/Contacto';
import Detalle from './pages/Detalle';
import Carrito from './pages/Carrito';

// Importa tus productos (o dejalos acá si aún no los separaste)
import { catalogoPasteleria } from './data/productos'; 

function App() {
  const [currentPage, setCurrentPage] = useState('inicio');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [opciones, setOpciones] = useState({});

  const navegar = (pagina) => {
    setCurrentPage(pagina);
    setSearchTerm('');
    window.scrollTo(0, 0);
  };

  const verDetalle = (producto) => {
    setSelectedProduct(producto);
    
    // Valores por defecto según el tipo
    if (producto.tipo === 'torta') {
      setOpciones({ sabor: 'Vainilla', relleno: 'Dulce de leche' });
    } else if (producto.tipo === 'budin') {
      setOpciones({ sabor: 'Limón', agregado: 'Con glaseado' });
    } else if (producto.tipo === 'galletitas') {
      setOpciones({ variedad: 'Manteca', glaseado: 'Sin glaseado', descripcionGlaseado: '' });
    } else if (producto.tipo === 'pastafrola') {
      setOpciones({ relleno: 'Membrillo' });
    } else if (producto.tipo === 'pepas') {
      setOpciones({ relleno: 'Dulce de leche' });
    } else {
      setOpciones(null);
    }

    navegar('detalle');
  };

  const agregarAlCarrito = (producto, opcionesElegidas = null) => {
    const nuevoItem = {
      ...producto,
      cartId: Date.now(),
      opciones: opcionesElegidas
    };
    setCart([...cart, nuevoItem]);
    
    setShowCartPopup(true);
    setTimeout(() => setShowCartPopup(false), 2000);
  };

  const eliminarDelCarrito = (id) => {
    setCart(cart.filter(item => item.cartId !== id));
  };

  const productosFiltrados = searchTerm 
    ? catalogoPasteleria.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const renderOpcionesTexto = (opc) => {
    if (!opc) return null;
    return Object.entries(opc)
      .filter(([key, val]) => val !== '')
      .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`)
      .join(' | ');
  };

  const totalCarrito = cart.reduce((acc, item) => acc + item.precio, 0);

  return (
    <>
      <Header navegar={navegar} currentPage={currentPage} cartLength={cart.length} />

      <main>
        {currentPage === 'inicio' && (
          <Inicio 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            productosFiltrados={productosFiltrados} 
            verDetalle={verDetalle} 
          />
        )}

        {currentPage === 'nosotros' && <Nosotros />}
        
        {currentPage === 'contacto' && <Contacto />}

        {currentPage === 'menu' && (
          <Menu verDetalle={verDetalle} />
        )}

        {currentPage === 'detalle' && selectedProduct && (
          <Detalle 
            selectedProduct={selectedProduct}
            navegar={navegar}
            opciones={opciones}
            setOpciones={setOpciones}
            agregarAlCarrito={agregarAlCarrito}
          />
        )}

        {currentPage === 'carrito' && (
          <Carrito 
            cart={cart}
            eliminarDelCarrito={eliminarDelCarrito}
            renderOpcionesTexto={renderOpcionesTexto}
            totalCarrito={totalCarrito}
          />
        )}

        {/* --- POPUP DE CARRITO SE MANTIENE INTACTO --- */}
        {showCartPopup && (
          <div className="cart-popup-overlay">
            <div className="cart-popup-box pop-in">
              <div className="logo-enamorado-container">
                <img src="/images/LOGO.png" alt="Logo Patito" className="patito-enamorado" />
                <span className="heart heart-1">💖</span>
                <span className="heart heart-2">💖</span>
                <span className="heart heart-3">💖</span>
              </div>
              <h3 className="texto-agregado">¡Agregado al carrito!</h3>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default App;