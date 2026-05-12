import { useState, useEffect } from "react";
import { 
    FaPlus, FaTimes, FaSearch, FaUser, FaIdCard, FaClock, 
    FaCalendarAlt, FaStethoscope, FaChevronLeft, FaMoneyBillWave, 
    FaUniversity, FaFileInvoiceDollar, FaSpinner, FaCreditCard
} from "react-icons/fa";
import * as citaService from "../../../services/citaService";
import { getUsuarios } from "../../../services/usuarioService";
import { getServicios } from "../../../services/servicioService";
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

const BANCOS = [
    "Bancolombia", "Davivienda", "Banco de Bogotá", "BBVA Colombia", "Nequi", "Banco Popular",
];

export default function CrearCitaModal({ abierto, onClose, onSuccess }) {
    const [step, setStep] = useState(1); // 1: Datos Cita, 2: Pago
    
    // Step 1 State
    const [ncBusqueda, setNcBusqueda] = useState("");
    const [ncPaciente, setNcPaciente] = useState(null);
    const [ncResultados, setNcResultados] = useState([]);
    const [ncBuscando, setNcBuscando] = useState(false);
    const [ncServicioId, setNcServicioId] = useState("");
    const [ncFecha, setNcFecha] = useState("");
    const [ncHora, setNcHora] = useState("");
    const [ncObs, setNcObs] = useState("");
    
    // Paso 2 State (Pago)
    const [metodoPago, setMetodoPago] = useState("EFECTIVO");
    const [banco, setBanco] = useState("");
    const [numeroCuenta, setNumeroCuenta] = useState("");
    const [finalizando, setFinalizando] = useState(false);

    // Data lists
    const [pacientesList, setPacientesList] = useState([]);
    const [serviciosList, setServiciosList] = useState([]);
    const [ncHorariosOcupados, setNcHorariosOcupados] = useState([]);
    const [ncCargandoSlots, setNcCargandoSlots] = useState(false);
    const [creandoCita, setCreandoCita] = useState(false);
    const [citaIdCreada, setCitaIdCreada] = useState(null);

    // Carga inicial de datos
    useEffect(() => {
        if (abierto) {
            // Cargar pacientes (excepto admin)
            getUsuarios().then(data => {
                const filtrados = data.filter(u => u.rol?.rolNombre !== "ADMIN");
                setPacientesList(filtrados);
            });
            // Cargar servicios activos
            getServicios().then(data => setServiciosList(data.filter(s => s.serEstado === "ACTIVO")));
        }
    }, [abierto]);

    // Slots ocupados
    useEffect(() => {
        if (!ncFecha) { setNcHorariosOcupados([]); return; }
        setNcCargandoSlots(true);
        citaService.getHorariosOcupados(ncFecha)
            .then(data => setNcHorariosOcupados(Array.isArray(data) ? data : []))
            .catch(() => setNcHorariosOcupados([]))
            .finally(() => setNcCargandoSlots(false));
    }, [ncFecha]);

    if (!abierto) return null;

    const handleClose = () => {
        setStep(1); setNcBusqueda(""); setNcPaciente(null); setNcResultados([]);
        setNcServicioId(""); setNcFecha(""); setNcHora(""); setNcObs("");
        setMetodoPago("EFECTIVO"); setBanco(""); setNumeroCuenta("");
        onClose();
    };

    const servicioSeleccionado = serviciosList.find(s => String(s.idServicio) === String(ncServicioId));
    const duracionActual = servicioSeleccionado?.serDuracion || 30;
    const slotsDisponibles = ncFecha ? ALL_SLOTS.filter(s => {
        if (toMin(s) + duracionActual > 17 * 60) return false;
        return !isSlotOccupied(s, duracionActual, ncHorariosOcupados);
    }) : [];

    const handleSelectPaciente = (id) => {
        const p = pacientesList.find(u => String(u.idUsuario) === String(id));
        setNcPaciente(p);
    };

    // --- Lógica de envío ---

    const handleCrearCitaPrevia = async (e) => {
        e.preventDefault();
        if (!ncPaciente) { toast.error("Selecciona un paciente"); return; }
        if (!servicioSeleccionado) { toast.error("Selecciona un servicio"); return; }
        if (!ncFecha) { toast.error("Selecciona una fecha"); return; }
        if (!ncHora) { toast.error("Selecciona un horario"); return; }

        try {
            setCreandoCita(true);
            const result = await citaService.crearCitaAdmin({
                fkIdUsuario: ncPaciente.idUsuario,
                citFecha: `${ncFecha}T${ncHora}:00.000Z`,
                citMotivo: servicioSeleccionado.serNombre,
                citDuracion: servicioSeleccionado.serDuracion,
                citEstado: "PENDIENTE",
                citObservaciones: ncObs || undefined,
            });

            const idCita = result.data?.idCita || result.data?.cita?.idCita;
            setCitaIdCreada(idCita);

            // Si el servicio es gratuito ($0), procedemos de una vez
            if (parseFloat(servicioSeleccionado.serPrecio) === 0) {
                await registrarPagoFinal(idCita, 0, "EFECTIVO", "SERVICIO GRATUITO");
            } else {
                setStep(2);
            }
        } catch (error) {
            toast.error(error.message || "Error al agendar la cita");
        } finally {
            setCreandoCita(false);
        }
    };

    const registrarPagoFinal = async (idCita, monto, metodo, condiciones) => {
        try {
            setFinalizando(true);
            await citaService.registrarPagoCita(idCita, { monto, metodoPago: condiciones });
            toast.success("Cita agendada y soporte de pago generado correctamente");
            onSuccess && onSuccess(idCita);
            handleClose();
        } catch (error) {
            toast.error("Cita creada, pero error al generar soporte de pago. Favor revisar en el panel.");
            onClose(); // Cerramos igual porque la cita ya está en la DB
        } finally {
            setFinalizando(false);
        }
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (metodoPago === "PSE") {
            if (!banco || !numeroCuenta) { toast.error("Completa los datos de pago"); return; }
            if (banco === "Nequi" && numeroCuenta.length !== 10) { toast.error("Nequi requiere 10 dígitos"); return; }
        }

        let condiciones = metodoPago;
        if (metodoPago === "PSE") {
            condiciones = `PSE - ${banco} - ****${numeroCuenta.slice(-4)}`;
        }

        await registrarPagoFinal(citaIdCreada, parseFloat(servicioSeleccionado.serPrecio), metodoPago, condiciones);
    };

    // --- Renderers ---

    const renderStep1 = () => (
        <>
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FaPlus className="text-blue-500" /> Nueva Cita
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">Paso 1: Información de la cita</p>
                </div>
                <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition">
                    <FaTimes className="text-xl" />
                </button>
            </div>

            <form onSubmit={handleCrearCitaPrevia} className="px-8 py-6 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar flex-1">
                {/* Paciente y Servicio */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Paciente</label>
                        {!ncPaciente ? (
                            <CustomSelect
                                value=""
                                onChange={handleSelectPaciente}
                                options={pacientesList.map(p => ({ 
                                    value: String(p.idUsuario), 
                                    label: `${p.usuNombre} ${p.usuApellido} (${p.usuDocumento})` 
                                }))}
                                placeholder="Selecciona un paciente..."
                            />
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in zoom-in-95">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                                        <FaUser />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-blue-900">{ncPaciente.usuNombre} {ncPaciente.usuApellido}</p>
                                        <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                                            <FaIdCard /> {ncPaciente.usuDocumento}
                                        </p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setNcPaciente(null)} className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer">
                                    Cambiar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Servicio</label>
                            <CustomSelect
                                value={ncServicioId}
                                onChange={setNcServicioId}
                                options={serviciosList.map(s => ({ value: String(s.idServicio), label: `${s.serNombre} ($${parseFloat(s.serPrecio).toLocaleString()})` }))}
                                placeholder="Selecciona un servicio"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FaCalendarAlt /> Fecha</label>
                            <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm" value={ncFecha} onChange={(e) => setNcFecha(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                        </div>
                    </div>

                    {ncFecha && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FaClock /> Horario Disponible</label>
                            {ncCargandoSlots ? (
                                <div className="flex items-center gap-2 py-4"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full" /><p className="text-xs text-slate-500 animate-pulse">Cargando disponibilidad...</p></div>
                            ) : slotsDisponibles.length === 0 ? (
                                <p className="text-xs text-red-500 font-medium bg-red-50 p-3 rounded-xl border border-red-100">No hay horarios disponibles para esta fecha.</p>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {slotsDisponibles.map(slot => (
                                        <button key={slot} type="button" onClick={() => setNcHora(slot)} className={`py-2 text-[11px] font-bold rounded-lg border transition ${ncHora === slot ? "bg-blue-600 border-blue-600 text-white shadow-md" : "bg-white border-slate-200 text-slate-600 hover:border-blue-400"}`}>{slot}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Observaciones (Opcional)</label>
                        <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm resize-none h-20" placeholder="Detalles adicionales..." value={ncObs} onChange={(e) => setNcObs(e.target.value)} />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={handleClose} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">Cerrar</button>
                    <button type="submit" disabled={creandoCita} className="flex-[2] py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50">
                        {creandoCita ? "Agendando..." : "Siguiente: Pago / Confirmar"}
                    </button>
                </div>
            </form>
        </>
    );

    const renderStep2 = () => (
        <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
            {/* Header Mirroring Invoice */}
            <div className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-100 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                        <FaMoneyBillWave className="text-xl" />
                    </div>
                    <div>
                        <h2 className="font-black text-slate-800 text-lg">Ventanilla de Pago</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            Paso 2 de 2 ― Selección de pago
                        </p>
                    </div>
                </div>
                <button onClick={handleClose} className="p-3 hover:bg-slate-50 text-slate-300 hover:text-slate-600 rounded-2xl transition cursor-pointer">
                    <FaTimes />
                </button>
            </div>

            <form onSubmit={handleFinalSubmit} className="px-4 sm:px-8 pb-6 sm:pb-10 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <button type="button" onClick={() => setStep(1)} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition cursor-pointer">
                        <FaChevronLeft className="text-xs" />
                    </button>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Volver a datos de cita</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { id: "EFECTIVO", label: "Efectivo", icon: FaMoneyBillWave, desc: "Pago en sede", color: "emerald" },
                        { id: "PSE", label: "PSE / Banco", icon: FaUniversity, desc: "Débito en línea", color: "blue" }
                    ].map(m => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => setMetodoPago(m.id)}
                            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition text-center group ${metodoPago === m.id ? `bg-${m.color}-50 border-${m.color}-500 shadow-lg shadow-${m.color}-200/50` : "bg-white border-slate-100 hover:border-slate-200"}`}
                        >
                            <div className={`p-4 rounded-2xl transition ${metodoPago === m.id ? `bg-${m.color}-600 text-white shadow-lg` : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                <m.icon className="text-xl" />
                            </div>
                            <div>
                                <p className={`font-black text-[11px] uppercase tracking-wider ${metodoPago === m.id ? `text-${m.color}-700` : "text-slate-600"}`}>{m.label}</p>
                                <p className="text-[9px] text-slate-400 font-bold">{m.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {metodoPago === "PSE" && (
                    <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-in zoom-in-95">
                        <div>
                            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Banco emisor</label>
                            <select value={banco} onChange={e => setBanco(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition">
                                <option value="">Elegir banco...</option>
                                {BANCOS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Número de cuenta / Celular</label>
                            <input type="text" placeholder={banco === "Nequi" ? "300 000 0000" : "00000000000"} value={numeroCuenta} onChange={e => setNumeroCuenta(e.target.value.replace(/\D/g, ""))} maxLength={10} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition" />
                        </div>
                    </div>
                )}

                {metodoPago === "EFECTIVO" && (
                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200">
                            <FaMoneyBillWave />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Pago Físico</p>
                            <p className="text-[9px] text-emerald-600 font-bold">Confirma la recepción del dinero antes de finalizar.</p>
                        </div>
                    </div>
                )}

                {/* Totales Resumen */}
                <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 flex justify-between items-center mt-4">
                    <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Resumen de Cobro</p>
                        <p className="text-sm font-bold text-slate-600 truncate max-w-[200px]">{servicioSeleccionado?.serNombre}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-blue-700">${parseFloat(servicioSeleccionado?.serPrecio || 0).toLocaleString()}</p>

                    </div>
                </div>

                <button
                    type="submit"
                    disabled={finalizando}
                    className="w-full py-5 bg-blue-700 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl hover:bg-black transition shadow-xl shadow-blue-700/20 flex items-center justify-center gap-3 cursor-pointer group"
                >
                    {finalizando ? <FaSpinner className="animate-spin" /> : <><FaFileInvoiceDollar className="text-xl" /> Finalizar y Generar Soporte de Pago</>}
                </button>
            </form>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleClose}>
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20" onClick={e => e.stopPropagation()}>
                {step === 1 ? renderStep1() : renderStep2()}
            </div>
        </div>
    );
}
