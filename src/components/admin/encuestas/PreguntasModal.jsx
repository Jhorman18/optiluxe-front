import { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaSpinner, FaQuestionCircle, FaToggleOn, FaToggleOff, FaStar, FaCheckCircle, FaAlignLeft, FaListUl } from "react-icons/fa";
import * as encuestaService from "../../../services/encuestaService";
import toast from "react-hot-toast";
import CustomSelect from "../../ui/CustomSelect";

const TIPOS = [
  { value: "estrellas", label: "Estrellas", icon: <FaStar className="text-amber-400" /> },
  { value: "si_no", label: "Sí / No", icon: <FaCheckCircle className="text-green-500" /> },
  { value: "seleccion", label: "Selección", icon: <FaListUl className="text-blue-500" /> },
  { value: "texto", label: "Texto libre", icon: <FaAlignLeft className="text-slate-500" /> },
];

const CATEGORIAS = [
  { value: "cita", label: "Cita Médica" },
  { value: "compra", label: "Compra / Venta" },
];

export default function PreguntasModal({ abierto, onClose }) {
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creando, setCreando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [form, setForm] = useState({ preTexto: "", preTipo: "estrellas", preCategoria: "cita" });

  const fetchPreguntas = async () => {
    try {
      setLoading(true);
      const data = await encuestaService.getPreguntasAdmin();
      setPreguntas(data);
    } catch {
      toast.error("Error al cargar las preguntas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (abierto) fetchPreguntas();
  }, [abierto]);

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!form.preTexto.trim()) {
      toast.error("El texto de la pregunta es obligatorio.");
      return;
    }
    try {
      setCreando(true);
      const nueva = await encuestaService.crearPregunta(form);
      setPreguntas((prev) => [...prev, nueva]);
      setForm({ preTexto: "", preTipo: "estrellas", preCategoria: "cita" });
      setMostrarForm(false);
      toast.success("Pregunta creada correctamente");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error al crear pregunta");
    } finally {
      setCreando(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const actualizada = await encuestaService.togglePregunta(id);
      setPreguntas((prev) =>
        prev.map((p) => (p.idPregunta === id ? actualizada : p))
      );
      toast.success(actualizada.preActiva ? "Pregunta activada" : "Pregunta desactivada");
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  if (!abierto) return null;

  const tipoIcon = (tipo) => TIPOS.find((t) => t.value === tipo)?.icon || null;
  const tipoLabel = (tipo) => TIPOS.find((t) => t.value === tipo)?.label || tipo;
  const catLabel = (cat) => CATEGORIAS.find((c) => c.value === cat)?.label || cat;

  const preguntasCita = preguntas.filter((p) => p.preCategoria === "cita");
  const preguntasCompra = preguntas.filter((p) => p.preCategoria === "compra");

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-blue-600 px-8 py-7 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/5">
              <FaQuestionCircle />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase">Gestión de Preguntas</h2>
              <p className="text-[10px] text-blue-200 font-mono tracking-[0.2em] opacity-80 uppercase">Catálogo de encuestas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-full transition cursor-pointer group">
            <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FaSpinner className="text-4xl animate-spin mb-4" />
              <p className="font-bold">Cargando preguntas...</p>
            </div>
          ) : (
            <>
              {/* Sección: Preguntas de Cita */}
              <PreguntaSeccion
                titulo="Preguntas para Citas"
                preguntas={preguntasCita}
                tipoIcon={tipoIcon}
                tipoLabel={tipoLabel}
                onToggle={handleToggle}
              />

              {/* Sección: Preguntas de Compra */}
              <PreguntaSeccion
                titulo="Preguntas para Compras"
                preguntas={preguntasCompra}
                tipoIcon={tipoIcon}
                tipoLabel={tipoLabel}
                onToggle={handleToggle}
              />

              {/* Formulario de nueva pregunta */}
              {mostrarForm && (
                <form onSubmit={handleCrear} className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-sm space-y-5 animate-in slide-in-from-top-2 duration-200">
                  <p className="font-black text-slate-700 uppercase tracking-widest text-[10px]">Nueva Pregunta</p>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5">Texto de la pregunta</label>
                    <input
                      type="text"
                      placeholder="Ej: ¿Cómo calificarías tu experiencia?"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
                      value={form.preTexto}
                      onChange={(e) => setForm({ ...form, preTexto: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1.5">Tipo de respuesta</label>
                      <CustomSelect
                        value={form.preTipo}
                        onChange={(val) => setForm({ ...form, preTipo: val })}
                        options={TIPOS.map((t) => ({ value: t.value, label: t.label }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1.5">Categoría</label>
                      <CustomSelect
                        value={form.preCategoria}
                        onChange={(val) => setForm({ ...form, preCategoria: val })}
                        options={CATEGORIAS.map((c) => ({ value: c.value, label: c.label }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setMostrarForm(false)}
                      className="px-6 py-3 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creando}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      {creando ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                      Guardar Pregunta
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          {!mostrarForm && (
            <button
              onClick={() => setMostrarForm(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 cursor-pointer active:scale-95"
            >
              <FaPlus /> Nueva Pregunta
            </button>
          )}
          <button
            onClick={onClose}
            className="px-10 py-3.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition shadow-2xl shadow-blue-600/40 cursor-pointer active:scale-95 ml-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function PreguntaSeccion({ titulo, preguntas, tipoIcon, tipoLabel, onToggle }) {
  if (preguntas.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[9px] ml-2">
        <FaQuestionCircle className="text-blue-500" /> {titulo}
        <div className="h-[1px] flex-1 bg-slate-200 ml-2" />
        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black">{preguntas.length}</span>
      </div>
      <div className="space-y-2">
        {preguntas.map((p, idx) => (
          <div
            key={p.idPregunta}
            className={`bg-white rounded-2xl p-5 border shadow-sm transition-all group flex items-center gap-4 ${
              p.preActiva
                ? "border-slate-100 hover:border-blue-100"
                : "border-red-100 bg-red-50/30 opacity-60"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-sm shrink-0 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold leading-tight ${p.preActiva ? "text-slate-700" : "text-slate-400 line-through"}`}>
                {p.preTexto}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  {tipoIcon(p.preTipo)} {tipoLabel(p.preTipo)}
                </span>
              </div>
            </div>
            <button
              onClick={() => onToggle(p.idPregunta)}
              className="p-2 cursor-pointer hover:scale-110 transition-transform"
              title={p.preActiva ? "Desactivar pregunta" : "Activar pregunta"}
            >
              {p.preActiva ? (
                <FaToggleOn className="text-3xl text-blue-500" />
              ) : (
                <FaToggleOff className="text-3xl text-slate-300" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
