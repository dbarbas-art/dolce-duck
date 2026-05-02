import React from 'react';

const Contacto = () => {
  return (
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
  );
};

export default Contacto;