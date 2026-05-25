import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth/AuthContext";
import {
    FaUserShield, FaUsers, FaCalendarAlt, FaFileMedical,
    FaShoppingBag, FaBoxOpen, FaChartBar, FaBell,
    FaCog, FaSignOutAlt, FaEye, FaFileInvoiceDollar,
    FaClipboardList, FaEnvelopeOpenText, FaBars, FaTimes,
    FaShoppingCart
} from "react-icons/fa";

import NotificacionBell from "../components/layout/NotificacionBell";

// Admin / Employee Pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import InventarioPage from "../pages/admin/InventarioPage";
import AdminCitasPage from "../pages/admin/AdminCitasPage";
import HistorialClinicoPage from "../pages/admin/HistorialClinicoPage";
import SoportesPagoPage from "../pages/admin/SoportesPagoPage";
import UsuariosPage from "../pages/admin/UsuariosPage";
import EncuestasPage from "../pages/admin/EncuestasPage";
import MensajesContactoPage from "../pages/admin/MensajesContactoPage";
import ReportesPage from "../pages/admin/ReportesPage";
import ConfiguracionPage from "../pages/admin/ConfiguracionPage";
import NotificacionesPage from "../pages/admin/NotificacionesPage";

// Client Pages
import Carrito from "../pages/cliente/Carrito";
import HistoriaClinicaPage from "../pages/cliente/HistoriaClinicaPage";
import PedidosPage from "../pages/cliente/PedidosPage";
import ClienteConfiguracionPage from "../pages/cliente/ClienteConfiguracionPage.jsx";
import MisNotificacionesPage from "../pages/cliente/MisNotificacionesPage.jsx";

const MENU_ADMIN = [
    { label: "Dashboard", icon: FaUserShield, view: "dashboard" },
    { label: "Usuarios", icon: FaUsers, view: "usuarios" },
    { label: "Citas", icon: FaCalendarAlt, view: "citas" },
    { label: "Historial Clínico", icon: FaFileMedical, view: "historial" },
    { label: "Soportes de Pago", icon: FaFileInvoiceDollar, view: "soportes-pago" },
    { label: "Inventario", icon: FaBoxOpen, view: "inventario" },
    { label: "Reportes", icon: FaChartBar, view: "reportes" },
    { label: "Mensajes", icon: FaEnvelopeOpenText, view: "mensajes" },
    { label: "Notificaciones", icon: FaBell, view: "notificaciones" },
    { label: "Encuestas", icon: FaClipboardList, view: "encuestas" },
    { label: "Configuración", icon: FaCog, view: "configuracion" },
];

const MENU_CLIENTE = [
    { label: "Mis Pedidos", icon: FaShoppingBag, view: "pedidos" },
    { label: "Carrito", icon: FaShoppingCart, view: "carrito" },
    { label: "Historia Clínica", icon: FaFileMedical, view: "historia" },
    { label: "Mis Notificaciones", icon: FaBell, view: "notificaciones" },
    { label: "Configuración", icon: FaCog, view: "configuracion" },
];

function SidebarContent({
    rol,
    activeView,
    setActiveView,
    menuFiltrado,
    initials,
    nombre,
    correo,
    handleLogout,
    navigate,
    onNavClick
}) {
    return (
        <>
            {/* Header del Sidebar (Logo) */}
            <div className="h-20 flex items-center px-6 border-b border-slate-100 cursor-pointer" onClick={() => { navigate("/"); onNavClick?.(); }}>
                <div className="bg-blue-600 p-2 rounded-full mr-3">
                    <FaEye className="text-white text-sm" />
                </div>
                <div>
                    <h1 className="font-bold text-blue-700 text-lg leading-none">OptiLuxe</h1>
                    <span className="text-[10px] text-slate-500 font-medium">
                        {rol === "CLIENTE" ? "Mi Cuenta" : "Panel de Control"}
                    </span>
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                {menuFiltrado.map((item) => {
                    const isActive = activeView === item.view;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.view}
                            onClick={() => {
                                setActiveView(item.view);
                                onNavClick?.();
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${isActive
                                ? "bg-blue-800 text-white shadow-md text-left"
                                : "text-slate-600 hover:bg-slate-50 hover:text-blue-700 text-left"
                            }`}
                        >
                            <Icon className="text-lg shrink-0" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* User Card Inferior */}
            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shrink-0">
                        {initials}
                    </div>
                    <div className="overflow-hidden text-left">
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
}

export default function AdminLayout() {
    const { usuario, rol, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarAbierto, setSidebarAbierto] = useState(false);

    const [activeView, setActiveView] = useState(() => {
        if (location.state?.view) {
            return location.state.view;
        }
        return rol === "CLIENTE" ? "pedidos" : "dashboard";
    });

    useEffect(() => {
        if (location.state?.view && location.state.view !== activeView) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveView(location.state.view);
        }
    }, [location.state, activeView]);

    const menuBase = rol === "CLIENTE" ? MENU_CLIENTE : MENU_ADMIN;
    const menuFiltrado = menuBase.filter(item => {
        if (rol === "EMPLEADO" && item.view === "reportes") return false;
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

    const renderContent = () => {
        if (rol === "CLIENTE") {
            switch (activeView) {
                case "pedidos":
                    return <PedidosPage isView={true} />;
                case "carrito":
                    return <Carrito isView={true} />;
                case "historia":
                    return <HistoriaClinicaPage isView={true} />;
                case "notificaciones":
                    return <MisNotificacionesPage isView={true} />;
                case "configuracion":
                    return <ClienteConfiguracionPage isView={true} />;
                default:
                    return <PedidosPage isView={true} />;
            }
        } else {
            switch (activeView) {
                case "dashboard":
                    return <AdminDashboardPage />;
                case "usuarios":
                    return <UsuariosPage />;
                case "citas":
                    return <AdminCitasPage />;
                case "historial":
                    return <HistorialClinicoPage />;
                case "soportes-pago":
                    return <SoportesPagoPage />;
                case "inventario":
                    return <InventarioPage />;
                case "reportes":
                    return <ReportesPage />;
                case "mensajes":
                    return <MensajesContactoPage />;
                case "notificaciones":
                    return <NotificacionesPage />;
                case "encuestas":
                    return <EncuestasPage />;
                case "configuracion":
                    return <ConfiguracionPage />;
                default:
                    return <AdminDashboardPage />;
            }
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">

            {/* Sidebar desktop (md+) */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0">
                <SidebarContent
                    rol={rol}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    menuFiltrado={menuFiltrado}
                    initials={initials}
                    nombre={nombre}
                    correo={correo}
                    handleLogout={handleLogout}
                    navigate={navigate}
                />
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
                <SidebarContent
                    rol={rol}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    menuFiltrado={menuFiltrado}
                    initials={initials}
                    nombre={nombre}
                    correo={correo}
                    handleLogout={handleLogout}
                    navigate={navigate}
                    onNavClick={cerrarSidebar}
                />
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
                    {renderContent()}
                </div>
            </main>

        </div>
    );
}
