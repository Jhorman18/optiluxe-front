import { useState, useEffect } from "react";
import { 
  FaPlusCircle, FaTimes, FaSpinner, FaFileInvoiceDollar, FaUser, 
  FaBoxOpen, FaClipboardList, FaStethoscope, FaPlus, FaTrash,
  FaUniversity, FaMoneyBillWave, FaChevronLeft, FaCheck
} from "react-icons/fa";
import * as usuarioService from "../../../services/usuarioService";
import * as productoService from "../../../services/productoService";
import * as citaService from "../../../services/citaService";
import toast from "react-hot-toast";
import CustomSelect from "../../ui/CustomSelect";

const SERVICIOS_CATALOGO = [
  { id: "S1", nombre: "Examen Visual Completo", precio: 80000, descripcion: "Evaluación exhaustiva de salud visual" },
  { id: "S2", nombre: "Renovación de Fórmula", precio: 60000, descripcion: "Actualización de prescripción óptica" },
  { id: "S3", nombre: "Adaptación de Lentes de Contacto", precio: 100000, descripcion: "Prueba y ajuste de lentes de contacto" },
  { id: "S4", nombre: "Selección y Ajuste de Monturas", precio: 0, descripcion: "Asesoría personalizada gratuita" },
];

const BANCOS = [
  "Bancolombia", "Davivienda", "Banco de Bogotá", "BBVA Colombia", "Nequi", "Banco Popular",
];

export default function CrearFacturaModal({ abierto, guardando, onClose, onSubmit }) {
  const [step, setStep] = useState(1); // 1: Datos, 2: Pago
  const [formData, setFormData] = useState({
    facTotal: "",
    facConcepto: "",
    facCondiciones: "Efectivo",
    fkIdUsuario: "",
    tipoVenta: "producto",
    idReferencia: "",
    subTipo: "cita",
    items: [],
    // Campos de pago
    metodoPago: "EFECTIVO",
    banco: "",
    tipoCuenta: "ahorros",
    numeroCuenta: ""
  });

  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [citasUsuario, setCitasUsuario] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (abierto) {
      setStep(1);
      setLoadingData(true);
      Promise.all([
        usuarioService.getUsuarios(),
        productoService.getProductos({ admin: true })
      ]).then(([usuariosData, productosData]) => {
        setUsuarios(usuariosData);
        setProductos(productosData || []);
      }).catch((err) => {
        console.error("Error cargando datos iniciales:", err);
        toast.error("Error al cargar productos o usuarios");
      }).finally(() => {
        setLoadingData(false);
      });
    }
  }, [abierto]);

  useEffect(() => {
    if (formData.fkIdUsuario && formData.tipoVenta === "cita" && formData.subTipo === "cita") {
      citaService.getAllCitasAdmin({ fkIdUsuario: formData.fkIdUsuario })
        .then(data => {
          const filtradas = data.filter(c => c.fkIdUsuario === parseInt(formData.fkIdUsuario));
          setCitasUsuario(filtradas);
        })
        .catch(() => toast.error("Error al cargar citas"));
    }
  }, [formData.fkIdUsuario, formData.tipoVenta, formData.subTipo]);

  useEffect(() => {
    if (formData.tipoVenta === "producto" && formData.items.length > 0) {
      const subtotal = formData.items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
      const total = subtotal * 1.19;
      setFormData(prev => ({ 
        ...prev, 
        facTotal: Math.round(total).toString(),
        facConcepto: `Venta de ${formData.items.length} producto(s)`
      }));
    }
  }, [formData.items, formData.tipoVenta]);

  if (!abierto) return null;

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { idProducto: "", cantidad: 1, precio: 0, nombre: "" }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleItemProductChange = (index, productId) => {
    const prod = productos.find(p => String(p.id) === String(productId));
    if (!prod) return;
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], idProducto: productId, precio: Number(prod.precio), nombre: prod.nombre };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleItemQuantityChange = (index, qty) => {
    const newItems = [...formData.items];
    newItems[index].cantidad = Math.max(1, parseInt(qty) || 1);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "idReferencia" && formData.tipoVenta === "cita") {
      if (formData.subTipo === "catalogo") {
        const serv = SERVICIOS_CATALOGO.find(s => s.id === value);
        if (serv) {
          setFormData(prev => ({ ...prev, idReferencia: value, facTotal: serv.precio, facConcepto: serv.nombre }));
          return;
        }
      } else {
        const cita = citasUsuario.find(c => String(c.idCita) === String(value));
        if (cita) {
          setFormData(prev => ({ ...prev, idReferencia: value, facTotal: 50000, facConcepto: `Cita: ${cita.citMotivo}` }));
          return;
        }
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validarPaso1 = () => {
    if (!formData.fkIdUsuario) { toast.error("Selecciona un cliente"); return false; }
    if (formData.tipoVenta === "producto") {
      if (formData.items.length === 0) { toast.error("Agrega productos"); return false; }
      if (formData.items.some(i => !i.idProducto)) { toast.error("Completa la selección"); return false; }
    } else {
      if (!formData.facTotal) { toast.error("Ingresa el monto"); return false; }
    }
    return true;
  };

  const validarPago = () => {
    if (formData.metodoPago === "PSE") {
      if (!formData.banco || !formData.numeroCuenta) {
        toast.error("Completa los datos bancarios");
        return false;
      }
      if (formData.banco === "Nequi" && formData.numeroCuenta.length !== 10) {
        toast.error("Nequi requiere 10 dígitos");
        return false;
      }
    }
    return true;
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!validarPago()) return;

    const total = parseFloat(formData.facTotal);
    const subtotal = total / 1.19;
    const iva = total - subtotal;

    // Generar condiciones de pago descriptivas
    let condiciones = formData.metodoPago;
    if (formData.metodoPago === "PSE") {
      condiciones = `PSE - ${formData.banco} - ${formData.tipoCuenta.toUpperCase()} - ****${formData.numeroCuenta.slice(-4)}`;
    }

    const payload = {
      facTotal: total,
      facSubtotal: subtotal,
      facIva: iva,
      facConcepto: formData.facConcepto,
      facCondiciones: condiciones,
      fkIdUsuario: parseInt(formData.fkIdUsuario),
      facFecha: new Date().toISOString(),
      facEstado: "PAGADA",
    };

    if (formData.tipoVenta === "producto") {
      payload.items = formData.items.map(item => ({ idProducto: parseInt(item.idProducto), cantidad: parseInt(item.cantidad) }));
    } else if (formData.tipoVenta === "cita" && formData.subTipo === "cita" && formData.idReferencia) {
      payload.fkIdCita = parseInt(formData.idReferencia);
    }

    onSubmit(payload, () => {
      setFormData({
        facTotal: "", facConcepto: "", facCondiciones: "Efectivo", fkIdUsuario: "",
        tipoVenta: "producto", idReferencia: "", subTipo: "cita", items: [],
        metodoPago: "EFECTIVO", banco: "", tipoCuenta: "ahorros", numeroCuenta: ""
      });
      onClose();
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Selección de Cliente */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
          <FaUser className="inline mr-1" /> Cliente Destinatario
        </label>
        <CustomSelect
          value={formData.fkIdUsuario}
          onChange={(val) => handleChange({ target: { name: "fkIdUsuario", value: val } })}
          placeholder="Seleccionar Cliente..."
          options={usuarios.map(u => ({ value: String(u.idUsuario), label: `${u.usuNombre} ${u.usuApellido} (${u.usuDocumento})` }))}
        />
      </div>

      {/* Tabs Venta */}
      <div className="flex gap-4">
        {[
          { id: "producto", label: "Productos", icon: FaBoxOpen },
          { id: "cita", label: "Servicios", icon: FaStethoscope }
        ].map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFormData(p => ({ ...p, tipoVenta: t.id, idReferencia: "", items: [], facTotal: "", facConcepto: "" }))}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition font-black text-[10px] uppercase tracking-wider ${formData.tipoVenta === t.id ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"}`}
          >
            <t.icon className="text-sm" /> {t.label}
          </button>
        ))}
      </div>

      {/* Contenido Dinámico Step 1 */}
      {formData.tipoVenta === "producto" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Items Seleccionados</span>
            <button type="button" onClick={handleAddItem} className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition cursor-pointer">
              <FaPlus /> Añadir
            </button>
          </div>
          <div className="space-y-3 pr-1">
            {formData.items.length === 0 ? <p className="text-center text-xs text-slate-400 italic py-4">No hay productos añadidos</p> : 
              formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <CustomSelect
                      value={item.idProducto}
                      onChange={(val) => handleItemProductChange(index, val)}
                      placeholder="Elegir..."
                      options={productos.map(p => ({ 
                        value: String(p.id), 
                        label: `${p.nombre} ($${Math.round(p.precio || 0).toLocaleString()}) - ${p.stock || 0} disp.` 
                      }))}
                    />
                  </div>
                  <input type="number" value={item.cantidad} onChange={(e) => handleItemQuantityChange(index, e.target.value)} className="w-16 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                  <button type="button" onClick={() => handleRemoveItem(index)} className="p-3 text-red-400 hover:text-red-500 transition cursor-pointer"><FaTrash className="text-xs" /></button>
                </div>
              ))
            }
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
            {["cita", "catalogo"].map(s => (
              <button key={s} type="button" onClick={() => setFormData(p => ({ ...p, subTipo: s, idReferencia: "", facTotal: "", facConcepto: "" }))} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition ${formData.subTipo === s ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>
                {s === "cita" ? "Citas" : "Servicios"}
              </button>
            ))}
          </div>
          <CustomSelect
            value={formData.idReferencia}
            onChange={(val) => handleChange({ target: { name: "idReferencia", value: val } })}
            placeholder="Seleccionar..."
            options={formData.subTipo === "catalogo" ? SERVICIOS_CATALOGO.map(s => ({ value: s.id, label: s.nombre })) : citasUsuario.map(c => ({ value: String(c.idCita), label: `${new Date(c.citFecha).toLocaleDateString()} — ${c.citMotivo}` }))}
          />
        </div>
      )}

      {/* Totales Resumen */}
      <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 flex justify-between items-center mt-4">
        <div>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Resumen Total</p>
          <p className="text-sm font-bold text-slate-600 truncate max-w-[200px]">{formData.facConcepto || "Esperando datos..."}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-blue-700">${Math.round(Number(formData.facTotal) || 0).toLocaleString()}</p>
          <p className="text-[8px] text-blue-400 uppercase font-bold">IVA Incluido</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => validarPaso1() && setStep(2)}
        className="w-full py-4 bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 cursor-pointer"
      >
        Continuar al Pago
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => setStep(1)} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition cursor-pointer">
          <FaChevronLeft className="text-xs" />
        </button>
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Método de Pago</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { id: "EFECTIVO", label: "Efectivo", icon: FaMoneyBillWave, desc: "Pago en sede", color: "green" },
          { id: "PSE", label: "PSE / Banco", icon: FaUniversity, desc: "Débito en línea", color: "blue" }
        ].map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => setFormData(p => ({ ...p, metodoPago: m.id }))}
            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition text-center group ${formData.metodoPago === m.id ? `bg-${m.color}-50 border-${m.color}-500 shadow-lg shadow-${m.color}-200/50` : "bg-white border-slate-100 hover:border-slate-200"}`}
          >
            <div className={`p-4 rounded-2xl transition ${formData.metodoPago === m.id ? `bg-${m.color}-600 text-white` : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
              <m.icon className="text-xl" />
            </div>
            <div>
              <p className={`font-black text-[11px] uppercase tracking-wider ${formData.metodoPago === m.id ? `text-${m.color}-700` : "text-slate-600"}`}>{m.label}</p>
              <p className="text-[9px] text-slate-400 font-bold">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {formData.metodoPago === "PSE" && (
        <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-in zoom-in-95">
          <div>
            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Banco emisor</label>
            <select
              value={formData.banco}
              onChange={(e) => setFormData(p => ({ ...p, banco: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Elegir banco...</option>
              {BANCOS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Número de cuenta / Celular</label>
            <input
              type="text"
              placeholder={formData.banco === "Nequi" ? "300 000 0000" : "00000000000"}
              value={formData.numeroCuenta}
              onChange={(e) => setFormData(p => ({ ...p, numeroCuenta: e.target.value.replace(/\D/g, "") }))}
              maxLength={formData.banco === "Nequi" ? 10 : 11}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
      )}

      {formData.metodoPago === "EFECTIVO" && (
        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200">
            <FaMoneyBillWave />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Pago Físico</p>
            <p className="text-[9px] text-emerald-600 font-bold">Confirma la recepción del dinero antes de finalizar.</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="w-full py-5 bg-blue-700 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl hover:bg-black transition shadow-xl shadow-blue-700/20 flex items-center justify-center gap-3 cursor-pointer group"
      >
        {guardando ? <FaSpinner className="animate-spin" /> : <><FaFileInvoiceDollar className="text-xl" /> Finalizar y Crear Factura</>}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20">
        <div className="flex justify-between items-center px-10 py-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <FaPlusCircle className="text-xl" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-lg">Nueva Factura</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                Paso {step} de 2 — {step === 1 ? "Insumos y Cliente" : "Selección de Pago"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 text-slate-300 hover:text-slate-600 rounded-2xl transition cursor-pointer">
            <FaTimes />
          </button>
        </div>

        <div className="px-10 pb-10">
          {step === 1 ? renderStep1() : (
            <form onSubmit={handleFinalSubmit}>
              {renderStep2()}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
