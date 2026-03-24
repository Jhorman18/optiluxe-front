import { useState, useEffect } from "react";
import { FaTimes, FaClipboardCheck, FaUser, FaInfoCircle, FaCalendarAlt, FaTrashAlt, FaSpinner, FaCheckCircle, FaStar } from "react-icons/fa";
import * as encuestaService from "../../../services/encuestaService";
import toast from "react-hot-toast";

export default function EncuestaDetalleModal({ encuestaId, onClose, onEliminar, eliminando }) {
  const [encuesta, setEncuesta] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (encuestaId) {
      setLoading(true);
      encuestaService.getEncuestaById(encuestaId)
        .then(data => setEncuesta(data))
        .catch(() => toast.error("Error al cargar detalle de la encuesta"))
        .finally(() => setLoading(false));
    } else {
      setEncuesta(null);
    }
  }, [encuestaId]);

  if (!encuestaId) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-7 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/5">
              <FaClipboardCheck className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase">Resultados de Encuesta</h2>
              <p className="text-[10px] text-slate-400 font-mono tracking-[0.2em] opacity-80 uppercase">Auditoría de Satisfacción</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-full transition cursor-pointer group">
            <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <FaSpinner className="text-4xl animate-spin mb-4" />
                <p className="font-bold">Recuperando respuestas...</p>
             </div>
          ) : encuesta && (
            <>
              {/* Info Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[9px]">
                        <FaUser className="text-blue-500" /> Datos del Cliente
                    </div>
                    <div>
                        <p className="text-lg font-black text-slate-900 leading-tight">{encuesta.cliente.nombre}</p>
                        <p className="text-xs font-bold text-slate-500 mt-1">{encuesta.cliente.documento}</p>
                        <p className="text-xs text-blue-600 font-medium mt-1 underline underline-offset-2">{encuesta.cliente.correo}</p>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[9px]">
                        <FaInfoCircle className="text-blue-500" /> Contexto
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Fecha Registro</p>
                            <p className="text-sm font-black text-slate-800">{new Date(encuesta.enFecha).toLocaleString()}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            encuesta.enTipo?.toLowerCase().includes("cita") ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600"
                        }`}>
                            {encuesta.enTipo?.toLowerCase().includes("cita") ? "Cita Médica" : "Venta Directa"}
                        </span>
                    </div>
                </div>
              </div>

              {/* Respuestas */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[9px] ml-2">
                    <FaCheckCircle className="text-blue-500" /> Respuestas del Formulario
                    <div className="h-[1px] flex-1 bg-slate-200 ml-2"></div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {encuesta.respuesta_encuesta && encuesta.respuesta_encuesta.length > 0 ? (
                      encuesta.respuesta_encuesta.map((r, idx) => (
                        <div key={r.idRespuesta} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-blue-100 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-sm shrink-0 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-600 mb-2 leading-tight">{r?.pregunta?.preTexto || "Pregunta no disponible"}</p>
                                    <div className="bg-slate-50/50 rounded-xl px-4 py-3 border border-slate-100/50 flex items-center justify-between">
                                        <p className="text-sm font-black text-slate-900 tracking-tight">{r?.resValor || "Sin respuesta"}</p>
                                        {/* Visual star for scale questions if value is 1-5 */}
                                        {/^[1-5]$/.test(r?.resValor) && (
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar key={i} className={`text-xs ${i < parseInt(r.resValor) ? 'text-amber-400' : 'text-slate-200'}`} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-amber-50 rounded-2xl p-10 border border-amber-100 text-center text-amber-600 space-y-2">
                        <FaClipboardCheck className="text-4xl mx-auto opacity-30" />
                        <p className="font-bold">No se encontraron respuestas registradas para esta encuesta</p>
                      </div>
                    )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <button
            onClick={() => onEliminar(encuesta.idEncuesta)}
            disabled={eliminando || loading}
            className="flex items-center gap-2 px-6 py-3.5 bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-600 hover:text-white transition shadow-sm disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {eliminando ? <FaSpinner className="animate-spin" /> : <><FaTrashAlt /> Eliminar Registro</>}
          </button>
          <button
            onClick={onClose}
            className="px-10 py-3.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition shadow-2xl shadow-slate-900/40 cursor-pointer active:scale-95"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
}
