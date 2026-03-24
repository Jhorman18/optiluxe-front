import { useState, useEffect } from "react";
import { FaPlusCircle, FaTimes, FaSpinner, FaFileInvoiceDollar, FaUser, FaBoxOpen, FaClipboardList, FaStethoscope } from "react-icons/fa";
import * as usuarioService from "../../../services/usuarioService";
import * as productoService from "../../../services/productoService";
import * as citaService from "../../../services/citaService";
import toast from "react-hot-toast";

const SERVICIOS_CATALOGO = [
  { id: "S1", nombre: "Examen Visual Completo", precio: 80000, descripcion: "Evaluación exhaustiva de salud visual" },
  { id: "S2", nombre: "Renovación de Fórmula", precio: 60000, descripcion: "Actualización de prescripción óptica" },
  { id: "S3", nombre: "Adaptación de Lentes de Contacto", precio: 100000, descripcion: "Prueba y ajuste de lentes de contacto" },
  { id: "S4", nombre: "Selección y Ajuste de Monturas", precio: 0, descripcion: "Asesoría personalizada gratuita" },
];

export default function CrearFacturaModal({ abierto, guardando, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    facTotal: "",
    facConcepto: "",
    facCondiciones: "Efectivo",
    fkIdUsuario: "",
    tipoVenta: "producto",
    idReferencia: "",
    subTipo: "cita"
  });

  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [citasUsuario, setCitasUsuario] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (abierto) {
      setLoadingData(true);
      Promise.all([
        usuarioService.getUsuarios(),
        productoService.getProductos()
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
          if (filtradas.length === 0) {
            toast.error("Este usuario no tiene citas agendadas");
          }
        })
        .catch(() => toast.error("Error al cargar citas"));
    } else {
      setCitasUsuario([]);
    }
  }, [formData.fkIdUsuario, formData.tipoVenta, formData.subTipo]);

  if (!abierto) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "idReferencia" && formData.tipoVenta === "producto") {
      const prod = productos.find(p => String(p.id) === String(value));
      if (prod) {
        setFormData(prev => ({
          ...prev,
          idReferencia: value,
          facTotal: Number(prod.precio),
          facConcepto: `Venta de producto: ${prod.nombre}`
        }));
        return;
      }
    }

    if (name === "idReferencia" && formData.tipoVenta === "cita") {
      if (formData.subTipo === "catalogo") {
        const serv = SERVICIOS_CATALOGO.find(s => s.id === value);
        if (serv) {
          setFormData(prev => ({
            ...prev,
            idReferencia: value,
            facTotal: serv.precio,
            facConcepto: serv.nombre
          }));
          return;
        }
      } else {
        const cita = citasUsuario.find(c => String(c.idCita) === String(value));
        if (cita) {
          setFormData(prev => ({
            ...prev,
            idReferencia: value,
            facTotal: 50000,
            facConcepto: `Servicio de cita: ${cita.citMotivo}`
          }));
          return;
        }
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.fkIdUsuario) return toast.error("Selecciona un cliente");
    if (formData.facTotal === "" || isNaN(formData.facTotal)) return toast.error("Ingresa un monto válido");

    const total = parseFloat(formData.facTotal);
    const subtotal = total / 1.19;
    const iva = total - subtotal;

    const payload = {
      facTotal: total,
      facSubtotal: subtotal,
      facIva: iva,
      facConcepto: formData.facConcepto,
      facCondiciones: formData.facCondiciones,
      fkIdUsuario: parseInt(formData.fkIdUsuario),
      facFecha: new Date().toISOString(),
      facEstado: "PAGADA",
    };

    if (formData.tipoVenta === "cita" && formData.subTipo === "cita" && formData.idReferencia) {
      payload.fkIdCita = parseInt(formData.idReferencia);
    } else if (formData.tipoVenta === "producto" && formData.idReferencia) {
      payload.fkIdProducto = parseInt(formData.idReferencia);
    }

    onSubmit(payload, () => setFormData({
      facTotal: "",
      facConcepto: "",
      facCondiciones: "Efectivo",
      fkIdUsuario: "",
      tipoVenta: "producto",
      idReferencia: "",
      subTipo: "cita"
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3 text-blue-600">
            <FaPlusCircle className="text-xl" />
            <h2 className="font-extrabold text-slate-800 tracking-tight">Crear Nueva Factura</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition cursor-pointer">
            <FaTimes className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Selección de Cliente */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex justify-between">
              <span><FaUser className="inline mr-1" /> Cliente Destinatario</span>
              {loadingData && <FaSpinner className="animate-spin text-blue-500" />}
            </label>
            <select
              required
              name="fkIdUsuario"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-bold"
              value={formData.fkIdUsuario}
              onChange={handleChange}
            >
              <option value="">Seleccionar Cliente...</option>
              {usuarios.map(u => (
                <option key={u.idUsuario} value={u.idUsuario}>
                  {u.usuNombre} {u.usuApellido} ({u.usuDocumento})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Venta Principal */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, tipoVenta: "producto", idReferencia: "", facTotal: "", facConcepto: "" }))}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition font-black text-[10px] uppercase tracking-wider ${formData.tipoVenta === "producto"
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-500"
                }`}
            >
              <FaBoxOpen className="text-sm" /> Productos
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, tipoVenta: "cita", idReferencia: "", facTotal: "", facConcepto: "" }))}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition font-black text-[10px] uppercase tracking-wider ${formData.tipoVenta === "cita"
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-500"
                }`}
            >
              <FaStethoscope className="text-sm" /> Servicios / Citas
            </button>
          </div>

          {/* Sub-tabs para Servicios */}
          {formData.tipoVenta === "cita" && (
            <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-top-1">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, subTipo: "cita", idReferencia: "", facTotal: "", facConcepto: "" }))}
                className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition ${formData.subTipo === "cita" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                Citas Pendientes
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, subTipo: "catalogo", idReferencia: "", facTotal: "", facConcepto: "" }))}
                className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition ${formData.subTipo === "catalogo" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                Catálogo de Servicios
              </button>
            </div>
          )}

          {/* Selector de Item Dinámico */}
          <div className="animate-in slide-in-from-top-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              {formData.tipoVenta === "producto" ? "Lista de Productos Disponibles" :
                formData.subTipo === "cita" ? "Citas Activas del Usuario" : "Servicios Clínicos Estándar"}
            </label>
            <select
              name="idReferencia"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-bold text-slate-700"
              value={formData.idReferencia}
              onChange={handleChange}
            >
              <option value="">Seleccionar {formData.tipoVenta === "producto" ? "Producto" : "Servicio"}...</option>
              {formData.tipoVenta === "producto" ? (
                productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — ${Math.round(p.precio).toLocaleString()}
                  </option>
                ))
              ) : formData.subTipo === "catalogo" ? (
                SERVICIOS_CATALOGO.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} — {s.precio > 0 ? `$${s.precio.toLocaleString()}` : 'GRATUITO'}
                  </option>
                ))
              ) : (
                citasUsuario.map(c => (
                  <option key={c.idCita} value={c.idCita}>
                    {new Date(c.citFecha).toLocaleDateString()} — {c.citMotivo}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="relative">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Total a Pagar (Incl. IVA)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-blue-400 text-xl">$</span>
                <input
                  required
                  type="number"
                  name="facTotal"
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition text-2xl font-black text-blue-700 disabled:opacity-75"
                  value={formData.facTotal}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Concepto de la Factura</label>
            <textarea
              required
              name="facConcepto"
              rows={2}
              placeholder="Descripción detallada de la venta o servicio..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-bold text-slate-600"
              value={formData.facConcepto}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-4 bg-slate-100 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition cursor-pointer active:scale-95"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={guardando || loadingData}
              className="flex-1 px-4 py-4 bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer group active:scale-95"
            >
              {guardando ? <FaSpinner className="animate-spin" /> : <><FaFileInvoiceDollar className="text-xl" /> Crear Factura</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
