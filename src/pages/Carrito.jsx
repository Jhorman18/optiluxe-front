import { useNavigate } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus, FaShoppingBag, FaArrowLeft } from "react-icons/fa";
import HeaderHome from "../components/home/HeaderHome.jsx";
import Footer from "../components/layout/Footer.jsx";
import { useCart } from "../context/cart/CartContext.jsx";
import toast from "react-hot-toast";

export default function Carrito() {
  const { carrito, cargando, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderHome />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Título */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/productos")}
            className="text-gray-500 hover:text-blue-600 transition cursor-pointer"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Tu Carrito</h1>
          {carrito.totalItems > 0 && (
            <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-0.5 rounded-full">
              {carrito.totalItems} {carrito.totalItems === 1 ? "producto" : "productos"}
            </span>
          )}
        </div>

        {carrito.items.length === 0 ? (
          /* Estado vacío */
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <FaShoppingBag className="text-6xl text-gray-200" />
            <p className="text-xl font-semibold text-gray-500">Tu carrito está vacío</p>
            <p className="text-gray-400">Explora nuestros productos y agrega algo que te guste</p>
            <button
              onClick={() => navigate("/productos")}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition cursor-pointer"
            >
              Ver productos
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Tabla de productos */}
            <div className="flex-1 space-y-4">
              {/* Encabezado tabla (solo desktop) */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                <span>Producto</span>
                <span className="text-center">Precio</span>
                <span className="text-center">Cantidad</span>
                <span className="text-center">Subtotal</span>
                <span />
              </div>

              {/* Items */}
              {carrito.items.map((item) => (
                <div
                  key={item.idCarritoProducto}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                >
                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center">
                    {/* Producto */}
                    <div className="flex items-center gap-3">
                      <img
                        src={item.producto.imagen}
                        alt={item.producto.nombre}
                        className="w-16 h-16 object-cover rounded-lg shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.producto.nombre}</p>
                        <p className="text-xs text-gray-500">{item.producto.categoria}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Stock: {item.producto.stock}</p>
                      </div>
                    </div>

                    {/* Precio */}
                    <p className="text-center text-sm font-medium text-gray-700">
                      ${item.producto.precio.toLocaleString()}
                    </p>

                    {/* Cantidad */}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateItem(item.idCarritoProducto, item.cantidad - 1)}
                        disabled={cargando}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.cantidad}</span>
                      <button
                        onClick={() => updateItem(item.idCarritoProducto, item.cantidad + 1)}
                        disabled={cargando || item.cantidad >= item.producto.stock}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <p className="text-center text-sm font-bold text-gray-900">
                      ${item.subtotal.toLocaleString()}
                    </p>

                    {/* Eliminar */}
                    <button
                      onClick={() => removeItem(item.idCarritoProducto)}
                      disabled={cargando}
                      className="text-red-400 hover:text-red-600 transition cursor-pointer disabled:opacity-50"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {/* Mobile layout */}
                  <div className="flex md:hidden gap-3">
                    <img
                      src={item.producto.imagen}
                      alt={item.producto.nombre}
                      className="w-20 h-20 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{item.producto.nombre}</p>
                      <p className="text-xs text-gray-500">{item.producto.categoria}</p>
                      <p className="text-sm font-bold text-blue-700 mt-1">
                        ${item.producto.precio.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateItem(item.idCarritoProducto, item.cantidad - 1)}
                          disabled={cargando}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                        >
                          <FaMinus className="text-xs" />
                        </button>
                        <span className="text-sm font-semibold">{item.cantidad}</span>
                        <button
                          onClick={() => updateItem(item.idCarritoProducto, item.cantidad + 1)}
                          disabled={cargando || item.cantidad >= item.producto.stock}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                        >
                          <FaPlus className="text-xs" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.idCarritoProducto)}
                        disabled={cargando}
                        className="text-red-400 hover:text-red-600 transition cursor-pointer"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                      <p className="text-sm font-bold text-gray-900">${item.subtotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continuar comprando */}
              <button
                onClick={() => navigate("/productos")}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition cursor-pointer mt-2"
              >
                <FaArrowLeft className="text-xs" />
                Continuar comprando
              </button>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:w-80">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h3>
                <div className="space-y-2.5 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({carrito.totalItems} {carrito.totalItems === 1 ? "producto" : "productos"})</span>
                    <span className="font-medium text-gray-900">${carrito.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (19%)</span>
                    <span className="font-medium text-gray-900">${Math.round(carrito.iva).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span className="text-green-600 font-medium">Gratis</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-blue-700 text-lg">${Math.round(carrito.total).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => toast.success("Función de pago próximamente")}
                  className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
                >
                  Proceder al pago
                </button>

                <p className="text-center text-xs text-gray-400 mt-3">
                  Pago 100% seguro y encriptado
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
