import { useState } from "react";
import { FaBan, FaTimes, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

export default function AnularFacturaModal({ abierto, factura, onAnular, onClose, guardando }) {
  const [motivo, setMotivo] = useState("");

  if (!abierto || !factura) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (motivo.length < 10) return;
    onAnular(factura.idFactura, motivo);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-red-600">
            <FaBan />
            <h2 className="font-bold text-slate-800">Anular Factura</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-800 text-sm">
            <FaExclamationTriangle className="shrink-0 mt-0.5" />
            <p>
              Estás a punto de anular la factura <strong>{factura.facNumero}</strong>. 
              Esta acción no se puede deshacer y el estado cambiará permanentemente a <strong>ANULADA</strong>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Motivo de anulación
            </label>
            <textarea
              required
              rows={4}
              placeholder="Ej: Error en los datos del cliente, devolución de productos, etc..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition text-sm text-slate-700"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
            <p className={`text-[10px] mt-1 font-medium ${motivo.length < 10 ? 'text-slate-400' : 'text-green-600'}`}>
              Mínimo 10 caracteres ({motivo.length}/10)
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={motivo.length < 10 || guardando}
              className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {guardando ? <FaSpinner className="animate-spin" /> : "Confirmar Anulación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
