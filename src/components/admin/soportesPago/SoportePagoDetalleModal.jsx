import { FaTimes, FaFileInvoiceDollar, FaCalendarAlt, FaUser, FaInfoCircle, FaBan, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

// Fallback para registros anteriores a carrito_servicio que guardaban servicios como JSON en sopConcepto
const parseLegacyConcepto = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "servicios" in parsed)
      return Array.isArray(parsed.servicios) ? parsed.servicios : [];
  } catch { /* texto plano, sin servicios */ }
  return [];
};

export default function SoportePagoDetalleModal({ soporte, loading = false, onClose }) {
  if (!soporte) return null;

  // Fuente primaria: tabla carrito_servicio (registros nuevos)
  // Fuente secundaria: JSON legacy en sopConcepto (registros anteriores a la migración)
  const serviciosDetalle = soporte.carrito?.carrito_servicio?.length > 0
    ? soporte.carrito.carrito_servicio.map(cs => ({
        nombre: cs.csNombre,
        precio: Number(cs.csPrecio),
        fecha: cs.csFecha,
        hora: cs.csHora,
      }))
    : parseLegacyConcepto(soporte.sopConcepto);

  const conceptoTexto = soporte.sopConcepto || "";

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

          {/* Recibo itemizado */}
          <div className="space-y-4 max-w-3xl mx-auto">
            {loading && (
              <div className="bg-slate-100 rounded-2xl p-3 animate-pulse">
                <div className="bg-white rounded-xl overflow-hidden">
                  <div className="px-6 py-4 space-y-4">
                    <div className="h-3 w-48 bg-slate-200 rounded mx-auto mb-6" />
                    <div className="h-4 w-40 bg-slate-300 rounded mx-auto mb-6" />
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <div className="h-3 w-32 bg-slate-100 rounded" />
                        <div className="h-3 w-16 bg-slate-100 rounded" />
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-1">
                      <div className="h-4 w-12 bg-slate-100 rounded" />
                      <div className="h-6 w-24 bg-blue-100 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && <div className="bg-slate-100 rounded-2xl p-3">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">

                {/* Cuerpo */}
                <div className="px-6 py-4 font-mono text-xs space-y-4">

                  {/* Cliente */}
                  <div className="pb-3 border-b border-dashed border-slate-200">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Cliente</p>
                    <p className="font-bold text-slate-800">{cliente.nombreCompleto}</p>
                    <p className="text-slate-500">Doc: {cliente.documento}</p>
                  </div>

                  {/* Productos del carrito */}
                  {soporte.carrito?.carrito_producto?.length > 0 && (
                    <div className="pb-3 border-b border-dashed border-slate-200">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Productos</p>
                      {/* Cabecera columnas */}
                      <div className="flex justify-between text-[9px] text-slate-400 font-black uppercase mb-1.5 border-b border-dotted border-slate-100 pb-1">
                        <span className="flex-1">Descripción</span>
                        <span className="w-8 text-center">Cant.</span>
                        <span className="w-20 text-right">Precio</span>
                        <span className="w-20 text-right">Total</span>
                      </div>
                      <div className="space-y-1.5">
                        {soporte.carrito.carrito_producto.map((cp, i) => {
                          const precio = Number(cp.producto?.proPrecio || 0);
                          const subtotal = precio * cp.cantidad;
                          return (
                            <div key={i} className="flex justify-between items-center">
                              <span className="flex-1 text-slate-700 truncate pr-2">{cp.producto?.proNombre || "Producto"}</span>
                              <span className="w-8 text-center text-slate-500">×{cp.cantidad}</span>
                              <span className="w-20 text-right text-slate-600">${precio.toLocaleString()}</span>
                              <span className="w-20 text-right font-bold text-slate-800">${subtotal.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Servicios del catálogo */}
                  {serviciosDetalle.length > 0 && (
                    <div className="pb-3 border-b border-dashed border-slate-200">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Servicios</p>
                      <div className="flex justify-between text-[9px] text-slate-400 font-black uppercase mb-1.5 border-b border-dotted border-slate-100 pb-1">
                        <span className="flex-1">Descripción</span>
                        <span className="w-24 text-right">Fecha / Hora</span>
                        <span className="w-20 text-right">Total</span>
                      </div>
                      <div className="space-y-1.5">
                        {serviciosDetalle.map((s, i) => (
                          <div key={i} className="flex justify-between items-start">
                            <span className="flex-1 text-slate-700 truncate pr-2">{s.nombre}</span>
                            <span className="w-24 text-right text-slate-500 text-[10px]">{s.fecha} {s.hora}</span>
                            <span className="w-20 text-right font-bold text-slate-800">{s.precio > 0 ? `$${Number(s.precio).toLocaleString()}` : "Gratuito"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Concepto texto plano (fallback para registros sin productos ni servicios estructurados) */}
                  {!soporte.carrito?.carrito_producto?.length && serviciosDetalle.length === 0 && conceptoTexto && (
                    <div className="pb-3 border-b border-dashed border-slate-200">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Concepto</p>
                      <p className="text-slate-700 font-semibold">{conceptoTexto}</p>
                    </div>
                  )}

                  {/* Método de pago */}
                  <div className="pb-3 border-b border-dashed border-slate-200">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Método de pago</p>
                    <p className="font-bold text-slate-700">{soporte.sopCondiciones || "EFECTIVO"}</p>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-1">
                    <p className="font-black text-slate-700 uppercase tracking-widest text-[11px]">Total</p>
                    <p className="font-black text-2xl text-blue-700">${Math.round(soporte.sopTotal).toLocaleString("es-CO")}</p>
                  </div>
                </div>

                {/* Footer recibo */}
                <div className="bg-slate-50 border-t border-slate-100 text-center py-3">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">¡Gracias por su compra!</p>
                </div>
              </div>
            </div>}
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
