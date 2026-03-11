import { useState, useEffect, useMemo, useRef } from "react";
import {
    FaSearch, FaFilter, FaCalendarAlt, FaClock, FaUser,
    FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaUserSlash,
    FaStethoscope, FaStar, FaSort, FaSortUp, FaSortDown,
    FaTimes, FaPhone, FaEnvelope, FaIdCard, FaFileInvoiceDollar,
    FaMoneyBillWave, FaCreditCard, FaExchangeAlt, FaSyncAlt,
    FaEllipsisV, FaCalendarCheck, FaRedo
} from "react-icons/fa";
import * as citaService from "../../services/citaService";
import toast from "react-hot-toast";

// ─── Configuración de estados ────────────────────────────────────────────────

const ESTADOS = [
    { value: "PENDIENTE", label: "Pendiente", Icon: FaHourglassHalf, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
    { value: "CONFIRMADA", label: "Confirmada", Icon: FaCheckCircle, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
    { value: "EN_ATENCION", label: "En Atención", Icon: FaStethoscope, bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
    { value: "COMPLETADA", label: "Completada", Icon: FaStar, bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
    { value: "CANCELADA", label: "Cancelada", Icon: FaTimesCircle, bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
    { value: "NO_ASISTIO", label: "No Asistió", Icon: FaUserSlash, bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300", dot: "bg-slate-500" },
];

const TRANSICIONES = {
    PENDIENTE: ["CONFIRMADA", "EN_ATENCION", "CANCELADA", "NO_ASISTIO"],
    CONFIRMADA: ["EN_ATENCION", "CANCELADA", "NO_ASISTIO"],
    EN_ATENCION: ["COMPLETADA"],
    COMPLETADA: [],
    CANCELADA: [],
    NO_ASISTIO: [],
};

const ESTADOS_REPROGRAMABLES = ["PENDIENTE", "CONFIRMADA", "EN_ATENCION"];

const getEstadoCfg = (estado) =>
    ESTADOS.find(e => e.value === estado?.toUpperCase()) || ESTADOS[0];

// ─── Helpers de formato ──────────────────────────────────────────────────────

const formatFecha = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
};

const formatHora = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
};

const formatDuracion = (min) => `${min} min`;

const detectarMetodoPago = (cita) => {
    // Intentar leer desde la factura vinculada
    const enc = cita.encuesta?.[0];
    if (enc?.factura) {
        const condiciones = enc.factura.facCondiciones || "";
        if (condiciones.includes("EFECTIVO")) return { metodo: "Efectivo", virtual: false };
        return { metodo: condiciones.replace("Método: ", ""), virtual: true };
    }
    return null;
};

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function EstadoBadge({ estado }) {
    const cfg = getEstadoCfg(estado);
    const IconComp = cfg.Icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text} ${cfg.border} border`}>
            <IconComp className="text-[9px]" />
            {cfg.label}
        </span>
    );
}

function PagoBadge({ cita }) {
    const pago = detectarMetodoPago(cita);
    if (!pago) return <span className="text-xs text-slate-400">—</span>;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${pago.virtual
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-orange-50 text-orange-700 border border-orange-200"
            }`}>
            {pago.virtual ? <FaCreditCard className="text-[9px]" /> : <FaMoneyBillWave className="text-[9px]" />}
            {pago.metodo}
        </span>
    );
}

function KpiCard({ icon: Icon, label, value, color, loading }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg mb-3 ${color}`}>
                <Icon />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">{label}</p>
            <p className="text-2xl font-extrabold text-slate-900">
                {loading ? <span className="inline-block w-8 h-6 bg-slate-100 rounded animate-pulse" /> : value}
            </p>
        </div>
    );
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            <td className="px-5 py-4"><div className="h-8 w-32 bg-slate-100 rounded" /></td>
            <td className="px-5 py-4"><div className="h-5 w-20 bg-slate-100 rounded" /></td>
            <td className="px-5 py-4"><div className="h-5 w-20 bg-slate-100 rounded" /></td>
            <td className="px-5 py-4"><div className="h-5 w-14 bg-slate-100 rounded" /></td>
            <td className="px-5 py-4"><div className="h-5 w-12 bg-slate-100 rounded" /></td>
            <td className="px-5 py-4"><div className="h-5 w-28 bg-slate-100 rounded" /></td>
            <td className="px-5 py-4"><div className="h-5 w-16 bg-slate-100 rounded" /></td>
            <td className="px-5 py-4"><div className="h-5 w-20 bg-slate-100 rounded" /></td>
            <td className="px-5 py-4"><div className="h-5 w-6 bg-slate-100 rounded float-right" /></td>
        </tr>
    );
}

// ─── Dropdown de acciones (tres puntitos) ────────────────────────────────────

function AccionesDropdown({ cita, onCambiarEstado, onReprogramar, isUpdating }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const estadoUpper = cita.citEstado?.toUpperCase();
    const transiciones = (TRANSICIONES[estadoUpper] || []).map(v => getEstadoCfg(v));
    const puedeReprogramar = ESTADOS_REPROGRAMABLES.includes(estadoUpper);
    const tieneOpciones = transiciones.length > 0 || puedeReprogramar;

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    if (!tieneOpciones) {
        return <span className="text-[10px] text-slate-400 font-medium">Final</span>;
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer active:scale-95"
                title="Acciones"
            >
                <FaEllipsisV className="pointer-events-none" />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-150">

                    {/* Transiciones de estado */}
                    {transiciones.length > 0 && (
                        <>
                            <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cambiar estado</p>
                            {transiciones.map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => { onCambiarEstado(cita.idCita, t.value); setOpen(false); }}
                                    disabled={isUpdating}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-40 text-left"
                                >
                                    <t.Icon className={`text-xs ${t.text}`} />
                                    {t.label}
                                </button>
                            ))}
                        </>
                    )}

                    {/* Separador */}
                    {transiciones.length > 0 && puedeReprogramar && (
                        <div className="border-t border-slate-100 my-1" />
                    )}

                    {/* Reprogramar */}
                    {puedeReprogramar && (
                        <button
                            onClick={() => { onReprogramar(cita); setOpen(false); }}
                            disabled={isUpdating}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition disabled:opacity-40 text-left"
                        >
                            <FaRedo className="text-xs text-blue-500" />
                            Reprogramar
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Componente Principal ────────────────────────────────────────────────────

export default function AdminCitasPage() {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEstado, setSelectedEstado] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "citFecha", direction: "desc" });
    const [selectedCita, setSelectedCita] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Reprogramar
    const [reprogramarCita, setReprogramarCita] = useState(null);
    const [nuevaFecha, setNuevaFecha] = useState("");
    const [nuevaHora, setNuevaHora] = useState("");
    const [reprogramando, setReprogramando] = useState(false);

    // ─── Fetch data ──────────────────────────────────────────────────────

    const fetchCitas = async () => {
        try {
            setLoading(true);
            const data = await citaService.getAllCitasAdmin({
                estado: selectedEstado,
                fechaDesde,
                fechaHasta,
                busqueda: searchTerm,
            });
            setCitas(data);
        } catch (error) {
            toast.error("Error al cargar las citas");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        const delay = setTimeout(() => fetchCitas(), 400);
        return () => clearTimeout(delay);
    }, [searchTerm, selectedEstado, fechaDesde, fechaHasta]);

    // ─── KPIs ────────────────────────────────────────────────────────────

    const kpis = useMemo(() => {
        const hoyStr = new Date().toISOString().substring(0, 10);
        const citasHoy = citas.filter(c => c.citFecha?.substring(0, 10) === hoyStr);
        return {
            hoy: citasHoy.length,
            pendientes: citas.filter(c => c.citEstado?.toUpperCase() === "PENDIENTE").length,
            confirmadas: citas.filter(c => c.citEstado?.toUpperCase() === "CONFIRMADA").length,
            completadasHoy: citasHoy.filter(c => c.citEstado?.toUpperCase() === "COMPLETADA").length,
        };
    }, [citas]);

    // ─── Sorting ─────────────────────────────────────────────────────────

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
        setSortConfig({ key, direction });
    };

    const sortedCitas = useMemo(() => {
        const items = [...citas];
        if (!sortConfig.key) return items;
        items.sort((a, b) => {
            let aVal, bVal;
            if (sortConfig.key === "paciente") {
                aVal = `${a.usuario?.usuNombre} ${a.usuario?.usuApellido}`.toLowerCase();
                bVal = `${b.usuario?.usuNombre} ${b.usuario?.usuApellido}`.toLowerCase();
            } else {
                aVal = a[sortConfig.key];
                bVal = b[sortConfig.key];
            }
            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
        return items;
    }, [citas, sortConfig]);

    // ─── Paginación ──────────────────────────────────────────────────────

    const totalPages = Math.ceil(sortedCitas.length / ITEMS_PER_PAGE);
    const paginatedCitas = sortedCitas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    // ─── Cambiar estado ──────────────────────────────────────────────────

    const handleCambiarEstado = async (idCita, nuevoEstado) => {
        try {
            setUpdatingId(idCita);
            await citaService.actualizarEstadoCita(idCita, nuevoEstado);
            toast.success(`Estado actualizado a ${getEstadoCfg(nuevoEstado).label}`);
            fetchCitas();
            if (selectedCita?.idCita === idCita) {
                setSelectedCita(prev => ({ ...prev, citEstado: nuevoEstado }));
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Error al actualizar estado";
            toast.error(msg);
        } finally {
            setUpdatingId(null);
        }
    };

    // ─── Reprogramar ─────────────────────────────────────────────────────

    const abrirReprogramar = (cita) => {
        const d = new Date(cita.citFecha);
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        const h = String(d.getUTCHours()).padStart(2, "0");
        const min = String(d.getUTCMinutes()).padStart(2, "0");
        setReprogramarCita(cita);
        setNuevaFecha(`${y}-${m}-${day}`);
        setNuevaHora(`${h}:${min}`);
    };

    const handleReprogramar = async () => {
        if (!nuevaFecha || !nuevaHora) {
            toast.error("Selecciona la nueva fecha y hora.");
            return;
        }
        try {
            setReprogramando(true);
            const fechaISO = `${nuevaFecha}T${nuevaHora}:00.000Z`;
            await citaService.reprogramarCita(reprogramarCita.idCita, fechaISO);
            toast.success("Cita reprogramada correctamente");
            setReprogramarCita(null);
            fetchCitas();
        } catch (error) {
            const msg = error.response?.data?.message || "Error al reprogramar la cita";
            toast.error(msg);
        } finally {
            setReprogramando(false);
        }
    };

    // ─── Sort icon ───────────────────────────────────────────────────────

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <FaSort className="text-slate-300 ml-1" />;
        return sortConfig.direction === "asc"
            ? <FaSortUp className="text-blue-600 ml-1" />
            : <FaSortDown className="text-blue-600 ml-1" />;
    };

    // ─── Transiciones para el modal de detalle ───────────────────────────

    const getTransiciones = (estado) => {
        const key = estado?.toUpperCase();
        return (TRANSICIONES[key] || []).map(v => getEstadoCfg(v));
    };

    // ─── Render ──────────────────────────────────────────────────────────

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Citas</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Visualiza y gestiona todas las citas de la óptica</p>
                </div>
                <button
                    onClick={fetchCitas}
                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition cursor-pointer self-start md:self-auto"
                >
                    <FaSyncAlt className={`text-sm ${loading ? "animate-spin" : ""}`} />
                    Actualizar
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <KpiCard icon={FaCalendarAlt} label="Citas Hoy" value={kpis.hoy} color="bg-blue-100 text-blue-600" loading={loading} />
                <KpiCard icon={FaHourglassHalf} label="Pendientes (Efectivo)" value={kpis.pendientes} color="bg-amber-100 text-amber-600" loading={loading} />
                <KpiCard icon={FaCheckCircle} label="Confirmadas (Virtual)" value={kpis.confirmadas} color="bg-indigo-100 text-indigo-600" loading={loading} />
                <KpiCard icon={FaStar} label="Completadas Hoy" value={kpis.completadasHoy} color="bg-green-100 text-green-600" loading={loading} />
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
                <div className="relative md:col-span-4">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por paciente o documento..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative md:col-span-2">
                    <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none cursor-pointer"
                        value={selectedEstado}
                        onChange={(e) => setSelectedEstado(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(e => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-3">
                    <input
                        type="date"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                    />
                </div>
                <div className="md:col-span-3">
                    <input
                        type="date"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => handleSort("paciente")}>
                                    <div className="flex items-center">Paciente <SortIcon column="paciente" /></div>
                                </th>
                                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Documento</th>
                                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => handleSort("citFecha")}>
                                    <div className="flex items-center">Fecha <SortIcon column="citFecha" /></div>
                                </th>
                                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hora</th>
                                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duración</th>
                                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => handleSort("citMotivo")}>
                                    <div className="flex items-center">Servicio <SortIcon column="citMotivo" /></div>
                                </th>
                                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pago</th>
                                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition select-none" onClick={() => handleSort("citEstado")}>
                                    <div className="flex items-center">Estado <SortIcon column="citEstado" /></div>
                                </th>
                                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)
                            ) : sortedCitas.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-16 text-center">
                                        <FaCalendarAlt className="text-4xl text-slate-200 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium">No se encontraron citas</p>
                                        <p className="text-slate-400 text-sm mt-1">Intenta cambiar los filtros de búsqueda</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedCitas.map(cita => (
                                    <tr
                                        key={cita.idCita}
                                        className="hover:bg-slate-50/70 transition group cursor-pointer"
                                        onClick={() => setSelectedCita(cita)}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {cita.usuario?.usuNombre?.[0]}{cita.usuario?.usuApellido?.[0]}
                                                </div>
                                                <p className="font-bold text-slate-900 text-sm leading-tight">
                                                    {cita.usuario?.usuNombre} {cita.usuario?.usuApellido}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                                                {cita.usuario?.usuDocumento}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-700 font-medium">{formatFecha(cita.citFecha)}</td>
                                        <td className="px-5 py-4 text-sm text-slate-700 font-bold">{formatHora(cita.citFecha)}</td>
                                        <td className="px-5 py-4 text-sm text-slate-500">{formatDuracion(cita.citDuracion)}</td>
                                        <td className="px-5 py-4 text-sm text-slate-700 font-medium max-w-[160px] truncate">{cita.citMotivo}</td>
                                        <td className="px-5 py-4"><PagoBadge cita={cita} /></td>
                                        <td className="px-5 py-4"><EstadoBadge estado={cita.citEstado} /></td>
                                        <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                                            <AccionesDropdown
                                                cita={cita}
                                                onCambiarEstado={handleCambiarEstado}
                                                onReprogramar={abrirReprogramar}
                                                isUpdating={updatingId === cita.idCita}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Paginación */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
                <p>
                    {loading ? "Cargando..." : (
                        sortedCitas.length === 0 ? "Sin resultados" :
                            `Mostrando ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, sortedCitas.length)} de ${sortedCitas.length} cita${sortedCitas.length !== 1 ? "s" : ""}`

                    )}
                </p>
                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Anterior
                        </button>
                        {getPageNumbers().map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-9 h-9 rounded-lg font-bold text-sm transition cursor-pointer ${page === currentPage
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>

            {/* ─── Modal de Detalle ────────────────────────────────────────────── */}
            {
                selectedCita && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedCita(null)}
                    >
                        <div
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Detalle de Cita</h2>
                                    <p className="text-sm text-slate-500 mt-0.5">ID: #{selectedCita.idCita}</p>
                                </div>
                                <button onClick={() => setSelectedCita(null)} className="text-slate-400 hover:text-slate-600 transition">
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="px-8 py-6 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">

                                <div className="flex items-center justify-between">
                                    <EstadoBadge estado={selectedCita.citEstado} />
                                    <PagoBadge cita={selectedCita} />
                                </div>

                                {/* Datos del paciente */}
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                        <FaUser className="text-blue-500" /> Paciente
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">Nombre</p>
                                            <p className="text-sm font-bold text-slate-900">
                                                {selectedCita.usuario?.usuNombre} {selectedCita.usuario?.usuApellido}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><FaIdCard /> Documento</p>
                                            <p className="text-sm font-bold text-slate-900">{selectedCita.usuario?.usuDocumento}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><FaPhone /> Teléfono</p>
                                            <p className="text-sm font-bold text-slate-900">{selectedCita.usuario?.usuTelefono}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><FaEnvelope /> Correo</p>
                                            <p className="text-sm font-bold text-slate-900 truncate">{selectedCita.usuario?.usuCorreo}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Datos de la cita */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
                                        <FaCalendarAlt className="text-blue-500 mx-auto mb-1" />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Fecha</p>
                                        <p className="text-sm font-bold text-slate-800">{formatFecha(selectedCita.citFecha)}</p>
                                    </div>
                                    <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
                                        <FaClock className="text-indigo-500 mx-auto mb-1" />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Hora</p>
                                        <p className="text-sm font-bold text-slate-800">{formatHora(selectedCita.citFecha)}</p>
                                    </div>
                                    <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
                                        <FaHourglassHalf className="text-amber-500 mx-auto mb-1" />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Duración</p>
                                        <p className="text-sm font-bold text-slate-800">{formatDuracion(selectedCita.citDuracion)}</p>
                                    </div>
                                    <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
                                        <FaStethoscope className="text-purple-500 mx-auto mb-1" />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Servicio</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{selectedCita.citMotivo}</p>
                                    </div>
                                </div>

                                {/* Observaciones */}
                                {selectedCita.citObservaciones && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 mb-1">Observaciones</p>
                                        <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-4">
                                            {selectedCita.citObservaciones}
                                        </p>
                                    </div>
                                )}

                                {/* Factura vinculada */}
                                {selectedCita.encuesta?.[0]?.factura && (
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                                        <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
                                            <FaFileInvoiceDollar /> Factura Vinculada
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                            <div>
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase">Número</p>
                                                <p className="font-bold text-emerald-900">{selectedCita.encuesta[0].factura.facNumero}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase">Subtotal</p>
                                                <p className="font-bold text-emerald-900">${parseFloat(selectedCita.encuesta[0].factura.facSubtotal).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase">IVA</p>
                                                <p className="font-bold text-emerald-900">${parseFloat(selectedCita.encuesta[0].factura.facIva).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase">Total</p>
                                                <p className="font-bold text-emerald-900 text-base">${parseFloat(selectedCita.encuesta[0].factura.facTotal).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Historia clínica */}
                                {selectedCita.historia_clinica?.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                                        <h3 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                                            <FaStethoscope /> Historia Clínica
                                        </h3>
                                        {selectedCita.historia_clinica.map((hc, idx) => (
                                            <div key={idx} className="text-sm space-y-1">
                                                <p><span className="font-bold text-blue-800">Diagnóstico:</span> {hc.hisDiagnostico}</p>
                                                <p><span className="font-bold text-blue-800">Fórmula Óptica:</span> {hc.hisFormulaOptica}</p>
                                                {hc.hisObservaciones && (
                                                    <p><span className="font-bold text-blue-800">Observaciones:</span> {hc.hisObservaciones}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer — Acciones de estado */}
                            {(() => {
                                const trans = getTransiciones(selectedCita.citEstado);
                                const puedeReprogramar = ESTADOS_REPROGRAMABLES.includes(selectedCita.citEstado?.toUpperCase());
                                if (trans.length === 0 && !puedeReprogramar) return null;
                                return (
                                    <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50">
                                        <p className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5">
                                            <FaExchangeAlt /> Acciones
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {trans.map(t => (
                                                <button
                                                    key={t.value}
                                                    onClick={() => handleCambiarEstado(selectedCita.idCita, t.value)}
                                                    disabled={updatingId === selectedCita.idCita}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition border ${t.bg} ${t.text} ${t.border} hover:opacity-80 disabled:opacity-40`}
                                                >
                                                    <t.Icon className="text-xs" />
                                                    {t.label}
                                                </button>
                                            ))}
                                            {puedeReprogramar && (
                                                <button
                                                    onClick={() => { abrirReprogramar(selectedCita); setSelectedCita(null); }}
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition border bg-blue-50 text-blue-700 border-blue-200 hover:opacity-80"
                                                >
                                                    <FaRedo className="text-xs" />
                                                    Reprogramar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )
            }

            {/* ─── Modal de Reprogramar ─────────────────────────────────────────── */}
            {
                reprogramarCita && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setReprogramarCita(null)}
                    >
                        <div
                            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <FaCalendarCheck className="text-blue-500" /> Reprogramar Cita
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {reprogramarCita.usuario?.usuNombre} {reprogramarCita.usuario?.usuApellido} — {reprogramarCita.citMotivo}
                                    </p>
                                </div>
                                <button onClick={() => setReprogramarCita(null)} className="text-slate-400 hover:text-slate-600 transition">
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>

                            <div className="px-8 py-6 space-y-5">
                                {/* Fecha y hora actual */}
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Fecha/Hora Actual</p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {formatFecha(reprogramarCita.citFecha)} a las {formatHora(reprogramarCita.citFecha)}
                                    </p>
                                </div>

                                {/* Nueva fecha */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">
                                        Nueva Fecha <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={nuevaFecha}
                                        onChange={e => setNuevaFecha(e.target.value)}
                                    />
                                </div>

                                {/* Nueva hora */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">
                                        Nueva Hora <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={nuevaHora}
                                        onChange={e => setNuevaHora(e.target.value)}
                                        min="08:00"
                                        max="16:30"
                                    />
                                    <p className="text-xs text-slate-400 ml-1">Horario: 8:00am - 5:00pm</p>
                                </div>
                            </div>

                            <div className="px-8 py-5 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => setReprogramarCita(null)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleReprogramar}
                                    disabled={reprogramando}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                >
                                    {reprogramando ? "Reprogramando..." : "Confirmar Fecha"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div >
    );
}
