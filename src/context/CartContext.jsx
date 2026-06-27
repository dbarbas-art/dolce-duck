'use client';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [errorCarrito, setErrorCarrito] = useState('');
  const [user, setUser] = useState(null);

  const fetchCart = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/carrito');
      const data = await res.json();
      setCart((data.items || []).map(item => ({ ...item, cartId: item.id })));
    } catch (err) {
      console.error('Error al cargar el carrito:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  // Sync auth state and cart whenever session changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      fetchCart();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') fetchCart();
      if (event === 'SIGNED_OUT') { setCart([]); setCargando(false); }
    });

    return () => subscription.unsubscribe();
  }, [fetchCart]);

  const agregarAlCarrito = async (producto, opcionesElegidas = null) => {
    setErrorCarrito('');

    const res = await fetch('/api/carrito', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: producto.id,
        name: producto.name,
        precio: producto.precio,
        img: producto.img,
        tipo: producto.tipo,
        opciones: opcionesElegidas,
      }),
    });

    if (res.status === 401) {
      setErrorCarrito('Tenés que iniciar sesión para agregar productos al carrito.');
      return false;
    }

    if (!res.ok) {
      const err = await res.json();
      console.error('Error al agregar al carrito:', err);
      return false;
    }

    const { item } = await res.json();
    setCart(prev => [...prev, { ...item, cartId: item.id }]);
    setShowCartPopup(true);
    setTimeout(() => setShowCartPopup(false), 2000);
    return true;
  };

  const eliminarDelCarrito = async (cartId) => {
    const res = await fetch('/api/carrito', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cartId }),
    });

    if (!res.ok) { console.error('Error al eliminar del carrito'); return false; }
    setCart(prev => prev.filter(item => item.cartId !== cartId));
    return true;
  };

  const totalCarrito = cart.reduce((acc, item) => acc + item.precio, 0);

  return (
    <CartContext.Provider value={{ cart, agregarAlCarrito, eliminarDelCarrito, totalCarrito, showCartPopup, cargando, errorCarrito, user }}>
      {children}
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
