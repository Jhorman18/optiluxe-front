import { useEffect, useRef, useState } from "react";
import {
  FaCalendarAlt,
  FaEllipsisV,
  FaEye,
  FaFileMedical,
  FaFileInvoice,
  FaShoppingBag,
  FaShoppingCart,
  FaSignOutAlt,
  FaUserShield,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/AuthContext.jsx";
import { useCart } from "../../context/cart/CartContext.jsx";

const ROL_LABELS = {
  ADMINISTRADOR: "Administrador",
  EMPLEADO: "Empleado",
  CLIENTE: "Cliente",
};

const MENU_BASE = [
  { label: "Mis citas", icon: FaCalendarAlt, to: "/citas" },
  { label: "Historia clínica", icon: FaFileMedical, to: "/historia" },
  { label: "Mis pedidos", icon: FaShoppingBag, to: "/pedidos" },
];

const MENU_STAFF = { label: "Facturas", icon: FaFileInvoice, to: "/facturas" };
const MENU_ADMIN = { label: "Panel de administración", icon: FaUserShield, to: "/panel-admin" };

export default function HeaderHome() {
  const navigate = useNavigate();
  const { isAuthenticated, cargando, usuario, rol, logout } = useAuth();
  const { carrito, openPanel } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Compatibilidad con campo con prefijo "usu" o sin él
  const nombre = usuario?.usuNombre ?? usuario?.nombre ?? "";
  const apellido = usuario?.usuApellido ?? usuario?.apellido ?? "";
  const correo = usuario?.usuCorreo ?? usuario?.correo ?? usuario?.email ?? "";
  const displayName = [nombre, apellido].filter(Boolean).join(" ") || correo;
  const initials = (nombre[0] ?? correo[0] ?? "").toUpperCase() +
    (apellido[0] ?? correo[1] ?? "").toUpperCase();

  const rolLabel = ROL_LABELS[rol] ?? rol;

  const menuItems = [
    ...MENU_BASE,
    ...(rol === "EMPLEADO" || rol === "ADMINISTRADOR" ? [MENU_STAFF] : []),
    ...(rol === "ADMINISTRADOR" ? [MENU_ADMIN] : []),
  ];

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-1 rounded-lg transition ${isActive ? "text-blue-600 bg-blue-100" : "text-gray-600 hover:text-blue-600"
    }`;

  return (
    <header className="w-full bg-white border-b border-gray-200 relative z-50">
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
            <h1 className="font-bold text-blue-700 text-lg leading-none">OptiLuxe</h1>
            <span className="text-xs text-gray-500">Visión Clara</span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink to="/" className={linkClass}>Inicio</NavLink>
          <NavLink to="/servicios" className={linkClass}>Servicios</NavLink>
          <NavLink to="/conocenos" className={linkClass}>Conócenos</NavLink>
          <NavLink to="/productos" className={linkClass}>Productos</NavLink>
          <NavLink to="/contacto" className={linkClass}>Contacto</NavLink>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          <button
            onClick={openPanel}
            className="relative text-gray-600 hover:text-blue-600 cursor-pointer transition"
            aria-label="Abrir carrito"
          >
            <FaShoppingCart className="text-lg" />
            {carrito.totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {carrito.totalItems > 9 ? "9+" : carrito.totalItems}
              </span>
            )}
          </button>

          {cargando ? (
            <div className="flex items-center gap-2 animate-pulse">
              <div className="bg-gray-200 rounded-full w-9 h-9" />
              <div className="hidden md:block space-y-1.5">
                <div className="bg-gray-200 rounded h-3 w-24" />
                <div className="bg-gray-200 rounded h-2.5 w-16" />
              </div>
            </div>
          ) : isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              {/* Trigger */}
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 cursor-pointer focus:outline-none"
              >
                {/* Avatar con iniciales */}
                <div className="bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center font-semibold text-sm select-none shrink-0">
                  {initials}
                </div>

                {/* Nombre y rol */}
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-sm font-medium text-gray-800">{displayName}</p>
                  <p className="text-xs text-gray-500">{rolLabel}</p>
                </div>

                {/* Tres puntos */}
                <FaEllipsisV className="text-gray-400 hover:text-blue-600 transition text-sm ml-1" />
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50">
                  {/* Cabecera del menú */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 rounded-t-xl">
                    <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                    <p className="text-xs text-blue-600 mt-0.5">{rolLabel}</p>
                  </div>

                  {/* Opciones */}
                  <div className="py-1">
                    {menuItems.map(({ label, icon: Icon, to }) => (
                      <button
                        key={to}
                        onClick={() => { setMenuOpen(false); navigate(to); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                      >
                        <Icon className="text-gray-400 shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Cerrar sesión */}
                  <div className="border-t border-gray-100 py-1 rounded-b-xl overflow-hidden">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <FaSignOutAlt className="shrink-0" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
            >
              Ingresar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
