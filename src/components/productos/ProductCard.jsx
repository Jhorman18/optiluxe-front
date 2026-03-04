import { FaStar, FaShoppingCart, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../../context/cart/CartContext.jsx";

export default function ProductCard({ product }) {
  const { addToCart, cargando } = useCart();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col h-full">
      {/* Imagen */}
      <Link to={`/productos/${product.id}`} className="block relative group overflow-hidden rounded-lg">
        <img
          src={product.imagen}
          alt={product.nombre}
          className="w-full h-40 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <span className="bg-white/90 text-slate-800 p-2 rounded-full shadow-lg">
            <FaSearch />
          </span>
        </div>
      </Link>

      {/* Categoría */}
      <span className="text-xs text-blue-600 mt-3 block font-bold tracking-wide">
        {product.categoria}
      </span>

      {/* Nombre */}
      <Link to={`/productos/${product.id}`}>
        <h3 className="font-semibold text-slate-900 text-sm mt-1 hover:text-blue-600 transition-colors line-clamp-2">
          {product.nombre}
        </h3>
      </Link>

      {/* Rating */}
      <div className="flex items-center justify-between mt-1">
        <span className="flex items-center gap-1 text-xs text-amber-500">
          <FaStar /> {product.rating}
        </span>

        <span className="text-xs text-slate-400">
          Stock {product.stock}
        </span>
      </div>

      {/* Precio */}
      <p className="text-lg font-bold text-slate-900 mt-2">
        ${product.precio.toLocaleString()}
      </p>

      {/* Botón */}
      <button
        onClick={() => addToCart(product.id, 1)}
        disabled={cargando || product.stock === 0}
        className="cursor-pointer mt-3 w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-2 rounded-lg flex items-center justify-center gap-2 transition"
      >
        <FaShoppingCart />
        {product.stock === 0 ? "Sin stock" : "Agregar al Carrito"}
      </button>
    </div>
  );
}