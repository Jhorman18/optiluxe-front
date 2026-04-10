import { useState, useEffect } from "react";
import { FaPlus, FaTimes, FaSearch, FaUser, FaIdCard, FaClock, FaCalendarAlt, FaStethoscope } from "react-icons/fa";
import * as citaService from "../../../services/citaService";
import { getUsuarios } from "../../../services/usuarioService";
import { services as SERVICIOS } from "../../../config/servicesData";
import toast from "react-hot-toast";
import CustomSelect from "../../ui/CustomSelect";

// ─── Slot helpers ─────────────────────────────────────────────────────────────
const ALL_SLOTS = [];
for (let min = 8 * 60; min <= 16 * 60 + 30; min += 30) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    ALL_SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
}
const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const isSlotOccupied = (slot, dur, ranges) => {
    const s = toMin(slot), e = s + dur;
    return ranges.some(({ inicio, fin }) => toMin(inicio) < e && toMin(fin) > s);
};

export default function CrearCitaModal({ abierto, onClose, onSuccess }) {
    const [ncBusqueda, setNcBusqueda] = useState("");
    const [ncPaciente, setNcPaciente] = useState(null);
    const [ncResultados, setNcResultados] = useState([]);
    const [ncBuscando, setNcBuscando] = useState(false);
    const [ncServicio, setNcServicio] = useState("");
    const [ncFecha, setNcFecha] = useState("");
    const [ncHora, setNcHora] = useState("");
    const [ncObs, setNcObs] = useState("");
    const [ncHorariosOcupados, setNcHorariosOcupados] = useState([]);
    const [ncCargandoSlots, setNcCargandoSlots] = useState(false);
    const [creandoCita, setCreandoCita] = useState(false);

    useEffect(() => {
        if (!ncResultados.length && !ncBusqueda.trim()) return;
        if (ncPaciente) { setNcResultados([]); return; }
        
        const t = setTimeout(async () => {
            setNcBuscando(true);
            try {
                const data = await getUsuarios({ busqueda: ncBusqueda, rol: "CLIENTE" });
                setNcResultados(data.slice(0, 8));
            } catch { /* ignore */ } finally { setNcBuscando(false); }
        }, 300);
        return () => clearTimeout(t);
    }, [ncBusqueda, ncPaciente]);

    useEffect(() => {
        if (!ncFecha) { setNcHorariosOcupados([]); return; }
        setNcCargandoSlots(true);
        setNcHorariosOcupados([]);
        citaService.getHorariosOcupados(ncFecha)
            .then(data => setNcHorariosOcupados(Array.isArray(data) ? data : []))
            .catch(() => setNcHorariosOcupados([]))
            .finally(() => setNcCargandoSlots(false));
    }, [ncFecha]);

    if (!abierto) return null;

    const handleClose = () => {
        setNcBusqueda(""); setNcPaciente(null); setNcResultados([]);
        setNcServicio(""); setNcFecha(""); setNcHora("");
        setNcObs("");
        onClose();
    };

    const handleCrearCita = async (e) => {
        e.preventDefault();
        if (!ncPaciente) { toast.error("Selecciona un paciente"); return; }
        if (!ncServicio) { toast.error("Selecciona un servicio"); return; }
        if (!ncFecha) { toast.error("Selecciona una fecha"); return; }
        if (!ncHora) { toast.error("Selecciona un horario"); return; }
        
        const servicio = SERVICIOS.find(s => s.title === ncServicio);
        try {
            setCreandoCita(true);
            const result = await citaService.crearCitaAdmin({
                fkIdUsuario: ncPaciente.idUsuario,
                citFecha: `${ncFecha}T${ncHora}:00.000Z`,
                citMotivo: servicio.title,
                citDuracion: servicio.durationMinutes,
                citEstado: "PENDIENTE",
                citObservaciones: ncObs || undefined,
            });
            
            toast.success("Cita agendada correctamente");
            const idCita = result.data?.idCita || result.data?.cita?.idCita;
            onSuccess && onSuccess(idCita);
            handleClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al crear la cita");
        } finally { setCreandoCita(false); }
    };

    const servicioActual = SERVICIOS.find(s => s.title === ncServicio);
    const duracionActual = servicioActual?.durationMinutes || 30;
    const slotsDisponibles = ncFecha ? ALL_SLOTS.filter(s => {
        if (toMin(s) + duracionActual > 17 * 60) return false;
        return !isSlotOccupied(s, duracionActual, ncHorariosOcupados);
    }) : [];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose}>
            <div className="bg-white w-full max-w-2xl min-h-[500px] rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <FaPlus className="text-blue-500" /> Nueva Cita
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">Agenda una cita para un paciente</p>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition">
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleCrearCita} className="px-8 py-6 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar flex-1">
                    {/* Buscador de Paciente */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Paciente</label>
                        {!ncPaciente ? (
                            <div className="relative mt-2">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar paciente por nombre o documento..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm shadow-sm"
                                    value={ncBusqueda}
                                    onChange={(e) => setNcBusqueda(e.target.value)}
                                    autoComplete="off"
                                />
                                {ncBuscando && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
                                    </div>
                                )}
                                {ncResultados.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
                                        {ncResultados.map(p => (
                                            <button
                                                key={p.idUsuario}
                                                type="button"
                                                onClick={() => setNcPaciente(p)}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition border-b border-slate-50 last:border-0"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {p.usuNombre[0]}{p.usuApellido[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{p.usuNombre} {p.usuApellido}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">Doc: {p.usuDocumento}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                                        <FaUser />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-blue-900">{ncPaciente.usuNombre} {ncPaciente.usuApellido}</p>
                                        <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1"><FaIdCard /> {ncPaciente.usuDocumento}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setNcPaciente(null); setNcBusqueda(""); }}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                                >
                                    Cambiar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Servicio</label>
                            <CustomSelect
                                value={ncServicio}
                                onChange={setNcServicio}
                                options={SERVICIOS.map(s => ({ value: s.title, label: s.title }))}
                                placeholder="Selecciona un servicio"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><FaCalendarAlt className="text-slate-400" /> Fecha</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                                value={ncFecha}
                                onChange={(e) => setNcFecha(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                            />
                        </div>
                    </div>

                    {ncFecha && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><FaClock className="text-slate-400" /> Horario</label>
                            {ncCargandoSlots ? (
                                <div className="flex items-center gap-2 py-4">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
                                    <p className="text-xs text-slate-500 animate-pulse">Cargando disponibilidad...</p>
                                </div>
                            ) : slotsDisponibles.length === 0 ? (
                                <p className="text-xs text-red-500 font-medium bg-red-50 p-3 rounded-xl border border-red-100">
                                    No hay horarios disponibles para esta fecha.
                                </p>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {slotsDisponibles.map(slot => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setNcHora(slot)}
                                            className={`py-2 text-[11px] font-bold rounded-lg border transition ${ncHora === slot
                                                ? "bg-blue-600 border-blue-600 text-white"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-blue-400"
                                            }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Observaciones (Opcional)</label>
                        <textarea
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm resize-none h-20"
                            placeholder="Detalles adicionales..."
                            value={ncObs}
                            onChange={(e) => setNcObs(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                        >
                            Cerrar
                        </button>
                        <button
                            type="submit"
                            disabled={creandoCita}
                            className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                        >
                            {creandoCita ? "Agendando..." : "Confirmar Cita"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
