import { FaEye, FaShoppingCart } from "react-icons/fa";
import { Router } from "react-router-dom";

export default function HeaderHome() {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-full">
            <FaEye className="text-white text-sm" />
          </div>
          <div>
            <h1 className="font-bold text-blue-700 text-lg leading-none">
              OptiLuxe
            </h1>
            <span className="text-xs text-gray-500">
              Visión Clara
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">
            Inicio
          </a>
          <a href="#" className="hover:text-blue-600 transition">
            Servicios
          </a>
          <a href="#" className="hover:text-blue-600 transition">
            Conócenos
          </a>
          <a href="#" className="hover:text-blue-600 transition">
            Productos
          </a>
          <a href="#" className="hover:text-blue-600 transition">
            Contacto
          </a>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-6">
          <FaShoppingCart className="text-gray-600 hover:text-blue-600 cursor-pointer transition" />

              <button className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition" onClick={() => window.location.href = "/login"}>
                Ingresar
              </button>
        </div>
      </div>
    </header>
  );
}
