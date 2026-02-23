import { FaStar, FaShoppingCart } from "react-icons/fa";

export default function ProductCard({ product }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      {/* Imagen */}
      <img
        src={product.imagen}
        alt={product.nombre}
        className="w-full h-40 object-cover rounded-lg"
      />

      {/* Categoría */}
      <span className="text-xs text-blue-600 mt-3 block">
        {product.categoria}
      </span>

      {/* Nombre */}
      <h3 className="font-semibold text-slate-900 text-sm">
        {product.nombre}
      </h3>

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
      <button className="cursor-pointer mt-3 w-full bg-blue-700 hover:bg-blue-800 text-white text-sm py-2 rounded-lg flex items-center justify-center gap-2">
        <FaShoppingCart />
        Agregar al Carrito
      </button>
    </div>
  );
}