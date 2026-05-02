import { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash, FaEdit, FaCheck, FaSpinner, FaStethoscope, FaClock, FaDollarSign } from "react-icons/fa";
import * as servicioService from "../../../services/servicioService";
import toast from "react-hot-toast";

export default function GestionServiciosModal({ abierto, onClose }) {
    const [servicios, setServicios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    
    // Estado para nuevo/editar
    const [editando, setEditando] = useState(null);
    const [modoNuevo, setModoNuevo] = useState(false);
    const [formData, setFormData] = useState({
        serNombre: "",
        serDescripcion: "",
        serPrecio: "",
        serDuracion: 30
    });

    const loadServicios = async () => {
        try {
            setCargando(true);
            const data = await servicioService.getServicios();
            setServicios(data);
        } catch (error) {
            toast.error("Error al cargar servicios");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (abierto) loadServicios();
    }, [abierto]);

    if (!abierto) return null;

    const handleEdit = (s) => {
        setEditando(s.idServicio);
        setFormData({
            serNombre: s.serNombre,
            serDescripcion: s.serDescripcion || "",
            serPrecio: s.serPrecio,
            serDuracion: s.serDuracion
        });
        setModoNuevo(false);
    };

    const handleNuevo = () => {
        setModoNuevo(true);
        setEditando(null);
        setFormData({
            serNombre: "",
            serDescripcion: "",
            serPrecio: "",
            serDuracion: 30
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setGuardando(true);
            if (modoNuevo) {
                await servicioService.createServicio(formData);
                toast.success("Servicio creado");
            } else {
                await servicioService.updateServicio(editando, formData);
                toast.success("Servicio actualizado");
            }
            setModoNuevo(false);
            setEditando(null);
            loadServicios();
        } catch (error) {
            toast.error("Error al guardar");
        } finally {
            setGuardando(false);
        }
    };

    const handleToggleEstado = async (s) => {
        try {
            const nuevoEstado = s.serEstado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
            await servicioService.updateServicio(s.idServicio, { serEstado: nuevoEstado });
            // Actualización optimista local
            setServicios(prev => prev.map(item => 
                item.idServicio === s.idServicio ? { ...item, serEstado: nuevoEstado } : item
            ));
            toast.success(`Servicio ${nuevoEstado === "ACTIVO" ? "activado" : "desactivado"}`);
        } catch (error) {
            toast.error("Error al cambiar estado");
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md" onClick={onClose}>
            <div className="bg-white w-full max-w-3xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <FaStethoscope />
                            </div>
                            Gestión de Servicios
                        </h2>
                        <p className="text-sm font-medium text-slate-500 ml-13">Administra el catálogo de servicios de citas</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all active:scale-90">
                        <FaTimes className="text-xl text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Lista Izquierda */}
                    <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-100 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-white">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Catálogo</h3>
                            <button 
                                onClick={handleNuevo}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-100 transition active:scale-95"
                            >
                                <FaPlus /> Nuevo
                            </button>
                        </div>

                        {cargando ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                <FaSpinner className="animate-spin text-3xl mb-4" />
                                <p className="text-sm font-bold animate-pulse">Cargando...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {servicios.map(s => (
                                    <div 
                                        key={s.idServicio}
                                        className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                                            editando === s.idServicio 
                                            ? "border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/10" 
                                            : "border-slate-100 hover:border-blue-200 hover:bg-slate-50/50"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0" onClick={() => handleEdit(s)}>
                                                <p className={`font-bold text-sm leading-tight transition-colors ${s.serEstado === "INACTIVO" ? "text-slate-400" : "text-slate-900"}`}>
                                                    {s.serNombre}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1.5 opacity-70">
                                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <FaDollarSign className="text-[8px]" /> {parseFloat(s.serPrecio).toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <FaClock className="text-[8px]" /> {s.serDuracion}m
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => handleToggleEstado(s)}
                                                    className={`p-2 rounded-lg transition-all active:scale-90 ${
                                                        s.serEstado === "ACTIVO" 
                                                        ? "text-emerald-500 hover:bg-emerald-50" 
                                                        : "text-slate-300 hover:bg-slate-100"
                                                    }`}
                                                    title={s.serEstado === "ACTIVO" ? "Desactivar" : "Activar"}
                                                >
                                                    <FaCheck className={s.serEstado === "ACTIVO" ? "opacity-100" : "opacity-30"} />
                                                </button>
                                                <button 
                                                    onClick={() => handleEdit(s)}
                                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all active:scale-90"
                                                >
                                                    <FaEdit />
                                                </button>
                                            </div>
                                        </div>
                                        {s.serEstado === "INACTIVO" && (
                                            <div className="absolute inset-0 bg-white/40 pointer-events-none rounded-2xl" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Formulario Derecha */}
                    <div className="w-full md:w-1/2 bg-slate-50/50 p-4 sm:p-8 flex flex-col">
                        {modoNuevo || editando ? (
                            <form onSubmit={handleSave} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-black text-slate-900 border-l-4 border-blue-500 pl-4">
                                    {modoNuevo ? "Añadir Servicio" : "Editar Detalles"}
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre del Servicio</label>
                                        <input 
                                            required
                                            value={formData.serNombre}
                                            onChange={e => setFormData({...formData, serNombre: e.target.value})}
                                            placeholder="ej. Examen de Glaucoma"
                                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 text-emerald-600">Precio (COP)</label>
                                            <div className="relative">
                                                <FaDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                <input 
                                                    required
                                                    type="number"
                                                    value={formData.serPrecio}
                                                    onChange={e => setFormData({...formData, serPrecio: e.target.value})}
                                                    placeholder="0"
                                                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-sm text-emerald-700"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 text-indigo-600">Duración (min)</label>
                                            <div className="relative">
                                                <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                                                <input 
                                                    required
                                                    type="number"
                                                    value={formData.serDuracion}
                                                    onChange={e => setFormData({...formData, serDuracion: e.target.value})}
                                                    placeholder="30"
                                                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm text-indigo-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Descripción</label>
                                        <textarea 
                                            value={formData.serDescripcion}
                                            onChange={e => setFormData({...formData, serDescripcion: e.target.value})}
                                            placeholder="Breve descripción del servicio..."
                                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm h-32 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => { setModoNuevo(false); setEditando(null); }}
                                        className="flex-1 px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-white transition-all active:scale-95"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={guardando}
                                        className="flex-[2] px-6 py-3.5 rounded-2xl bg-blue-500 text-white font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {guardando ? "Guardando..." : modoNuevo ? "Crear Servicio" : "Guardar Cambios"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 select-none">
                                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center mb-6">
                                    <FaStethoscope className="text-4xl text-slate-400" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-500">Selecciona un servicio</h4>
                                <p className="text-xs font-medium max-w-[200px] mt-2">Haz clic en un servicio para editar sus precios y detalles o añade uno nuevo</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
