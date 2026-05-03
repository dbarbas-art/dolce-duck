"use client";
import { useState } from 'react';
import Link from 'next/link';
import { catalogoPasteleria } from '../data/productos';

export default function Inicio() {
  const [searchTerm, setSearchTerm] = useState('');
  const productosFiltrados = searchTerm 
    ? catalogoPasteleria.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <section className="page-hero">
      <div className="hero-text-container fade-in-up">
        <h1 className="hola-title">hola,</h1>
        <h2 className="antojo-subtitle">somos dolce duck.</h2>
        
        <div className="buscador-contenedor">
          {/* Aquí agregamos el contenedor .buscador y el botón para recuperar el diseño */}
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
            <div className="resultados-busqueda">
              {productosFiltrados.map(prod => (
                <Link key={prod.id} href={`/detalle/${prod.id}`}>
                  <div className="resultado-item">
                    <img src={prod.img} alt={prod.name} />
                    <div>
                      <h4>{prod.name}</h4>
                      <p>${prod.precio}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
      
      <div className="hero-image-bg">
        <img src="/images/tortainicio.jpg" alt="Fondo" />
      </div>
    </section>
  );
}