import { useState, useEffect } from "react";
import { 
    FaEnvelopeOpenText, FaUser, FaPhone, FaReply, 
    FaCheckCircle, FaClock, FaSearch, FaFilter,
    FaTrashAlt, FaChevronRight, FaAddressBook
} from "react-icons/fa";
import toast from "react-hot-toast";
import StatusBadge from "../../components/ui/StatusBadge";
import { obtenerMensajes, actualizarEstadoMensaje } from "../../services/contactoService";
import ResponderMensajeModal from "../../components/admin/contacto/ResponderMensajeModal";

export default function MensajesContactoPage() {
    const [mensajes, setMensajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("TODOS");
    const [selectedMensaje, setSelectedMensaje] = useState(null);
    const [showResponderModal, setShowResponderModal] = useState(false);

    useEffect(() => {
        cargarMensajes();
    }, []);

    const cargarMensajes = async () => {
        try {
            setLoading(true);
            const data = await obtenerMensajes();
            setMensajes(data);
        } catch (error) {
            console.error("Error al cargar mensajes:", error);
            toast.error("No se pudieron cargar los mensajes");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, nuevoEstado) => {
        try {
            await actualizarEstadoMensaje(id, nuevoEstado);
            toast.success(`Mensaje marcado como ${nuevoEstado.toLowerCase()}`);
            cargarMensajes();
            if (selectedMensaje?.idContacto === id) {
                setSelectedMensaje(prev => ({ ...prev, conEstado: nuevoEstado }));
            }
        } catch (error) {
            toast.error("Error al actualizar el estado");
        }
    };

    const filteredMensajes = mensajes.filter(m => {
        const matchesSearch = 
            m.conNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.conCorreo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.conMensaje.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = statusFilter === "TODOS" || m.conEstado === statusFilter;
        
        return matchesSearch && matchesFilter;
    });


    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                        <FaEnvelopeOpenText className="text-white text-xl" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Mensajes de Contacto
                    </h1>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-2">
                    Gestiona las consultas y mensajes recibidos a través del formulario del sitio web.
                </p>
            </header>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Listado de Mensajes */}
                <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-4">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar por nombre, correo..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                <select 
                                    className="pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="TODOS">Todos los estados</option>
                                    <option value="PENDIENTE">Pendientes</option>
                                    <option value="LEIDO">Leídos</option>
                                    <option value="RESPONDIDO">Respondidos</option>
                                    <option value="ARCHIVADO">Archivados</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-xl" />
                                ))
                            ) : filteredMensajes.length > 0 ? (
                                filteredMensajes.map((m) => (
                                    <button
                                        key={m.idContacto}
                                        onClick={() => {
                                            setSelectedMensaje(m);
                                            if (m.conEstado === "PENDIENTE") {
                                                handleUpdateStatus(m.idContacto, "LEIDO");
                                            }
                                        }}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                                            selectedMensaje?.idContacto === m.idContacto
                                                ? "bg-blue-50 border-blue-200 shadow-sm"
                                                : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">
                                                {m.conNombre}
                                            </h3>
                                            <StatusBadge status={m.conEstado} />
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                                            {m.conMensaje}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                                            <FaClock className="text-[8px]" />
                                            {new Intl.DateTimeFormat('es-ES', { 
                                                day: '2-digit', 
                                                month: 'short', 
                                                year: 'numeric', 
                                                hour: '2-digit', 
                                                minute: '2-digit', 
                                                hour12: true 
                                            }).format(new Date(m.conFechaEnvio))}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaEnvelopeOpenText className="text-slate-300 text-2xl" />
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">No se encontraron mensajes</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detalle del Mensaje */}
                <div className="lg:col-span-12 xl:col-span-7">
                    {selectedMensaje ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-8">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-200">
                                            {selectedMensaje.conNombre[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800 leading-tight">
                                                {selectedMensaje.conNombre}
                                            </h2>
                                            <p className="text-xs text-slate-500 font-medium">
                                                Enviado el {new Intl.DateTimeFormat('es-ES', { 
                                                    dateStyle: 'full', 
                                                    timeStyle: 'short' 
                                                }).format(new Date(selectedMensaje.conFechaEnvio)).replace(',', ' a las')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {selectedMensaje.conEstado !== "RESPONDIDO" && (
                                            <button 
                                                onClick={() => setShowResponderModal(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-100"
                                            >
                                                <FaReply />
                                                Responder vía Gmail
                                            </button>
                                        )}
                                        {selectedMensaje.conEstado !== "ARCHIVADO" && (
                                            <button 
                                                onClick={() => handleUpdateStatus(selectedMensaje.idContacto, "ARCHIVADO")}
                                                className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all shadow-sm"
                                                title="Archivar"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 text-blue-600 leading-none">
                                            <FaEnvelopeOpenText />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Correo Electrónico</p>
                                            <p className="text-sm font-semibold text-slate-700 break-all">{selectedMensaje.conCorreo}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 text-blue-600 leading-none">
                                            <FaPhone />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Teléfono</p>
                                            <p className="text-sm font-semibold text-slate-700">{selectedMensaje.conTelefono || "No proporcionado"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-px flex-1 bg-slate-100"></div>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] px-2">Contenido del Mensaje</span>
                                        <div className="h-px flex-1 bg-slate-100"></div>
                                    </div>
                                    <div className="bg-white rounded-3xl p-8 border border-blue-50 relative group">
                                        <div className="absolute -left-3 top-8 w-6 h-6 bg-blue-50 rotate-45 border-l border-b border-blue-100 -translate-x-1/2"></div>
                                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                            {selectedMensaje.conMensaje}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-center">
                                    <button 
                                        onClick={() => setShowResponderModal(true)}
                                        className="inline-flex items-center gap-3 bg-blue-800 hover:bg-black text-white px-8 py-3.5 rounded-full text-base font-bold transition-all shadow-xl shadow-blue-900/20 active:scale-95 group cursor-pointer"
                                    >
                                        <FaReply className="group-hover:-translate-x-1 transition-transform" />
                                        Responder vía Gmail
                                        <FaChevronRight className="group-hover:translate-x-1 transition-transform text-xs" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 mb-6 text-slate-200">
                                <FaAddressBook className="text-6xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Selecciona un mensaje</h3>
                            <p className="text-slate-500 max-w-xs text-sm">
                                Pulsa sobre cualquier mensaje en el listado de la izquierda para ver todos los detalles y opciones de respuesta.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ResponderMensajeModal 
                isOpen={showResponderModal}
                onClose={() => setShowResponderModal(false)}
                mensaje={selectedMensaje}
                onResponded={cargarMensajes}
            />
        </div>
    );
}
