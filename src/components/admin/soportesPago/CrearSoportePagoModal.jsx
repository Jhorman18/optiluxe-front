import { useState, useEffect } from "react";
import {
  FaPlusCircle, FaTimes, FaSpinner, FaFileInvoiceDollar, FaUser,
  FaBoxOpen, FaStethoscope, FaPlus, FaTrash,
  FaUniversity, FaMoneyBillWave, FaChevronLeft, FaCalendarAlt, FaCheckCircle,
} from "react-icons/fa";
import * as usuarioService from "../../../services/usuarioService";
import * as productoService from "../../../services/productoService";
import * as servicioService from "../../../services/servicioService";
import { getHorariosOcupados } from "../../../services/citaService";
import toast from "react-hot-toast";
import CustomSelect from "../../ui/CustomSelect";
import Select from "react-select";

// ── Estilos React Select ──────────────────────────────────────────────────────
const rsStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.2)" : "none",
    backgroundColor: "#fff",
    minHeight: "42px",
    "&:hover": { borderColor: "#93c5fd" },
  }),
  menu: (base) => ({ ...base, borderRadius: "0.75rem", boxShadow: "0 4px 24px rgba(148,163,184,0.18)", border: "1px solid #f1f5f9", overflow: "hidden", zIndex: 60 }),
  option: (base, { isSelected, isFocused }) => ({ ...base, backgroundColor: isSelected ? "#eff6ff" : isFocused ? "#f8fafc" : "#fff", color: isSelected ? "#1d4ed8" : "#334155", fontWeight: isSelected ? 600 : 500, fontSize: "0.8rem", cursor: "pointer" }),
  placeholder: (base) => ({ ...base, color: "#94a3b8", fontWeight: 500 }),
  singleValue: (base) => ({ ...base, fontSize: "0.8rem", fontWeight: 600, color: "#1e293b" }),
  input: (base) => ({ ...base, fontSize: "0.8rem" }),
  indicatorSeparator: () => ({ display: "none" }),
};

const BANCOS = ["Bancolombia", "Davivienda", "Banco de Bogotá", "BBVA Colombia", "Nequi", "Banco Popular"];

// ── Lógica de slots ───────────────────────────────────────────────────────────
const ALL_SLOTS = [];
for (let min = 8 * 60; min <= 16 * 60 + 30; min += 30) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  ALL_SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
}
const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const toMinStr = (mins) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
const getSlotsForDuration = (dur) => ALL_SLOTS.filter(s => toMin(s) + dur <= 17 * 60);
const isSlotPast = (slot, fecha) => !fecha ? false : new Date(`${fecha}T${slot}:00`) <= new Date();
const isSlotOccupied = (slot, dur, ranges) => {
  const start = toMin(slot), end = start + dur;
  return ranges.some(({ inicio, fin }) => toMin(inicio) < end && toMin(fin) > start);
};

const TODAY = new Date().toISOString().split("T")[0];
const EMPTY_FORM = { sopTotal: "", sopConcepto: "", fkIdUsuario: "", items: [], servicios: [], metodoPago: "EFECTIVO", banco: "", tipoCuenta: "ahorros", numeroCuenta: "" };

export default function CrearSoportePagoModal({ abierto, guardando, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [catalogoServicios, setCatalogoServicios] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [occupiedByDate, setOccupiedByDate] = useState({});
  const [loadingDates, setLoadingDates] = useState(new Set());

  useEffect(() => {
    if (!abierto) return;
    setStep(1);
    setFormData(EMPTY_FORM);
    setOccupiedByDate({});
    setLoadingData(true);
    Promise.all([
      usuarioService.getUsuarios(),
      productoService.getProductos({ admin: true }),
      servicioService.getServicios(),
    ])
      .then(([u, p, s]) => {
        setUsuarios(u);
        setProductos(p || []);
        setCatalogoServicios((s || []).filter(sv => sv.serEstado === "ACTIVO"));
      })
      .catch(() => toast.error("Error al cargar datos"))
      .finally(() => setLoadingData(false));
  }, [abierto]);

  useEffect(() => {
    const totalProductos = formData.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    const totalServicios = formData.servicios.reduce((acc, s) => acc + (s.precio || 0), 0);
    const total = totalProductos + totalServicios;
    const conceptos = [];
    if (formData.items.length > 0) conceptos.push(`${formData.items.length} producto(s)`);
    if (formData.servicios.length > 0) conceptos.push(`${formData.servicios.length} servicio(s)`);
    setFormData(prev => ({ ...prev, sopTotal: Math.round(total).toString(), sopConcepto: conceptos.join(" + ") }));
  }, [formData.items, formData.servicios]);

  if (!abierto) return null;

  // ── Handlers productos ──────────────────────────────────────────────────────
  const handleAddItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { idProducto: "", cantidad: 1, precio: 0, nombre: "", stock: 0 }] }));
  const handleRemoveItem = (i) => setFormData(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }));
  const handleItemProductChange = (index, productId) => {
    const prod = productos.find(p => String(p.id) === String(productId));
    if (!prod) return;
    const newItems = [...formData.items];
    const stock = prod.stock || 0;
    newItems[index] = { ...newItems[index], idProducto: productId, precio: Number(prod.precio), nombre: prod.nombre, stock, cantidad: Math.min(newItems[index].cantidad, stock || 1) };
    setFormData(prev => ({ ...prev, items: newItems }));
  };
  const handleItemQuantityChange = (index, qty) => {
    const newItems = [...formData.items];
    newItems[index].cantidad = Math.min(Math.max(1, parseInt(qty) || 1), newItems[index].stock || Infinity);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // ── Handlers servicios ──────────────────────────────────────────────────────
  const handleAddServicio = () => setFormData(prev => ({ ...prev, servicios: [...prev.servicios, { idServicio: "", nombre: "", precio: 0, duracion: 30, fecha: "", hora: "" }] }));
  const handleRemoveServicio = (i) => setFormData(prev => ({ ...prev, servicios: prev.servicios.filter((_, idx) => idx !== i) }));
  const handleServicioChange = (index, id) => {
    const serv = catalogoServicios.find(s => String(s.idServicio) === String(id));
    if (!serv) return;
    const newS = [...formData.servicios];
    newS[index] = { ...newS[index], idServicio: serv.idServicio, nombre: serv.serNombre, precio: Number(serv.serPrecio), duracion: serv.serDuracion || 30, hora: "" };
    setFormData(prev => ({ ...prev, servicios: newS }));
  };
  const handleServicioFechaChange = (index, fecha) => {
    const newS = [...formData.servicios];
    newS[index] = { ...newS[index], fecha, hora: "" };
    setFormData(prev => ({ ...prev, servicios: newS }));
    if (!occupiedByDate[fecha] && !loadingDates.has(fecha)) {
      setLoadingDates(prev => new Set(prev).add(fecha));
      getHorariosOcupados(fecha)
        .then(data => setOccupiedByDate(prev => ({ ...prev, [fecha]: Array.isArray(data) ? data : [] })))
        .catch(() => setOccupiedByDate(prev => ({ ...prev, [fecha]: [] })))
        .finally(() => setLoadingDates(prev => { const s = new Set(prev); s.delete(fecha); return s; }));
    }
  };
  const handleServicioHoraChange = (index, hora) => {
    const newS = [...formData.servicios];
    newS[index] = { ...newS[index], hora };
    setFormData(prev => ({ ...prev, servicios: newS }));
  };

  // ── Validaciones ────────────────────────────────────────────────────────────
  const validarPaso1 = () => {
    if (!formData.fkIdUsuario) { toast.error("Selecciona un cliente"); return false; }
    if (formData.items.length === 0 && formData.servicios.length === 0) { toast.error("Agrega al menos un producto o servicio"); return false; }
    if (formData.items.some(i => !i.idProducto)) { toast.error("Completa la selección de productos"); return false; }
    if (formData.servicios.some(s => !s.idServicio)) { toast.error("Completa la selección de servicios"); return false; }
    if (formData.servicios.some(s => !s.fecha)) { toast.error("Selecciona fecha de cada servicio"); return false; }
    if (formData.servicios.some(s => !s.hora)) { toast.error("Selecciona hora de cada servicio"); return false; }
    return true;
  };
  const validarPago = () => {
    if (formData.metodoPago === "PSE") {
      if (!formData.banco || !formData.numeroCuenta) { toast.error("Completa los datos bancarios"); return false; }
      if (formData.banco === "Nequi" && formData.numeroCuenta.length !== 10) { toast.error("Nequi requiere 10 dígitos"); return false; }
    }
    return true;
  };

  const doSubmit = () => {
    const total = parseFloat(formData.sopTotal);
    let condiciones = formData.metodoPago;
    if (formData.metodoPago === "PSE") condiciones = `PSE - ${formData.banco} - ${formData.tipoCuenta.toUpperCase()} - ****${formData.numeroCuenta.slice(-4)}`;
    const payload = { sopTotal: total, sopSubtotal: total, sopConcepto: formData.sopConcepto, sopCondiciones: condiciones, fkIdUsuario: parseInt(formData.fkIdUsuario), sopFecha: new Date().toISOString(), sopEstado: "PAGADA" };
    if (formData.items.length > 0) payload.items = formData.items.map(item => ({ idProducto: parseInt(item.idProducto), cantidad: parseInt(item.cantidad) }));
    if (formData.servicios.length > 0) payload.servicios = formData.servicios.map(s => ({ idServicio: s.idServicio, nombre: s.nombre, precio: s.precio, fecha: s.fecha, hora: s.hora }));
    onSubmit(payload, () => { setFormData(EMPTY_FORM); onClose(); });
  };

  // ── Slot picker ─────────────────────────────────────────────────────────────
  const renderSlotPicker = (serv, index) => {
    if (!serv.idServicio || !serv.fecha) return null;
    const duracion = serv.duracion || 30;
    const isLoadingDate = loadingDates.has(serv.fecha);
    const occupiedFromBackend = occupiedByDate[serv.fecha] || [];
    const occupiedFromForm = formData.servicios
      .filter((s, i) => i !== index && s.fecha === serv.fecha && s.hora)
      .map(s => ({ inicio: s.hora, fin: toMinStr(toMin(s.hora) + (s.duracion || 30)) }));
    const allOccupied = [...occupiedFromBackend, ...occupiedFromForm];
    const slots = getSlotsForDuration(duracion);
    if (isLoadingDate) return <div className="flex items-center gap-2 py-3 text-slate-400 text-xs"><FaSpinner className="animate-spin" /> Consultando disponibilidad...</div>;
    return (
      <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
        {slots.map(slot => {
          const occupied = isSlotOccupied(slot, duracion, allOccupied) || isSlotPast(slot, serv.fecha);
          const selected = serv.hora === slot;
          return (
            <button key={slot} type="button" disabled={occupied} onClick={() => handleServicioHoraChange(index, slot)}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition ${occupied ? "cursor-not-allowed bg-slate-100 text-slate-300 line-through" : selected ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 cursor-pointer"}`}>
              {slot}
            </button>
          );
        })}
      </div>
    );
  };

  // ── Step 1: Productos y Servicios ───────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"><FaUser className="inline mr-1" /> Cliente Destinatario</label>
        <CustomSelect value={formData.fkIdUsuario} onChange={(val) => setFormData(prev => ({ ...prev, fkIdUsuario: val }))} placeholder="Seleccionar Cliente..."
          options={usuarios.map(u => ({ value: String(u.idUsuario), label: `${u.usuNombre} ${u.usuApellido} (${u.usuDocumento})` }))} />
      </div>

      {/* Productos */}
      <div className="space-y-3">
        <div className="flex justify-between items-center bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest"><FaBoxOpen /> Productos</span>
          <button type="button" onClick={handleAddItem} className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition cursor-pointer"><FaPlus /> Añadir</button>
        </div>
        {formData.items.length === 0 ? <p className="text-center text-xs text-slate-400 italic py-2">No hay productos añadidos</p> : (
          <div className="space-y-2">
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="flex-1">
                  <Select value={item.idProducto ? { value: String(item.idProducto), label: `${item.nombre} ($${Math.round(item.precio || 0).toLocaleString()}) - ${item.stock} disp.` } : null}
                    onChange={(opt) => handleItemProductChange(index, opt?.value ?? "")}
                    options={productos.map(p => ({ value: String(p.id), label: `${p.nombre} ($${Math.round(p.precio || 0).toLocaleString()}) - ${p.stock || 0} disp.` }))}
                    placeholder="Elegir producto..." isSearchable noOptionsMessage={() => "Sin resultados"} styles={rsStyles} />
                </div>
                <input type="number" value={item.cantidad} min={1} max={item.stock || undefined} onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                  className="w-16 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center" />
                <button type="button" onClick={() => handleRemoveItem(index)} className="p-2.5 text-red-400 hover:text-red-500 transition cursor-pointer"><FaTrash className="text-xs" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Servicios */}
      <div className="space-y-3">
        <div className="flex justify-between items-center bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest"><FaStethoscope /> Servicios</span>
          <button type="button" onClick={handleAddServicio} className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition cursor-pointer"><FaPlus /> Añadir</button>
        </div>
        {formData.servicios.length === 0 ? <p className="text-center text-xs text-slate-400 italic py-2">No hay servicios añadidos</p> : (
          <div className="space-y-2">
            {formData.servicios.map((serv, index) => (
              <div key={index} className="bg-slate-50 rounded-xl border border-slate-100 p-3 space-y-3">
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <CustomSelect value={serv.idServicio ? String(serv.idServicio) : ""} onChange={(val) => handleServicioChange(index, val)} placeholder={loadingData ? "Cargando servicios..." : "Seleccionar servicio..."}
                      options={catalogoServicios.map(s => ({ value: String(s.idServicio), label: `${s.serNombre}${Number(s.serPrecio) > 0 ? ` ($${Math.round(Number(s.serPrecio)).toLocaleString()})` : " (Gratuito)"} — ${s.serDuracion} min` }))} />
                  </div>
                  <button type="button" onClick={() => handleRemoveServicio(index)} className="p-2.5 text-red-400 hover:text-red-500 transition cursor-pointer"><FaTrash className="text-xs" /></button>
                </div>
                {serv.idServicio && (
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs pointer-events-none" />
                    <input type="date" min={TODAY} value={serv.fecha} onChange={(e) => handleServicioFechaChange(index, e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                  </div>
                )}
                {serv.fecha && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      Horario disponible {serv.hora && <span className="text-blue-600 ml-1">— {serv.hora} seleccionado</span>}
                    </p>
                    {renderSlotPicker(serv, index)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Resumen Total</p>
          <p className="text-sm font-bold text-slate-600 truncate max-w-50">{formData.sopConcepto || "Esperando datos..."}</p>
        </div>
        <p className="text-2xl font-black text-blue-700">${Math.round(Number(formData.sopTotal) || 0).toLocaleString()}</p>
      </div>

      <button type="button" onClick={() => validarPaso1() && setStep(2)}
        className="w-full py-4 bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 cursor-pointer">
        Continuar al Pago
      </button>
    </div>
  );

  // ── Step 2: Método de pago ──────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setStep(1)} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition cursor-pointer"><FaChevronLeft className="text-xs" /></button>
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Método de Pago</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { id: "EFECTIVO", label: "Efectivo", icon: FaMoneyBillWave, desc: "Pago en sede", color: "green" },
          { id: "PSE", label: "PSE / Banco", icon: FaUniversity, desc: "Débito en línea", color: "blue" },
        ].map(m => (
          <button key={m.id} type="button" onClick={() => setFormData(p => ({ ...p, metodoPago: m.id }))}
            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition text-center group ${formData.metodoPago === m.id ? `bg-${m.color}-50 border-${m.color}-500 shadow-lg shadow-${m.color}-200/50` : "bg-white border-slate-100 hover:border-slate-200"}`}>
            <div className={`p-4 rounded-2xl transition ${formData.metodoPago === m.id ? `bg-${m.color}-600 text-white` : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}><m.icon className="text-xl" /></div>
            <div>
              <p className={`font-black text-[11px] uppercase tracking-wider ${formData.metodoPago === m.id ? `text-${m.color}-700` : "text-slate-600"}`}>{m.label}</p>
              <p className="text-[9px] text-slate-400 font-bold">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {formData.metodoPago === "PSE" && (
        <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div>
            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Banco emisor</label>
            <select value={formData.banco} onChange={(e) => setFormData(p => ({ ...p, banco: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition">
              <option value="">Elegir banco...</option>
              {BANCOS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Número de cuenta / Celular</label>
            <input type="text" placeholder={formData.banco === "Nequi" ? "300 000 0000" : "00000000000"} value={formData.numeroCuenta}
              onChange={(e) => setFormData(p => ({ ...p, numeroCuenta: e.target.value.replace(/\D/g, "") }))}
              maxLength={formData.banco === "Nequi" ? 10 : 11}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
        </div>
      )}

      {formData.metodoPago === "EFECTIVO" && (
        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200"><FaMoneyBillWave /></div>
          <div>
            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Pago Físico</p>
            <p className="text-[9px] text-emerald-600 font-bold">Confirma la recepción del dinero antes de finalizar.</p>
          </div>
        </div>
      )}

      <button type="button" onClick={() => validarPago() && setStep(3)}
        className="w-full py-5 bg-blue-700 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl hover:bg-blue-800 transition shadow-xl shadow-blue-700/20 flex items-center justify-center gap-3 cursor-pointer">
        <FaFileInvoiceDollar className="text-xl" /> Ver Pre-Recibo
      </button>
    </div>
  );

  // ── Step 3: Pre-recibo de confirmación ──────────────────────────────────────
  const renderStep3 = () => {
    const cliente = usuarios.find(u => String(u.idUsuario) === String(formData.fkIdUsuario));
    const fechaHoy = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
    const horaHoy = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    const ref = `OP-${Date.now().toString().slice(-6)}`;
    const total = Math.round(Number(formData.sopTotal) || 0);
    const condicionesTexto = formData.metodoPago === "PSE"
      ? `PSE — ${formData.banco} ****${formData.numeroCuenta.slice(-4)}`
      : "Efectivo";

    return (
      <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setStep(2)} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition cursor-pointer"><FaChevronLeft className="text-xs" /></button>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Confirmar Venta</span>
        </div>

        {/* Pre-recibo */}
        <div className="bg-slate-100 rounded-2xl p-3">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">

            {/* Header oscuro */}
            <div className="bg-slate-900 text-white text-center px-6 py-5">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">OptiLuxe — Sistema de Gestión Óptica</p>
              <p className="font-black text-base tracking-[0.2em] mb-3">PRE-RECIBO</p>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{fechaHoy} {horaHoy}</span>
                <span className="font-bold text-slate-300">{ref}</span>
              </div>
            </div>

            {/* Borde perforado superior */}
            <div className="flex items-center px-5 py-2 border-b border-dashed border-slate-200">
              <div className="w-2 h-2 rounded-full bg-slate-100 -ml-7 mr-2 shrink-0" />
              <div className="flex-1 border-t border-dotted border-slate-300" />
              <div className="w-2 h-2 rounded-full bg-slate-100 -mr-7 ml-2 shrink-0" />
            </div>

            {/* Cuerpo */}
            <div className="px-6 py-4 space-y-4 font-mono text-xs">

              {/* Cliente */}
              <div className="pb-3 border-b border-dashed border-slate-200">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Cliente</p>
                <p className="font-bold text-slate-800">{cliente ? `${cliente.usuNombre} ${cliente.usuApellido}` : "—"}</p>
                {cliente?.usuDocumento && <p className="text-slate-500">Doc: {cliente.usuDocumento}</p>}
              </div>

              {/* Productos */}
              {formData.items.length > 0 && (
                <div className="pb-3 border-b border-dashed border-slate-200">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Productos</p>
                  <div className="space-y-1.5">
                    {formData.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-slate-700 truncate max-w-[55%]">{item.nombre} <span className="text-slate-400">×{item.cantidad}</span></span>
                        <span className="font-bold text-slate-800">${(item.precio * item.cantidad).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Servicios */}
              {formData.servicios.length > 0 && (
                <div className="pb-3 border-b border-dashed border-slate-200">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Servicios</p>
                  <div className="space-y-2">
                    {formData.servicios.map((s, i) => (
                      <div key={i}>
                        <div className="flex justify-between">
                          <span className="text-slate-700 truncate max-w-[55%]">{s.nombre}</span>
                          <span className="font-bold text-slate-800">{s.precio > 0 ? `$${s.precio.toLocaleString()}` : "Gratuito"}</span>
                        </div>
                        <p className="text-slate-400 text-[10px]">📅 {s.fecha} &nbsp;🕐 {s.hora}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Método de pago */}
              <div className="pb-3 border-b border-dashed border-slate-200">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Método de pago</p>
                <p className="font-bold text-slate-700">{condicionesTexto}</p>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-1">
                <p className="font-black text-slate-700 uppercase tracking-widest text-[11px]">Total</p>
                <p className="font-black text-2xl text-blue-700">${total.toLocaleString()}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 text-center py-3 px-6">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">¡Gracias por su compra!</p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button type="button" onClick={() => setStep(2)}
            className="flex-none px-6 py-3.5 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition cursor-pointer">
            Volver
          </button>
          <button type="button" onClick={doSubmit} disabled={guardando}
            className="flex-1 py-3.5 bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition shadow-lg shadow-blue-700/20 flex items-center justify-center gap-2 cursor-pointer">
            {guardando ? <FaSpinner className="animate-spin" /> : <><FaCheckCircle /> Confirmar y Crear Soporte</>}
          </button>
        </div>
      </div>
    );
  };

  // ── Subtítulo del header según paso ─────────────────────────────────────────
  const subtitulos = { 1: "Insumos y Cliente", 2: "Selección de Pago", 3: "Confirmar Venta" };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl border border-white/20 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-10 pt-8 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><FaPlusCircle className="text-xl" /></div>
            <div>
              <h2 className="font-black text-slate-800 text-lg">Nueva venta</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                Paso {step} de 3 — {subtitulos[step]}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 text-slate-300 hover:text-slate-600 rounded-2xl transition cursor-pointer"><FaTimes /></button>
        </div>

        <div className="px-10 pb-10 overflow-y-auto">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
}
