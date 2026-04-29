import { useState, useEffect } from "react";
import { FaBell, FaPaperPlane, FaUser, FaClock, FaCheckCircle, FaSpinner } from "react-icons/fa";
import Select from "react-select";
import { getUsuarios } from "../../services/usuarioService";
import { registrarNotificacion } from "../../services/notificacionService";
import toast from "react-hot-toast";
import CustomSelect from "../ui/CustomSelect";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#f8fafc",
    borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
    borderRadius: "0.75rem",
    padding: "0.125rem 0.25rem",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,0.2)" : "none",
    "&:hover": { borderColor: "#3b82f6" },
    minHeight: "48px",
    fontSize: "0.875rem",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? "#eff6ff" : "white",
    color: state.isSelected ? "white" : "#1e293b",
    fontSize: "0.875rem",
    cursor: "pointer",
  }),
  placeholder: (base) => ({ ...base, color: "#94a3b8", fontSize: "0.875rem" }),
  input: (base) => ({ ...base, fontSize: "0.875rem" }),
  multiValue: (base) => ({ ...base, backgroundColor: "#dbeafe", borderRadius: "0.5rem" }),
  multiValueLabel: (base) => ({ ...base, color: "#1d4ed8", fontSize: "0.75rem", fontWeight: "600" }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#1d4ed8",
    borderRadius: "0 0.5rem 0.5rem 0",
    "&:hover": { backgroundColor: "#bfdbfe", color: "#1e40af" },
  }),
  noOptionsMessage: (base) => ({ ...base, fontSize: "0.875rem", color: "#94a3b8" }),
};

export default function FormNotificacion({ onSuccess }) {
  const [usuariosOpciones, setUsuariosOpciones] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [destinatarios, setDestinatarios] = useState([]);
  const [formData, setFormData] = useState({
    notTitulo: "",
    notMensaje: "",
    notCanal: "Email",
    notFechaProgramada: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsuarios();
        setUsuariosOpciones(
          data.map(u => ({
            value: u.idUsuario,
            label: `${u.usuNombre} ${u.usuApellido}`,
            sublabel: u.usuDocumento,
          }))
        );
      } catch {
        toast.error("No se pudieron cargar los usuarios");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destinatarios.length) return toast.error("Seleccione al menos un destinatario");

    setEnviando(true);
    try {
      const fecha = new Date(formData.notFechaProgramada).toISOString();
      await Promise.all(
        destinatarios.map(d =>
          registrarNotificacion({
            ...formData,
            notFechaProgramada: fecha,
            notEstado: "Pendiente",
            fkIdUsuario: d.value,
          })
        )
      );

      const plural = destinatarios.length > 1
        ? `${destinatarios.length} notificaciones programadas`
        : "Notificación programada";
      toast.success(`${plural} con éxito`);

      setFormData({ notTitulo: "", notMensaje: "", notCanal: "Email", notFechaProgramada: "" });
      setDestinatarios([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || "Error al programar notificación");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
          <FaBell />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Programar Notificación</h2>
          <p className="text-sm text-slate-500">Envía mensajes personalizados a tus pacientes</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Destinatarios */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FaUser className="text-slate-400 text-xs" /> Pacientes Destinatarios
            </label>
            <Select
              isMulti
              isLoading={loadingUsers}
              options={usuariosOpciones}
              value={destinatarios}
              onChange={setDestinatarios}
              placeholder="Buscar y seleccionar pacientes..."
              noOptionsMessage={() => "Sin resultados"}
              loadingMessage={() => "Cargando..."}
              styles={selectStyles}
              formatOptionLabel={opt => (
                <div>
                  <span className="font-medium text-slate-800">{opt.label}</span>
                  {opt.sublabel && (
                    <span className="ml-2 text-xs text-slate-400">{opt.sublabel}</span>
                  )}
                </div>
              )}
              filterOption={(opt, input) => {
                const search = input.toLowerCase();
                return (
                  opt.label.toLowerCase().includes(search) ||
                  (opt.data.sublabel || "").toLowerCase().includes(search)
                );
              }}
            />
          </div>

          {/* Canal */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FaPaperPlane className="text-slate-400 text-xs" /> Canal de Envío
            </label>
            <CustomSelect
              value={formData.notCanal}
              onChange={(val) => handleChange({ target: { name: "notCanal", value: val } })}
              options={[{ value: "Email", label: "Email / Notificación Interna" }]}
              required={true}
            />
          </div>
        </div>

        {/* Título */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Título del Mensaje</label>
          <input
            type="text"
            name="notTitulo"
            value={formData.notTitulo}
            onChange={handleChange}
            placeholder="Ej: Recordatorio de Cita"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            required
          />
        </div>

        {/* Mensaje */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Cuerpo de la Notificación</label>
          <textarea
            name="notMensaje"
            value={formData.notMensaje}
            onChange={handleChange}
            rows="4"
            placeholder="Escribe el mensaje aquí..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
            required
          />
        </div>

        {/* Fecha */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FaClock className="text-slate-400 text-xs" /> Fecha y Hora de Envío
          </label>
          <input
            type="datetime-local"
            name="notFechaProgramada"
            value={formData.notFechaProgramada}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            required
          />
          <p className="text-[11px] text-slate-400 ml-1 italic">
            * El sistema enviará el mensaje automáticamente en el horario seleccionado.
          </p>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 cursor-pointer text-base"
        >
          {enviando ? (
            <><FaSpinner className="animate-spin" /> Programando...</>
          ) : (
            <><FaCheckCircle /> Confirmar y Programar</>
          )}
        </button>
      </form>
    </div>
  );
}
