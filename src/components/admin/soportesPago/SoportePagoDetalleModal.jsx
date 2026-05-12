import { FaTimes, FaFileInvoiceDollar, FaCalendarAlt, FaUser, FaInfoCircle, FaBan, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export default function SoportePagoDetalleModal({ soporte, onClose }) {
  if (!soporte) return null;

  const cliente = soporte.cliente || {
    nombreCompleto: soporte.usuario ? `${soporte.usuario.usuNombre} ${soporte.usuario.usuApellido}` : "Consumidor Final",
    documento: soporte.usuario?.usuDocumento || "N/A",
    correo: soporte.usuario?.usuCorreo || "N/A",
    telefono: soporte.usuario?.usuTelefono || "N/A",
    direccion: soporte.usuario?.usuDireccion || "N/A"
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal widened to max-w-4xl to ensure nothing is 'squeezed' */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-blue-600 px-4 sm:px-8 py-4 sm:py-7 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-white/5">
              <FaFileInvoiceDollar className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">Detalle de Soporte de Pago</h2>
              <p className="text-sm text-blue-200 font-mono tracking-widest opacity-80">{soporte.sopNumero}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition cursor-pointer group">
            <FaTimes className="text-xl group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-10">
          {/* Alerta de Anulación */}
          {soporte.sopEstado === "ANULADA" && (
            <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-8 flex gap-6 text-red-900 animate-in slide-in-from-top-4 shadow-sm">
              <FaBan className="text-3xl shrink-0 mt-1" />
              <div>
                <p className="font-black text-xl leading-tight uppercase tracking-tight">Soporte Anulado</p>
                <p className="text-base mt-3 font-semibold opacity-90 leading-relaxed italic border-l-4 border-red-200 pl-4 py-1">
                  "{soporte.sopMotivoAnulacion || "Sin descripción de motivo registrado"}"
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-start">
            {/* Info Cliente Profesional */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] ml-1">
                <FaUser className="text-blue-500" /> Datos del Titular
                <div className="h-[1px] flex-1 bg-slate-100 ml-2"></div>
              </div>
              <div className="bg-blue-50/20 rounded-[2rem] p-4 sm:p-8 border border-blue-100/50 shadow-sm relative overflow-hidden">
                <h3 className="font-black text-slate-900 text-2xl mb-8 border-b border-blue-100/50 pb-4 tracking-tight">
                  {cliente.nombreCompleto}
                </h3>

                <div className="space-y-5">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-50 shrink-0">
                      <FaIdCard className="text-lg" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 opacity-70">Número de Identificación</p>
                      <p className="text-base text-slate-800 font-black tracking-wide">{cliente.documento}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-50 shrink-0">
                      <FaEnvelope className="text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 opacity-70">Correo Electrónico</p>
                      <p className="text-base text-slate-800 font-black break-all leading-tight">
                        {cliente.correo}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Soporte */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] ml-1">
                <FaInfoCircle className="text-blue-500" /> Información General
                <div className="h-[1px] flex-1 bg-slate-100 ml-2"></div>
              </div>
              <div className="bg-slate-50 rounded-[2rem] p-4 sm:p-8 border border-slate-100 space-y-4 sm:space-y-6 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Fecha de Emisión</span>
                  <span className="text-slate-900 font-black flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm text-sm">
                    <FaCalendarAlt className="text-blue-500" />
                    {new Date(soporte.sopFecha).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Estado Actual</span>
                  <span className={`font-black px-6 py-2.5 rounded-2xl text-[11px] uppercase tracking-[0.15em] shadow-sm border ${soporte.sopEstado === "ANULADA"
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-green-50 border-green-200 text-green-600"
                    }`}>
                    {soporte.sopEstado}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Método de Pago</span>
                  <span className="text-slate-900 font-black bg-white px-5 py-2.5 rounded-2xl border border-slate-200 uppercase tracking-tighter text-sm shadow-sm">
                    {soporte.sopCondiciones || "EFECTIVO"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Concepto */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 ml-1">Concepto o Descripción de Cobro</p>
            <div className="bg-slate-50 rounded-[2rem] p-4 sm:p-8 border border-slate-100 text-base sm:text-lg text-slate-800 shadow-inner font-black leading-relaxed tracking-tight">
              {soporte.sopConcepto || "—"}
            </div>
          </div>

          {/* Totales Profesional - Sin IVA */}
          <div className="bg-blue-700 rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-10 space-y-4 sm:space-y-6 relative overflow-hidden group border border-white/5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-blue-500/10 transition-colors duration-500"></div>
            <div className="flex justify-between text-lg text-slate-400">
              <span className="font-black border-l-4 border-blue-500/40 pl-6 uppercase tracking-[0.2em] text-[11px] h-fit">Subtotal Liquidado</span>
              <span className="text-white font-mono font-black tracking-widest text-xl">${Math.round(soporte.sopSubtotal).toLocaleString("es-CO")}</span>
            </div>
            <div className="pt-10 mt-8 border-t border-blue-600 flex justify-between items-end">
              <div>
                <p className="text-[11px] text-blue-400 font-black uppercase tracking-[0.4em] mb-3 px-1">Importe Total Neto</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white text-3xl font-black tracking-tighter underline underline-offset-[8px] decoration-blue-500 decoration-4">SOPORTE DE PAGO</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-blue-500 text-lg font-black mr-2 opacity-50">$</span>
                <span className="text-white text-3xl sm:text-5xl font-black font-mono tracking-tighter drop-shadow-2xl shadow-blue-500/40">
                  {Math.round(soporte.sopTotal).toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-8 py-4 sm:py-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-8 sm:px-12 py-3 sm:py-4 bg-blue-600 text-white font-black text-sm uppercase tracking-[0.25em] rounded-2xl hover:bg-blue-700 transition shadow-2xl shadow-blue-600/40 cursor-pointer active:scale-95"
          >
            Cerrar Consulta
          </button>
        </div>
      </div>
    </div>
  );
}
