import React, { useState } from 'react';
import './index.css';

const catalogoPasteleria = [
  { id: 1, name: 'Brownie', slogan: 'Una experiencia sensorial.', img: '/images/brownie.jpg', precio: 15000, tipo: 'normal' },
  { id: 2, name: 'Cinnamon Rolls', slogan: 'SE TE DERRITEN EN LA BOCA.', img: '/images/rolls.jpg', precio: 12000, tipo: 'normal' },
  { id: 3, name: 'Budín', slogan: 'NO TE LO PODES PERDER.', img: '/images/budin.jpg', precio: 8500, tipo: 'budin' },
  { id: 4, name: 'Pasta Frola', slogan: 'DE BATATA O DE MEMBRILLO.', img: '/images/pastafrola.jpg', precio: 14000, tipo: 'pastafrola' },
  { id: 5, name: 'Pepas con Dulce', slogan: 'MIRA LO QUE ES ESO.', img: '/images/pepas.jpg', precio: 6500, tipo: 'pepas' },
  { id: 6, name: 'Galletitas', slogan: 'ES UN MUST CON EL MATE.', img: '/images/galletitas.jpg', precio: 5000, tipo: 'galletitas' },
  { id: 7, name: 'Medialunas', slogan: 'INFALTABLE EN LA MESA.', img: '/images/medialunas.jpg', precio: 7000, tipo: 'normal' },
  { id: 8, name: 'Lemon Pie', slogan: 'El equilibrio justo de acidez.', img: '/images/lemonpie.jpeg', precio: 11000, tipo: 'normal' },
  { id: 9, name: 'Cheesecake', slogan: 'Suave y cremoso con frutos rojos.', img: '/images/cheesecake.jpeg', precio: 14500, tipo: 'normal' },
  { id: 10, name: 'Pan Dulce', slogan: 'Esponjoso y lleno de magia.', img: '/images/pandulce.JPG', precio: 8000, tipo: 'normal' },
  { id: 11, name: 'Torta de Ricota', slogan: 'Un clásico que nunca falla.', img: '/images/tortaricota.jpeg', precio: 9500, tipo: 'normal' },
  { id: 12, name: 'Torta Personalizada', slogan: 'Diseñala a tu gusto.', img: '/images/tortacumple.jpg', precio: 35000, tipo: 'torta' },
];

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
              Carrito ({cart.length})
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* --- INICIO --- */}
        {currentPage === 'inicio' && (
          <section className="page-hero">
            <div className="hero-text-container fade-in-up">
              <h1 className="hola-title">hola.</h1>
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
              <img src="/images/tortainicio.jpg" alt="Fondo Torta Dolce Duck" />
            </div>
          </section>
        )}

        {/* --- NOSOTROS --- */}
        {currentPage === 'nosotros' && (
          <section className="page-nosotros fade-in-up">
            <div className="nosotros-top">
              <div className="nosotros-texto">
                <h3 className="titulo-seccion-left">quiénes somos.</h3>
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
        )}

        {/* --- CONTACTO --- */}
        {currentPage === 'contacto' && (
          <section className="page-contacto fade-in-up">
            <div className="contacto-card">
              <img src="/images/LOGO.png" alt="Logo" className="contacto-logo" />
              <h3 className="titulo-seccion">estemos en contacto.</h3>
              <p>¿Tenés alguna duda, querés una mesa dulce para tu evento o simplemente tenés un antojo? ¡Escribinos, nos encanta hablar con vos!</p>
              
              <div className="contacto-links">
                <a href="https://instagram.com/dolce.duck" target="_blank" rel="noreferrer" className="btn-social btn-ig">
                  📸 @dolce.duck
                </a>
                <a href="https://wa.me/5491133901250" target="_blank" rel="noreferrer" className="btn-social btn-wa">
                  💬 +54 9 11 3390-1250
                </a>
              </div>
            </div>
          </section>
        )}

        {/* --- MENÚ --- */}
        {currentPage === 'menu' && (
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
                    <button className="btn-detalle">{prod.tipo !== 'normal' ? 'Agregar' : 'Agregar'}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- DETALLE Y FORMULARIOS DINÁMICOS --- */}
        {currentPage === 'detalle' && selectedProduct && (
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
        )}

        {/* --- CARRITO --- */}
        {currentPage === 'carrito' && (
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
        )}

        {/* --- POPUP DE CARRITO (TRANSPARENTE CON PATITO Y CORAZONES) --- */}
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