import { FaEye, FaTrashAlt, FaClipboardCheck, FaCalendarDay, FaUser } from "react-icons/fa";

export default function EncuestasTabla({ encuestas, loading, onVerDetalle, onEliminar, esEmpleado }) {
  if (loading && encuestas.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-400">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="font-bold">Cargando encuestas...</p>
      </div>
    );
  }

  if (encuestas.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-400">
        <FaClipboardCheck className="text-6xl mb-4 opacity-20" />
        <p className="font-bold">No se encontraron encuestas registradas</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tipo</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Referencia</th>
            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {encuestas.map((e) => (
            <tr key={e.idEncuesta} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <FaCalendarDay className="text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{new Date(e.enFecha).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{new Date(e.enFecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <FaUser className="text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 tracking-tight">{e.cliente}</p>
                    <p className="text-[10px] font-bold text-slate-400">{e.documento}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  e.enTipo?.toLowerCase().includes("cita") 
                  ? "bg-purple-50 border-purple-100 text-purple-600" 
                  : "bg-emerald-50 border-emerald-100 text-emerald-600"
                }`}>
                  {e.enTipo?.toLowerCase().includes("cita") ? "Consulta" : "Venta"}
                </span>
              </td>
              <td className="px-6 py-5">
                <p className="text-xs font-mono font-bold text-slate-500">
                  {e.referencia || "SIN REF"}
                </p>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onVerDetalle(e)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer group shadow-sm hover:shadow-md bg-white border border-slate-100"
                    title="Ver detalle de respuestas"
                  >
                    <FaEye className="text-base group-hover:scale-110 transition-transform" />
                  </button>
                  {!esEmpleado && (
                    <button
                      onClick={() => onEliminar(e.idEncuesta)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer group shadow-sm hover:shadow-md bg-white border border-slate-100"
                      title="Eliminar encuesta"
                    >
                      <FaTrashAlt className="text-base group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
