import "./globals.css";
import { CartProvider } from "../context/CartContext";
import Header from "../components/Header";

export const metadata = {
  title: "Dolce Duck | Pastelería",
  description: "Hecho con amor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}