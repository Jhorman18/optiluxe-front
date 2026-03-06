import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth/AuthContext";
import {
    FaUserShield, FaUsers, FaCalendarAlt, FaFileMedical,
    FaShoppingBag, FaBoxOpen, FaChartBar, FaBell,
    FaCog, FaSignOutAlt, FaEye
} from "react-icons/fa";

const MENU_SIDEBAR = [
    { label: "Dashboard", icon: FaUserShield, to: "/panel-admin", end: true },
    { label: "Pacientes", icon: FaUsers, to: "/panel-admin/pacientes" },
    { label: "Citas", icon: FaCalendarAlt, to: "/panel-admin/citas" },
    { label: "Historial Clínico", icon: FaFileMedical, to: "/panel-admin/historial" },
    { label: "Ventas", icon: FaShoppingBag, to: "/panel-admin/ventas" },
    { label: "Inventario", icon: FaBoxOpen, to: "/panel-admin/inventario" },
    { label: "Reportes", icon: FaChartBar, to: "/panel-admin/reportes" },
    { label: "Notificaciones", icon: FaBell, to: "/panel-admin/notificaciones" },
    { label: "Configuración", icon: FaCog, to: "/panel-admin/configuracion" },
];

import NotificacionBell from "../components/layout/NotificacionBell";

export default function AdminLayout() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const nombre = usuario?.usuNombre ?? usuario?.nombre ?? "Admin";
    const correo = usuario?.usuCorreo ?? usuario?.correo ?? "admin@optiluxe.com";
    const initials = (nombre[0] ?? "A").toUpperCase() + (nombre[1] ?? "D").toUpperCase();

    return (
        <div className="flex h-screen bg-slate-50 font-sans">

            {/* Sidebar fijo a la izquierda */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0">

                {/* Header del Sidebar (Logo) */}
                <div className="h-20 flex items-center px-6 border-b border-slate-100 cursor-pointer" onClick={() => navigate("/")}>
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
                    {MENU_SIDEBAR.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
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
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mini Header superior para la campana */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-end px-8 shrink-0">
                    <NotificacionBell />
                </header>

                {/* La sub-ruta (DashboardPage, PacientesPage, etc) se renderiza aquí */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </main>

        </div>
    );
}
