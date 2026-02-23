import { FaEye, FaShoppingCart } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

export default function HeaderHome() {
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `px-3 py-1 rounded-lg transition ${isActive
      ? "text-blue-600 bg-blue-100"
      : "text-gray-600 hover:text-blue-600"
    }`;
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
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
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink to="/" className={linkClass}>
            Inicio
          </NavLink>

          <NavLink to="/servicios" className={linkClass}>
            Servicios
          </NavLink>

          <NavLink to="/conocenos" className={linkClass}>
            Conócenos
          </NavLink>

          <NavLink to="/productos" className={linkClass}>
            Productos
          </NavLink>

          <NavLink to="/contacto" className={linkClass}>
            Contacto
          </NavLink>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-6">
          <FaShoppingCart className="text-gray-600 hover:text-blue-600 cursor-pointer transition" />

          <button
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
            onClick={() => navigate("/login")}
          >
            Ingresar
          </button>
        </div>
      </div>
    </header>
  );
}