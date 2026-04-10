import { useState } from "react";
import { FaPaperPlane, FaTimes, FaUser, FaEnvelope, FaExclamationTriangle } from "react-icons/fa";
import toast from "react-hot-toast";
import { responderMensaje } from "../../../services/contactoService";

export default function ResponderMensajeModal({ isOpen, onClose, mensaje, onResponded }) {
    const [respuesta, setRespuesta] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !mensaje) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!respuesta.trim()) {
            return toast.error("Por favor, escribe una respuesta");
        }

        try {
            setIsSubmitting(true);
            await responderMensaje(mensaje.idContacto, respuesta);
            toast.success("Respuesta enviada correctamente vía Gmail");
            onResponded();
            onClose();
            setRespuesta("");
        } catch (error) {
            console.error("Error al enviar respuesta:", error);
            toast.error(error.response?.data?.message || "No se pudo enviar la respuesta");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>
            
            <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-blue-800 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <FaReply className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Responder Mensaje</h2>
                            <p className="text-blue-100 text-xs">Se enviará un correo desde la cuenta corporativa</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {/* Resumen del cliente */}
                    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <FaUser className="text-blue-500 text-xs" />
                            {mensaje.conNombre}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <FaEnvelope className="text-blue-500 text-xs" />
                            {mensaje.conCorreo}
                        </div>
                    </div>

                    {/* Mensaje original (referencia) */}
                    <div className="mb-6">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mensaje Original</label>
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-50 text-sm text-slate-600 line-clamp-3 italic">
                            "{mensaje.conMensaje}"
                        </div>
                    </div>

                    {/* Editor de respuesta */}
                    <div className="mb-6">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tu Respuesta</label>
                        <textarea
                            autoFocus
                            rows={8}
                            value={respuesta}
                            onChange={(e) => setRespuesta(e.target.value)}
                            placeholder="Escribe aquí tu respuesta profesional..."
                            className="w-full p-5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none font-medium text-slate-700"
                            required
                        ></textarea>
                        <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-amber-700">
                            <FaExclamationTriangle className="shrink-0 mt-0.5" />
                            <p>Este mensaje será enviado directamente al correo del cliente. Asegúrate de que el tono sea profesional y revisa la ortografía.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 bg-blue-800 hover:bg-black text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50 disabled:scale-100"
                        >
                            <FaPaperPlane className={isSubmitting ? "animate-bounce" : ""} />
                            {isSubmitting ? "Enviando..." : "Enviar Respuesta"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Helper icon
function FaReply(props) {
    return (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M8 256c0 137 111 248 248 248s248-111 248-248S393 8 256 8 8 119 8 256zm448 0c0 110.5-89.5 200-200 200S56 366.5 56 256 145.5 56 256 56s200 89.5 200 200zm-123.1-84c-3.1-3.1-8.2-3.1-11.3 0L190.4 305.1l-61.9-61.1c-3.1-3.1-8.2-3.1-11.3 0l-22.6 22.6c-3.1 3.1-3.1 8.2 0 11.3l90.1 89c3.1 3.1 8.2 3.1 11.3 0l154.6-152.6c3.1-3.1 3.1-8.2 0-11.3l-22.6-22.6z"></path>
        </svg>
    )
}
