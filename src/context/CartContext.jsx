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

  const fetchCart = useCallback(async (userId = null) => {
    setCargando(true);
    try {
      const res = await fetch('/api/carrito');
      const data = await res.json();
      const items = (data.items || []).map(item => ({ ...item, cartId: item.id }));
      setCart(items);
      if (userId) {
        try {
          localStorage.setItem(`dd_cart_${userId}`, JSON.stringify(items));
          localStorage.setItem('dd_last_user', userId);
        } catch {}
      }
    } catch (err) {
      console.error('Error al cargar el carrito:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    // Hydrate immediately from localStorage before async session resolves
    try {
      const cachedUserId = localStorage.getItem('dd_last_user');
      if (cachedUserId) {
        const cached = localStorage.getItem(`dd_cart_${cachedUserId}`);
        if (cached) {
          setCart(JSON.parse(cached));
          setCargando(false);
        }
      }
    } catch {}

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      fetchCart(u?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (event === 'SIGNED_IN') fetchCart(u?.id ?? null);
      if (event === 'SIGNED_OUT') {
        setCart([]);
        setCargando(false);
        try { localStorage.removeItem('dd_last_user'); } catch {}
      }
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
    setCart(prev => {
      const newCart = [...prev, { ...item, cartId: item.id }];
      if (user?.id) {
        try { localStorage.setItem(`dd_cart_${user.id}`, JSON.stringify(newCart)); } catch {}
      }
      return newCart;
    });
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
    setCart(prev => {
      const newCart = prev.filter(item => item.cartId !== cartId);
      if (user?.id) {
        try { localStorage.setItem(`dd_cart_${user.id}`, JSON.stringify(newCart)); } catch {}
      }
      return newCart;
    });
    return true;
  };

  const totalCarrito = cart.reduce((acc, item) => acc + Number(item.precio), 0);

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
