import { useState } from "react";
import "./App.css";

const productsMock = [
  { id: 1, name: "Duck Mug", price: 12, image: "https://via.placeholder.com/300" },
  { id: 2, name: "Duck Hoodie", price: 35, image: "https://via.placeholder.com/300" },
  { id: 3, name: "Duck Stickers", price: 8, image: "https://via.placeholder.com/300" },
];

export default function App() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const filteredProducts = productsMock.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      
      {/* NAVBAR */}
      <header className="navbar">
        <h1 className="logo">dolce duck.</h1>

        <input
          className="search"
          type="text"
          placeholder="Buscar..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="cart">🛒 {cart.length}</div>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>hola.</h1>
        <p>
          Inauguramos una nueva <strong>sección</strong> en historias
        </p>
        <span>#DolceTips</span>
      </section>

      {/* PRODUCTOS */}
      <section className="products">
        {filteredProducts.map((p) => (
          <div className="card" key={p.id}>
            <img src={p.image} alt={p.name} />
            <h3>{p.name}</h3>
            <p>${p.price}</p>
            <button onClick={() => addToCart(p)}>Agregar</button>
          </div>
        ))}
      </section>

      {/* ABOUT */}
      <section className="about">
        <h2>Sobre nosotros</h2>
        <p>
          Dolce Duck es una marca que mezcla diseño, ternura y productos únicos.
        </p>
      </section>
    </div>
  );
}