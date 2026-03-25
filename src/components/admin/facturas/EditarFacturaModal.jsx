import { useState, useEffect } from "react";
import { FaEdit, FaTimes, FaSpinner, FaSave } from "react-icons/fa";
import CustomSelect from "../../ui/CustomSelect";

export default function EditarFacturaModal({ abierto, factura, guardando, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    facNumero: "",
    facTotal: "",
    facConcepto: "",
    facCondiciones: "",
  });

  useEffect(() => {
    if (factura) {
      setFormData({
        facNumero: factura.facNumero || "",
        facTotal: factura.facTotal || "",
        facConcepto: factura.facConcepto || "",
        facCondiciones: factura.facCondiciones || "Efectivo",
      });
    }
  }, [factura]);

  if (!abierto || !factura) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const total = parseFloat(formData.facTotal);
    const subtotal = total / 1.19;
    const iva = total - subtotal;

    const payload = {
      facTotal: total,
      facSubtotal: subtotal,
      facIva: iva,
      facConcepto: formData.facConcepto,
      facCondiciones: formData.facCondiciones,
    };
    onSubmit(factura.idFactura, payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3 text-amber-600">
            <FaEdit className="text-xl" />
            <h2 className="font-extrabold text-slate-800 tracking-tight">Editar Factura</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition cursor-pointer">
            <FaTimes className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-8 space-y-5">
          <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 text-amber-800 text-xs font-medium border border-amber-100">
            <div className="shrink-0 mt-0.5 underline font-black">AVISO:</div>
            <p>Al editar el monto total, el subtotal y el IVA serán recalculados automáticamente para mantener la consistencia contable.</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex justify-between">
              <span>N° de Factura</span>
              <span className="text-amber-500 font-black tracking-normal lowercase">(no editable)</span>
            </label>
            <input
              readOnly
              name="facNumero"
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl outline-none transition text-sm font-bold text-slate-500 cursor-not-allowed"
              value={formData.facNumero}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Monto Total ($)</label>
            <input
              required
              type="number"
              name="facTotal"
              className="w-full px-4 py-4 bg-amber-50/30 border border-amber-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition text-lg font-black text-amber-700"
              value={formData.facTotal}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Concepto / Descripción</label>
            <textarea
              required
              name="facConcepto"
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition text-sm font-medium"
              value={formData.facConcepto}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Método de Pago</label>
            <CustomSelect
              value={formData.facCondiciones}
              onChange={(val) => handleChange({ target: { name: "facCondiciones", value: val } })}
              options={[
                { value: "Efectivo", label: "Efectivo" },
                { value: "PSE", label: "PSE / Transferencia" },
                { value: "Tarjeta", label: "Tarjeta de Crédito/Débito" }
              ]}
              required={true}
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 px-4 py-3 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 transition shadow-xl shadow-amber-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {guardando ? <FaSpinner className="animate-spin" /> : <><FaSave /> Guardar Registro</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
