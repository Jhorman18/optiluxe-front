import { useState, useEffect } from "react";
import { FaStethoscope, FaTimes, FaSearch, FaUser, FaIdCard, FaCalendarAlt, FaClock, FaCheck } from "react-icons/fa";
import * as citaService from "../../../services/citaService";
import { getUsuarios } from "../../../services/usuarioService";
import { crearHistoriaClinica } from "../../../services/historiaClinicaService";
import toast from "react-hot-toast";

export default function CrearHistoriaModal({ abierto, onClose, onSuccess }) {
    const [busqueda, setBusqueda] = useState("");
    const [paciente, setPaciente] = useState(null);
    const [resultados, setResultados] = useState([]);
    const [buscando, setBuscando] = useState(false);

    const [citasCargando, setCitasCargando] = useState(false);
    const [citas, setCitas] = useState([]);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);

    const [historiaForm, setHistoriaForm] = useState({
        hisDiagnostico: "",
        hisFormulaOptica: "",
        hisObservaciones: ""
    });
    const [guardando, setGuardando] = useState(false);

    // Buscador de Pacientes
    useEffect(() => {
        if (!busqueda.trim() || paciente) { setResultados([]); return; }
        const t = setTimeout(async () => {
            setBuscando(true);
            try {
                const data = await getUsuarios({ busqueda: busqueda, rol: "CLIENTE" });
                setResultados(data.slice(0, 8));
            } catch { /* ignore */ } finally { setBuscando(false); }
        }, 300);
        return () => clearTimeout(t);
    }, [busqueda, paciente]);

    // Cargar Citas del Paciente
    useEffect(() => {
        if (!paciente) { setCitas([]); return; }
        const cargarCitas = async () => {
            setCitasCargando(true);
            try {
                // Buscamos todas las citas del admin para este usuario
                // El servicio getAllCitasAdmin suele recibir filtros.
                const data = await citaService.getAllCitasAdmin({ busqueda: paciente.usuDocumento });
                // Solo nos interesan citas que NO tengan historia clínica aún y que estén en estados lógicos
                const filtradas = data.filter(c => 
                    (c.citEstado === "CONFIRMADA" || c.citEstado === "EN_ATENCION") && 
                    (!c.historia_clinica || c.historia_clinica.length === 0)
                );
                setCitas(filtradas);
            } catch {
                toast.error("Error al cargar citas del paciente");
            } finally {
                setCitasCargando(false);
            }
        };
        cargarCitas();
    }, [paciente]);

    if (!abierto) return null;

    const handleClose = () => {
        setBusqueda(""); setPaciente(null); setResultados([]);
        setCitas([]); setCitaSeleccionada(null);
        setHistoriaForm({ hisDiagnostico: "", hisFormulaOptica: "", hisObservaciones: "" });
        onClose();
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (!citaSeleccionada) { toast.error("Selecciona una cita"); return; }
        if (!historiaForm.hisDiagnostico) { toast.error("El diagnóstico es obligatorio"); return; }
        if (!historiaForm.hisFormulaOptica) { toast.error("La fórmula óptica es obligatoria"); return; }

        try {
            setGuardando(true);
            await crearHistoriaClinica(citaSeleccionada.idCita, historiaForm);
            toast.success("Historia clínica registrada correctamente");
            onSuccess && onSuccess();
            handleClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al registrar historia clínica");
        } finally {
            setGuardando(false);
        }
    };

    const formatFecha = (iso) => new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
    const formatHora = (iso) => new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose}>
            <div className="bg-white w-full max-w-2xl min-h-[500px] rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <FaStethoscope className="text-purple-500" /> Crear Historial Clínico
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">Registra la atención del paciente</p>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition">
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <div className="px-8 py-6 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar flex-1">
                    
                    {/* 1. Buscar Paciente */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">1. Seleccionar Paciente</label>
                        {!paciente ? (
                            <div className="relative mt-2">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Nombre o documento del paciente..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition text-sm shadow-sm"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    autoComplete="off"
                                />
                                {buscando && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
                                    </div>
                                )}
                                {resultados.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                                        {resultados.map(p => (
                                            <button
                                                key={p.idUsuario}
                                                type="button"
                                                onClick={() => setPaciente(p)}
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
                                        <p className="text-sm font-bold text-blue-900">{paciente.usuNombre} {paciente.usuApellido}</p>
                                        <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1"><FaIdCard /> {paciente.usuDocumento}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setPaciente(null); setBusqueda(""); setCitaSeleccionada(null); }}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                                >
                                    Cambiar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 2. Seleccionar Cita */}
                    {paciente && (
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700">2. Seleccionar Cita sin completar</label>
                            {citasCargando ? (
                                <div className="flex items-center gap-2 py-4">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
                                    <p className="text-xs text-slate-500">Buscando citas...</p>
                                </div>
                            ) : citas.length === 0 ? (
                                <p className="text-xs text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100 font-medium">
                                    No se encontraron citas confirmadas o en atención sin historial clínico para este paciente.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {citas.map(c => (
                                        <button
                                            key={c.idCita}
                                            type="button"
                                            onClick={() => setCitaSeleccionada(c)}
                                            className={`w-full p-4 rounded-xl border transition text-left flex items-center justify-between ${citaSeleccionada?.idCita === c.idCita
                                                ? "bg-purple-50 border-purple-500 shadow-sm"
                                                : "bg-white border-slate-200 hover:border-purple-300"
                                            }`}
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{c.citMotivo}</p>
                                                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-medium">
                                                    <span className="flex items-center gap-1"><FaCalendarAlt /> {formatFecha(c.citFecha)}</span>
                                                    <span className="flex items-center gap-1"><FaClock /> {formatHora(c.citFecha)}</span>
                                                </div>
                                            </div>
                                            {citaSeleccionada?.idCita === c.idCita && (
                                                <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center">
                                                    <FaCheck className="text-[10px]" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. Formulario de Historia */}
                    {citaSeleccionada && (
                        <form onSubmit={handleGuardar} className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                            <label className="text-sm font-bold text-slate-700 block mb-2">3. Detalles de la Atención</label>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnóstico *</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-sm min-h-[80px]"
                                    placeholder="Describe el diagnóstico del paciente..."
                                    value={historiaForm.hisDiagnostico}
                                    onChange={e => setHistoriaForm({ ...historiaForm, hisDiagnostico: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fórmula Óptica *</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-sm min-h-[80px]"
                                    placeholder="Especifica la graduación y fórmula..."
                                    value={historiaForm.hisFormulaOptica}
                                    onChange={e => setHistoriaForm({ ...historiaForm, hisFormulaOptica: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observaciones</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-sm h-20"
                                    placeholder="Notas adicionales (conducta, recomendaciones)..."
                                    value={historiaForm.hisObservaciones}
                                    onChange={e => setHistoriaForm({ ...historiaForm, hisObservaciones: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setCitaSeleccionada(null)}
                                    className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                                >
                                    Atrás
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className="flex-1 py-3.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-600/20 disabled:opacity-50"
                                >
                                    {guardando ? "Registrando..." : "Guardar Historia"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
