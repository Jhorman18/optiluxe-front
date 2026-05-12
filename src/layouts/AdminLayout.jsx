import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth/AuthContext";
import {
    FaUserShield, FaUsers, FaCalendarAlt, FaFileMedical,
    FaShoppingBag, FaBoxOpen, FaChartBar, FaBell,
    FaCog, FaSignOutAlt, FaEye, FaFileInvoiceDollar,
    FaClipboardList, FaEnvelopeOpenText, FaBars, FaTimes
} from "react-icons/fa";

const MENU_SIDEBAR = [
    { label: "Dashboard", icon: FaUserShield, to: "/panel-admin", end: true },
    { label: "Usuarios", icon: FaUsers, to: "/panel-admin/usuarios" },
    { label: "Citas", icon: FaCalendarAlt, to: "/panel-admin/citas" },
    { label: "Historial Clínico", icon: FaFileMedical, to: "/panel-admin/historial" },
    { label: "Soportes de Pago", icon: FaFileInvoiceDollar, to: "/panel-admin/soportes-pago" },
    { label: "Inventario", icon: FaBoxOpen, to: "/panel-admin/inventario" },
    { label: "Reportes", icon: FaChartBar, to: "/panel-admin/reportes" },
    { label: "Mensajes", icon: FaEnvelopeOpenText, to: "/panel-admin/mensajes" },
    { label: "Notificaciones", icon: FaBell, to: "/panel-admin/notificaciones" },
    { label: "Encuestas", icon: FaClipboardList, to: "/panel-admin/encuestas" },
    { label: "Configuración", icon: FaCog, to: "/panel-admin/configuracion" },
];

import NotificacionBell from "../components/layout/NotificacionBell";

export default function AdminLayout() {
    const { usuario, rol, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarAbierto, setSidebarAbierto] = useState(false);

    const menuFiltrado = MENU_SIDEBAR.filter(item => {
        if (rol === "EMPLEADO" && item.label === "Reportes") return false;
        return true;
    });

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const cerrarSidebar = () => setSidebarAbierto(false);

    const nombre = usuario?.usuNombre ?? usuario?.nombre ?? "Usuario";
    const correo = usuario?.usuCorreo ?? usuario?.correo ?? "usuario@optiluxe.com";
    const initials = (nombre[0] ?? "U").toUpperCase() + (nombre[1] ?? (nombre[0] ? "" : "S")).toUpperCase();

    const SidebarContent = ({ onNavClick }) => (
        <>
            {/* Header del Sidebar (Logo) */}
            <div className="h-20 flex items-center px-6 border-b border-slate-100 cursor-pointer" onClick={() => { navigate("/"); onNavClick?.(); }}>
                <div className="bg-blue-600 p-2 rounded-full mr-3">
                    <FaEye className="text-white text-sm" />
                </div>
                <div>
                    <h1 className="font-bold text-blue-700 text-lg leading-none">OptiLuxe</h1>
                    <span className="text-[10px] text-slate-500 font-medium">Panel de Control</span>
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                {menuFiltrado.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={onNavClick}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${isActive
                                ? "bg-blue-800 text-white shadow-md"
                                : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                            }`
                        }
                    >
                        <item.icon className="text-lg shrink-0" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User Card Inferior */}
            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shrink-0">
                        {initials}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 truncate">{nombre}</p>
                        <p className="text-xs text-slate-500 truncate">{correo}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition cursor-pointer"
                >
                    <FaSignOutAlt />
                    Cerrar Sesión
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-slate-50 font-sans">

            {/* Sidebar desktop (md+) */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0">
                <SidebarContent />
            </aside>

            {/* Overlay móvil */}
            {sidebarAbierto && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
                    onClick={cerrarSidebar}
                />
            )}

            {/* Sidebar móvil (drawer) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-2xl transition-transform duration-300 md:hidden ${
                    sidebarAbierto ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Botón cerrar dentro del drawer */}
                <button
                    onClick={cerrarSidebar}
                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                >
                    <FaTimes className="text-lg" />
                </button>
                <SidebarContent onNavClick={cerrarSidebar} />
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header superior */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 shrink-0">
                    {/* Hamburger — solo visible en móvil */}
                    <button
                        onClick={() => setSidebarAbierto(true)}
                        className="md:hidden p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition"
                        aria-label="Abrir menú"
                    >
                        <FaBars className="text-xl" />
                    </button>

                    {/* Logo visible en móvil cuando sidebar está cerrado */}
                    <div
                        className="md:hidden flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        <div className="bg-blue-600 p-1.5 rounded-full">
                            <FaEye className="text-white text-xs" />
                        </div>
                        <span className="font-bold text-blue-700 text-base">OptiLuxe</span>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <NotificacionBell />
                    </div>
                </header>

                {/* La sub-ruta se renderiza aquí */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </main>

        </div>
    );
}
