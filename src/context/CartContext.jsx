"use client";
import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [showCartPopup, setShowCartPopup] = useState(false);

  const agregarAlCarrito = (producto, opcionesElegidas = null) => {
    const nuevoItem = { ...producto, cartId: Date.now(), opciones: opcionesElegidas };
    setCart([...cart, nuevoItem]);
    setShowCartPopup(true);
    setTimeout(() => setShowCartPopup(false), 2000);
  };

  const eliminarDelCarrito = (id) => {
    setCart(cart.filter(item => item.cartId !== id));
  };

  const totalCarrito = cart.reduce((acc, item) => acc + item.precio, 0);

  return (
    <CartContext.Provider value={{ cart, agregarAlCarrito, eliminarDelCarrito, totalCarrito, showCartPopup }}>
      {children}
      
      {/* POPUP GLOBAL DEL PATITO */}
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
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);