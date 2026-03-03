import { FaTimes, FaShoppingBag, FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/cart/CartContext.jsx";

export default function CartPanel() {
  const { carrito, panelOpen, closePanel, updateItem, removeItem, cargando } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closePanel();
    navigate("/carrito");
  };

  return (
    <>
      {/* Overlay */}
      {panelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closePanel}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FaShoppingBag className="text-blue-600 text-lg" />
            <h2 className="font-bold text-gray-900 text-lg">Tu Carrito</h2>
            {carrito.totalItems > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {carrito.totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closePanel}
            className="text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {carrito.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-3">
              <FaShoppingBag className="text-5xl text-gray-200" />
              <p className="font-medium">Tu carrito está vacío</p>
              <p className="text-sm">Agrega productos para continuar</p>
            </div>
          ) : (
            carrito.items.map((item) => (
              <div key={item.idCarritoProducto} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <img
                  src={item.producto.imagen}
                  alt={item.producto.nombre}
                  className="w-16 h-16 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.producto.nombre}</p>
                  <p className="text-xs text-gray-500">{item.producto.categoria}</p>
                  <p className="text-sm font-bold text-blue-700 mt-1">
                    ${item.producto.precio.toLocaleString()}
                  </p>

                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateItem(item.idCarritoProducto, item.cantidad - 1)}
                      disabled={cargando}
                      className="w-6 h-6 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                    >
                      <FaMinus className="text-xs" />
                    </button>
                    <span className="text-sm font-medium w-5 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => updateItem(item.idCarritoProducto, item.cantidad + 1)}
                      disabled={cargando || item.cantidad >= item.producto.stock}
                      className="w-6 h-6 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.idCarritoProducto)}
                    disabled={cargando}
                    className="text-red-400 hover:text-red-600 transition cursor-pointer disabled:opacity-50"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                  <p className="text-sm font-bold text-gray-900">
                    ${item.subtotal.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con totales */}
        {carrito.items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 space-y-3 bg-white">
            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">${carrito.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (19%)</span>
                <span className="font-medium text-gray-900">${Math.round(carrito.iva).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-blue-700">${Math.round(carrito.total).toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
            >
              Continuar al pago
            </button>
          </div>
        )}
      </div>
    </>
  );
}
