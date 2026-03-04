import { FaBell, FaCalendarAlt, FaUsers, FaShoppingBag, FaChartLine, FaCalendarPlus, FaUserPlus, FaFileInvoiceDollar, FaFileMedical, FaChartBar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth/AuthContext";
import { useEffect, useState } from "react";
import * as citaService from "../../services/citaService";
import * as usuarioService from "../../services/usuarioService";
import * as facturaService from "../../services/facturaService";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
    const { usuario } = useAuth();
    const nombre = usuario?.usuNombre ?? usuario?.nombre ?? "Admin";

    const [stats, setStats] = useState({
        citasPendientes: 0,
        pacientesActivos: 0,
        ventasMes: 0,
        crecimiento: 0,
        proximasCitas: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchAllData = async () => {
            try {
                setLoading(true);
                // Realizamos las peticiones en paralelo a los servicios independientes
                const [citasPendientes, pacientesActivos, ventasMes, proximasCitas] = await Promise.all([
                    citaService.getEstadisticasCitas(),
                    usuarioService.getEstadisticasPacientes(),
                    facturaService.getEstadisticasVentas(),
                    citaService.getProximasCitas()
                ]);

                if (mounted) {
                    setStats({
                        citasPendientes: citasPendientes.pendientes,
                        pacientesActivos: pacientesActivos.activos,
                        ventasMes: ventasMes.total,
                        crecimiento: 15, // Mantener placeholder de crecimiento por ahora
                        proximasCitas: proximasCitas
                    });
                }
            } catch (error) {
                if (mounted) {
                    toast.error("Error al cargar datos del dashboard");
                    console.error(error);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchAllData();
        return () => { mounted = false; };
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">

            {/* Header Interactivo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Bienvenido de nuevo, {nombre}</p>
                </div>
                <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition cursor-pointer self-start sm:self-auto">
                    <FaBell className="text-slate-400" />
                    Notificaciones
                </button>
            </div>

            {/* Grid de KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-4">
                        <FaCalendarAlt />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Citas Pendientes</p>
                    <p className="text-3xl font-extrabold text-slate-900">
                        {loading ? "..." : stats.citasPendientes}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mb-4">
                        <FaUsers />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Pacientes Activos</p>
                    <p className="text-3xl font-extrabold text-slate-900">
                        {loading ? "..." : stats.pacientesActivos}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xl mb-4">
                        <FaShoppingBag />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Ventas del Mes</p>
                    <p className="text-3xl font-extrabold text-slate-900">
                        {loading ? "..." : `$${(stats.ventasMes).toLocaleString()}`}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-4">
                        <FaChartLine />
                    </div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Crecimiento</p>
                    <p className="text-3xl font-extrabold text-slate-900">
                        {loading ? "..." : `+${stats.crecimiento}%`}
                    </p>
                </div>
            </div>

            {/* Layout Principal Central */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                {/* Próximas Citas */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8 flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Próximas Citas</h2>
                        <p className="text-sm text-slate-500 mt-1">Citas programadas para hoy</p>
                    </div>
                    <div className="space-y-4 flex-1">
                        {loading ? (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-slate-100 rounded-xl w-full"></div>
                                ))}
                            </div>
                        ) : stats.proximasCitas.length === 0 ? (
                            <div className="text-center py-6 text-slate-500 font-medium bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                No hay citas programadas para pronto.
                            </div>
                        ) : (
                            stats.proximasCitas.map(cita => (
                                <div key={cita.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-slate-50/50 transition bg-white">
                                    <div>
                                        <p className="font-bold text-slate-900">{cita.paciente}</p>
                                        <p className="text-sm text-slate-500">{cita.tipo}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1.5">
                                        <span className="font-bold text-slate-900 text-sm">{cita.hora}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cita.color}`}>
                                            {cita.estado}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <button className="w-full mt-6 py-3 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition cursor-pointer">
                        Ver Todas las Citas
                    </button>
                </div>

                {/* Acciones Rápidas */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Acciones Rápidas</h2>
                        <p className="text-sm text-slate-500 mt-1">Accede a las funciones más utilizadas</p>
                    </div>
                    <div className="space-y-3">
                        <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 transition cursor-pointer group">
                            <FaCalendarPlus className="text-slate-400 group-hover:text-blue-600 transition" />
                            <span className="font-semibold">Agendar Nueva Cita</span>
                        </button>
                        <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 transition cursor-pointer group">
                            <FaUserPlus className="text-slate-400 group-hover:text-blue-600 transition" />
                            <span className="font-semibold">Registrar Nuevo Paciente</span>
                        </button>
                        <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 transition cursor-pointer group">
                            <FaFileInvoiceDollar className="text-slate-400 group-hover:text-blue-600 transition" />
                            <span className="font-semibold">Registrar Venta</span>
                        </button>
                        <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 transition cursor-pointer group">
                            <FaFileMedical className="text-slate-400 group-hover:text-blue-600 transition" />
                            <span className="font-semibold">Crear Historial Clínico</span>
                        </button>
                        <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 transition cursor-pointer group">
                            <FaChartBar className="text-slate-400 group-hover:text-blue-600 transition" />
                            <span className="font-semibold">Ver Reportes</span>
                        </button>
                    </div>
                </div>

            </div>

            {/* Banner Inferior */}
            <div className="bg-blue-600 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md shadow-blue-600/20 text-center sm:text-left">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Sistema OptiLuxe</h2>
                    <p className="text-blue-100 text-sm">Gestión integral para tu centro de optometría. Citas, pacientes, inventario y más en un solo lugar.</p>
                </div>
                <Link to="/" className="shrink-0 bg-white/10 hover:bg-white/20 text-white border border-blue-400/50 backdrop-blur-md px-6 py-3 rounded-xl font-bold text-sm transition text-center min-w-[140px]">
                    Ir al Sitio Web
                </Link>
            </div>

        </div>
    );
}

