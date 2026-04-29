import { useState, useEffect, useMemo, useRef } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
    FaSearch, FaFilter, FaCalendarAlt, FaClock, FaUser,
    FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaUserSlash,
    FaStethoscope, FaStar, FaTimes, FaPhone, FaEnvelope, FaIdCard,
    FaFileInvoiceDollar, FaMoneyBillWave, FaCreditCard, FaExchangeAlt,
    FaSyncAlt, FaEllipsisV, FaCalendarCheck, FaRedo, FaPlus, FaSpinner, FaBan
} from "react-icons/fa";
import * as citaService from "../../services/citaService";
import { getUsuarios } from "../../services/usuarioService";
import { services as SERVICIOS } from "../../config/servicesData";
import toast from "react-hot-toast";
import DataTable from "../ui/DataTable";
import StatusBadge from "../ui/StatusBadge";
import EncuestaModal from "../encuesta/EncuestaModal";
import CustomSelect from "../ui/CustomSelect";

import CrearCitaModal from "./citas/CrearCitaModal";
import CrearHistoriaModal from "./citas/CrearHistoriaModal";
import GestionServiciosModal from "./citas/GestionServiciosModal";

import { useAuth } from "../../context/auth/AuthContext";

// ─── Configuración ────────────────────────────────────────────────────────────

const ESTADOS = [
    { value: "PENDIENTE", label: "Pendiente", Icon: FaHourglassHalf, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", dot: "bg-amber-500" },
    { value: "CONFIRMADA", label: "Confirmada", Icon: FaCheckCircle, bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", dot: "bg-indigo-500" },
    { value: "EN_ATENCION", label: "En Atención", Icon: FaStethoscope, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", dot: "bg-blue-500" },
    { value: "COMPLETADA", label: "Completada", Icon: FaStar, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", dot: "bg-emerald-500" },
    { value: "CANCELADA", label: "Cancelada", Icon: FaTimesCircle, bg: "bg-red-50", text: "text-red-700", border: "border-red-100", dot: "bg-red-500" },
    { value: "NO_ASISTIO", label: "No Asistió", Icon: FaUserSlash, bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-500" },
];

const TRANSICIONES = {
    PENDIENTE: ["CONFIRMADA", "CANCELADA", "NO_ASISTIO"],
    CONFIRMADA: ["EN_ATENCION", "CANCELADA", "NO_ASISTIO"],
    EN_ATENCION: ["COMPLETADA"],
    COMPLETADA: [],
    CANCELADA: [],
    NO_ASISTIO: [],
};

const ESTADOS_REPROGRAMABLES = ["PENDIENTE", "CONFIRMADA", "EN_ATENCION"];

const columnHelper = createColumnHelper();

// ─── Slot helpers ─────────────────────────────────────────────────────────────

const ALL_SLOTS = [];
for (let min = 8 * 60; min <= 16 * 60 + 30; min += 30) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    ALL_SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
}
const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const getSlotsForDuration = (dur) => ALL_SLOTS.filter(s => toMin(s) + dur <= 17 * 60);
const isSlotOccupied = (slot, dur, ranges) => {
    const s = toMin(slot), e = s + dur;
    return ranges.some(({ inicio, fin }) => toMin(inicio) < e && toMin(fin) > s);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getEstadoCfg = (estado) =>
    ESTADOS.find(e => e.value === estado?.toUpperCase()) || ESTADOS[0];

const formatFecha = (iso) =>
    new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

const formatHora = (iso) =>
    new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

const formatDuracion = (min) => `${min} min`;

const detectarMetodoPago = (cita) => {
    // 1. Relación directa (Nuevo flujo)
    let fac = cita.factura?.[0];

    // 2. Relación indirecta (Antiguo flujo vía encuesta)
    if (!fac) {
        fac = cita.encuesta?.[0]?.factura;
    }

    if (fac) {
        const condiciones = fac.facCondiciones || "";
        if (condiciones.includes("EFECTIVO")) return { metodo: "Efectivo", virtual: false };
        if (condiciones.includes("PSE") || condiciones.includes("TARJETA")) return { metodo: "PSE", virtual: true };
        return { metodo: "Procesado", virtual: true };
    }

    // 3. Fallback para citas ya gestionadas (Quemado)
    const estado = (cita.citEstado ?? "").toUpperCase();
    if (["COMPLETADA", "EN_ATENCION", "CONFIRMADA"].includes(estado)) {
        return { metodo: "Procesado", virtual: false, fallback: true };
    }

    return null;
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function EstadoBadge({ estado }) {
    const cfg = getEstadoCfg(estado);
    return <StatusBadge status={cfg.label} />;
}

function PagoBadge({ cita }) {
    const pago = detectarMetodoPago(cita);

    if (!pago) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 shadow-sm">
                <FaHourglassHalf className="text-[11px]" /> Pendiente
            </span>
        );
    }

    const { metodo } = pago;
    return <StatusBadge status={metodo} />;
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

function AccionesDropdown({ cita, onCambiarEstado, onReprogramar, onCompletarCita, isUpdating, esEmpleado }) {
    const [open, setOpen] = useState(false);
    const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
    const btnRef = useRef(null);
    const dropRef = useRef(null);

    const estadoUpper = cita.citEstado?.toUpperCase();
    const allTransiciones = (TRANSICIONES[estadoUpper] || []).map(v => getEstadoCfg(v));

    // Si es empleado, solo permitir transiciones de flujo de atención
    const transiciones = esEmpleado
        ? allTransiciones.filter(t => ["EN_ATENCION", "COMPLETADA"].includes(t.value))
        : allTransiciones;

    const puedeReprogramar = !esEmpleado && ESTADOS_REPROGRAMABLES.includes(estadoUpper);
    const tieneOpciones = transiciones.length > 0 || puedeReprogramar;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                btnRef.current && !btnRef.current.contains(e.target) &&
                dropRef.current && !dropRef.current.contains(e.target)
            ) setOpen(false);
        };
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleToggle = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setDropPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        }
        setOpen(v => !v);
    };

    if (!tieneOpciones) {
        return <span className="text-[10px] text-slate-400 font-medium">Final</span>;
    }

    return (
        <div>
            <button
                ref={btnRef}
                onClick={handleToggle}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer active:scale-95"
                title="Acciones"
            >
                <FaEllipsisV className="pointer-events-none" />
            </button>

            {open && (
                <div
                    ref={dropRef}
                    style={{ top: dropPos.top, right: dropPos.right }}
                    className="fixed w-52 bg-white rounded-xl border border-slate-200 shadow-xl z-9999 py-1 animate-in fade-in zoom-in-95 duration-150"
                >
                    {transiciones.length > 0 && (
                        <>
                            <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cambiar estado</p>
                            {transiciones.map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => {
                                        if (t.value === "COMPLETADA") {
                                            onCompletarCita(cita);
                                        } else {
                                            onCambiarEstado(cita.idCita, t.value);
                                        }
                                        setOpen(false);
                                    }}
                                    disabled={isUpdating}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-40 text-left cursor-pointer"
                                >
                                    <t.Icon className={`text-xs ${t.text}`} />
                                    {t.label}
                                </button>
                            ))}
                        </>
                    )}
                    {transiciones.length > 0 && puedeReprogramar && (
                        <div className="border-t border-slate-100 my-1" />
                    )}
                    {puedeReprogramar && (
                        <button
                            onClick={() => { onReprogramar(cita); setOpen(false); }}
                            disabled={isUpdating}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition disabled:opacity-40 text-left cursor-pointer"
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

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function GestionCitas() {
    const { rol } = useAuth();
    const esEmpleado = rol === "EMPLEADO";

    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEstado, setSelectedEstado] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [selectedCita, setSelectedCita] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const [reprogramarCita, setReprogramarCita] = useState(null);
    const [nuevaFecha, setNuevaFecha] = useState("");
    const [nuevaHora, setNuevaHora] = useState("");
    const [reprogramando, setReprogramando] = useState(false);

    const [citaParaCompletar, setCitaParaCompletar] = useState(null);

    // Modal Registrar Pago
    const [citaPago, setCitaPago] = useState(null);
    const [pagoMonto, setPagoMonto] = useState("");
    const [pagoMetodo, setPagoMetodo] = useState("EFECTIVO");
    const [registrandoPago, setRegistrandoPago] = useState(false);

    // Modal Nueva Cita (admin)
    const [modalNuevaCita, setModalNuevaCita] = useState(false);

    // Modal Gestionar Servicios (admin only)
    const [modalServicios, setModalServicios] = useState(false);

    // Encuesta post-creación
    const [showEncuesta, setShowEncuesta] = useState(false);
    const [ncCitaIdCreada, setNcCitaIdCreada] = useState(null);

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
        } catch {
            toast.error("Error al cargar las citas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchCitas(), 400);
        return () => clearTimeout(delay);
    }, [searchTerm, selectedEstado, fechaDesde, fechaHasta]);

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

    const handleCambiarEstado = async (idCita, nuevoEstado) => {
        if (nuevoEstado === "CONFIRMADA") {
            const cita = citas.find(c => c.idCita === idCita);
            const precio = cita?.serPrecio ?? 0;
            if (precio <= 0) {
                // Servicio gratuito: confirmar directamente sin registrar pago
                try {
                    setUpdatingId(idCita);
                    await citaService.actualizarEstadoCita(idCita, "CONFIRMADA");
                    toast.success("Cita confirmada (servicio sin costo)");
                    fetchCitas();
                    if (selectedCita?.idCita === idCita) setSelectedCita(prev => ({ ...prev, citEstado: "CONFIRMADA" }));
                } catch (error) {
                    toast.error(error.response?.data?.message || "Error al confirmar la cita");
                } finally {
                    setUpdatingId(null);
                }
                return;
            }
            setCitaPago(cita || { idCita });
            setPagoMetodo("EFECTIVO");
            setPagoMonto(String(precio));
            return;
        }
        if (nuevoEstado === "CANCELADA" || nuevoEstado === "NO_ASISTIO") {
            const label = nuevoEstado === "CANCELADA" ? "cancelar" : "marcar como No Asistió";
            const confirmado = window.confirm(`¿Estás seguro de ${label} esta cita? Esta acción no se puede deshacer.`);
            if (!confirmado) return;
        }
        try {
            setUpdatingId(idCita);
            await citaService.actualizarEstadoCita(idCita, nuevoEstado);
            toast.success(`Estado actualizado a ${getEstadoCfg(nuevoEstado).label}`);
            fetchCitas();
            if (selectedCita?.idCita === idCita) {
                setSelectedCita(prev => ({ ...prev, citEstado: nuevoEstado }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al actualizar estado");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRegistrarPago = async () => {
        const monto = parseFloat(pagoMonto);
        if (!pagoMonto || isNaN(monto) || monto <= 0) {
            toast.error("Ingresa un monto válido.");
            return;
        }
        try {
            setRegistrandoPago(true);
            await citaService.registrarPagoCita(citaPago.idCita, { monto, metodoPago: pagoMetodo });
            toast.success("Pago registrado. Cita confirmada.");
            setCitaPago(null);
            fetchCitas();
            if (selectedCita?.idCita === citaPago.idCita) {
                setSelectedCita(prev => ({ ...prev, citEstado: "CONFIRMADA" }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al registrar el pago");
        } finally {
            setRegistrandoPago(false);
        }
    };

    const abrirReprogramar = (cita) => {
        const d = new Date(cita.citFecha);
        setReprogramarCita(cita);
        setNuevaFecha(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`);
        setNuevaHora(`${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`);
    };

    const handleReprogramar = async () => {
        if (!nuevaFecha || !nuevaHora) {
            toast.error("Selecciona la nueva fecha y hora.");
            return;
        }
        try {
            setReprogramando(true);
            await citaService.reprogramarCita(reprogramarCita.idCita, `${nuevaFecha}T${nuevaHora}:00.000Z`);
            toast.success("Cita reprogramada correctamente");
            setReprogramarCita(null);
            fetchCitas();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al reprogramar la cita");
        } finally {
            setReprogramando(false);
        }
    };

    const abrirNuevaCita = () => setModalNuevaCita(true);

    const handleCitaCreada = (idCita) => {
        setNcCitaIdCreada(idCita);
        setShowEncuesta(true);
        fetchCitas();
    };

    const handleAbrirCompletar = (cita) => {
        setCitaParaCompletar(cita);
        setSelectedCita(null);
    };

    const getTransiciones = (estado) =>
        (TRANSICIONES[estado?.toUpperCase()] || []).map(v => getEstadoCfg(v));

    const columns = useMemo(() => [
        columnHelper.accessor(row => `${row.usuario?.usuNombre ?? ""} ${row.usuario?.usuApellido ?? ""}`, {
            id: "paciente",
            header: "Paciente",
            cell: ({ row: { original: cita } }) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {cita.usuario?.usuNombre?.[0]}{cita.usuario?.usuApellido?.[0]}
                    </div>
                    <p className="font-bold text-slate-900 text-sm leading-tight">
                        {cita.usuario?.usuNombre} {cita.usuario?.usuApellido}
                    </p>
                </div>
            ),
            meta: { skeletonClass: "h-8 w-32" },
        }),
        columnHelper.display({
            id: "documento",
            header: "Documento",
            enableSorting: false,
            cell: ({ row: { original: cita } }) => (
                <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                    {cita.usuario?.usuDocumento}
                </span>
            ),
            meta: { skeletonClass: "h-5 w-20" },
        }),
        columnHelper.accessor("citFecha", {
            header: "Fecha",
            cell: ({ getValue }) => (
                <span className="text-sm text-slate-700 font-medium">{formatFecha(getValue())}</span>
            ),
            meta: { skeletonClass: "h-5 w-20" },
        }),
        columnHelper.display({
            id: "_hora",
            header: "Hora",
            cell: ({ row: { original: cita } }) => (
                <span className="text-sm text-slate-700 font-bold">{formatHora(cita.citFecha)}</span>
            ),
            meta: { skeletonClass: "h-5 w-20" },
        }),
        columnHelper.display({
            id: "_duracion",
            header: "Duración",
            cell: ({ row: { original: cita } }) => (
                <span className="text-sm text-slate-500">{formatDuracion(cita.citDuracion)}</span>
            ),
            meta: { skeletonClass: "h-5 w-14" },
        }),
        columnHelper.accessor("citMotivo", {
            header: "Servicio",
            cell: ({ getValue }) => (
                <span className="text-sm text-slate-700 font-medium max-w-40 truncate block">{getValue()}</span>
            ),
            meta: { skeletonClass: "h-5 w-28" },
        }),
        columnHelper.display({
            id: "_pago",
            header: "Pago",
            cell: ({ row: { original: cita } }) => <PagoBadge cita={cita} />,
            meta: { skeletonClass: "h-5 w-16" },
        }),
        columnHelper.accessor("citEstado", {
            header: "Estado",
            cell: ({ getValue }) => <EstadoBadge estado={getValue()} />,
            meta: { skeletonClass: "h-5 w-20" },
        }),
        columnHelper.display({
            id: "_acciones",
            header: "Acciones",
            cell: ({ row: { original: cita } }) => (
                <div className="flex justify-end">
                    <AccionesDropdown
                        cita={cita}
                        onCambiarEstado={handleCambiarEstado}
                        onReprogramar={abrirReprogramar}
                        onCompletarCita={handleAbrirCompletar}
                        isUpdating={updatingId === cita.idCita}
                        esEmpleado={esEmpleado}
                    />
                </div>
            ),
            meta: { headerClassName: "text-right", skeletonClass: "h-5 w-6 float-right", stopPropagation: true },
        }),
    ], [updatingId, handleCambiarEstado, abrirReprogramar, handleAbrirCompletar, esEmpleado]);

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">

            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                            <FaCalendarAlt className="text-white text-xl" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Citas</h1>
                    </div>
                    <div className="flex gap-3 self-start md:self-auto">
                        <button
                            onClick={abrirNuevaCita}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 transition cursor-pointer"
                        >
                            <FaPlus className="text-xs" />
                            Nueva Cita
                        </button>
                        {!esEmpleado && (
                            <button
                                onClick={() => setModalServicios(true)}
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 transition cursor-pointer"
                            >
                                <FaStethoscope className="text-xs" />
                                Gestionar Servicios
                            </button>
                        )}
                        <button
                            onClick={fetchCitas}
                            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition cursor-pointer"
                        >
                            <FaSyncAlt className={`text-sm ${loading ? "animate-spin" : ""}`} />
                            Actualizar
                        </button>
                    </div>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-2">Visualiza y gestiona todas las citas de la óptica desde un solo panel de control.</p>
            </header>

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
                    <CustomSelect
                        value={selectedEstado}
                        onChange={setSelectedEstado}
                        placeholder="Todos los estados"
                        options={[
                            { value: "", label: "Todos los estados" },
                            ...ESTADOS.map(e => ({ value: e.value, label: e.label }))
                        ]}
                    />
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
            <DataTable
                columns={columns}
                data={citas}
                loading={loading}
                cellPadding="px-5 py-4"
                pageSize={10}
                initialSorting={[{ id: "citFecha", desc: true }]}
                onRowClick={setSelectedCita}
                renderEmpty={() => (
                    <tr>
                        <td colSpan="9" className="px-6 py-16 text-center">
                            <FaCalendarAlt className="text-4xl text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No se encontraron citas</p>
                            <p className="text-slate-400 text-sm mt-1">Intenta cambiar los filtros de búsqueda</p>
                        </td>
                    </tr>
                )}
            />

            {/* Modal Detalle */}
            {selectedCita && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => setSelectedCita(null)}
                >
                    <div
                        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Detalle de Cita</h2>
                                <p className="text-sm text-slate-500 mt-0.5">ID: #{selectedCita.idCita}</p>
                            </div>
                            <button onClick={() => setSelectedCita(null)} className="text-slate-400 hover:text-slate-600 transition">
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <div className="px-8 py-6 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between">
                                <EstadoBadge estado={selectedCita.citEstado} />
                                <PagoBadge cita={selectedCita} />
                            </div>

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

                            {selectedCita.citObservaciones && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 mb-1">Observaciones</p>
                                    <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-4">
                                        {selectedCita.citObservaciones}
                                    </p>
                                </div>
                            )}

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
                                                onClick={() => t.value === "COMPLETADA"
                                                    ? handleAbrirCompletar(selectedCita)
                                                    : handleCambiarEstado(selectedCita.idCita, t.value)
                                                }
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
            )}

            <CrearHistoriaModal
                abierto={!!citaParaCompletar}
                citaPreseleccionada={citaParaCompletar}
                onClose={() => setCitaParaCompletar(null)}
                onSuccess={fetchCitas}
            />

            <GestionServiciosModal
                abierto={modalServicios}
                onClose={() => setModalServicios(false)}
            />

            {/* Modal Registrar Pago */}
            {citaPago && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => setCitaPago(null)}
                >
                    <div
                        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <FaMoneyBillWave className="text-emerald-500" /> Registrar Pago
                                </h2>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    El paciente paga antes de ser atendido
                                </p>
                            </div>
                            <button onClick={() => setCitaPago(null)} className="text-slate-400 hover:text-slate-600 transition">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="px-8 py-6 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                    Monto total a cobrar
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="100"
                                        placeholder="0"
                                        value={pagoMonto}
                                        onChange={e => setPagoMonto(e.target.value)}
                                        className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none text-slate-800 font-semibold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                                    Método de pago
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: "EFECTIVO", label: "Efectivo", Icon: FaMoneyBillWave },
                                        { value: "TARJETA", label: "Tarjeta", Icon: FaCreditCard },
                                        { value: "TRANSFERENCIA", label: "Transferencia", Icon: FaExchangeAlt },
                                    ].map(({ value, label, Icon }) => (
                                        <button
                                            key={value}
                                            onClick={() => setPagoMetodo(value)}
                                            className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-semibold transition ${pagoMetodo === value
                                                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                                                }`}
                                        >
                                            <Icon className="text-base" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="px-8 py-5 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setCitaPago(null)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRegistrarPago}
                                disabled={registrandoPago}
                                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {registrandoPago ? <FaSpinner className="animate-spin" /> : <FaMoneyBillWave />}
                                {registrandoPago ? "Registrando..." : "Confirmar Pago"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Reprogramar */}
            {reprogramarCita && (
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
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Fecha/Hora Actual</p>
                                <p className="text-sm font-bold text-slate-800">
                                    {formatFecha(reprogramarCita.citFecha)} a las {formatHora(reprogramarCita.citFecha)}
                                </p>
                            </div>
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
            )}

            <CrearCitaModal
                abierto={modalNuevaCita}
                onClose={() => setModalNuevaCita(false)}
                onSuccess={handleCitaCreada}
            />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
            {/* Modal Nueva Cita logic... */}

            {showEncuesta && (
                <EncuestaModal
                    categoria="cita"
                    fkIdCita={ncCitaIdCreada}
                    fkIdFactura={null}
                    onClose={() => {
                        setShowEncuesta(false);
                        toast.success("Cita y encuesta gestionadas correctamente");
                    }}
                />
            )}
        </div>
    );
}
