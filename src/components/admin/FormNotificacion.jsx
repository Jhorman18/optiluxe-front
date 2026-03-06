import { useState, useEffect } from "react";
import { FaBell, FaPaperPlane, FaUser, FaClock, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { getUsuarios } from "../../services/usuarioService";
import { registrarNotificacion } from "../../services/notificacionService";
import toast from "react-hot-toast";

export default function FormNotificacion({ onSuccess }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [formData, setFormData] = useState({
    notTitulo: "",
    notMensaje: "",
    notCanal: "Email",
    notFechaProgramada: "",
    fkIdUsuario: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsuarios();
        setUsuarios(data);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        toast.error("No se pudieron cargar los usuarios");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fkIdUsuario) return toast.error("Seleccione un usuario");
    
    setEnviando(true);
    try {
      // Ajustar fecha para incluir segundos si es necesario por el backend
      const payload = {
        ...formData,
        notFechaProgramada: new Date(formData.notFechaProgramada).toISOString(),
        notEstado: "Pendiente"
      };
      
      await registrarNotificacion(payload);
      toast.success("Notificación programada con éxito");
      
      // Limpiar formulario
      setFormData({
        notTitulo: "",
        notMensaje: "",
        notCanal: "Email",
        notFechaProgramada: "",
        fkIdUsuario: "",
      });
      
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
          {/* Usuario */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FaUser className="text-slate-400 text-xs" /> Paciente Destinatario
            </label>
            <select
              name="fkIdUsuario"
              value={formData.fkIdUsuario}
              onChange={handleChange}
              disabled={loadingUsers}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              required
            >
              <option value="">{loadingUsers ? "Cargando..." : "Seleccionar paciente..."}</option>
              {usuarios.map((u) => (
                <option key={u.idUsuario} value={u.idUsuario}>
                  {u.usuNombre} {u.usuApellido} ({u.usuDocumento})
                </option>
              ))}
            </select>
          </div>

          {/* Canal */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FaPaperPlane className="text-slate-400 text-xs" /> Canal de Envío
            </label>
            <select
              name="notCanal"
              value={formData.notCanal}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              required
            >
              <option value="Email">Email / Notificación Interna</option>
            </select>
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
          ></textarea>
        </div>

        {/* Fecha Programada */}
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
            <>
              <FaSpinner className="animate-spin" />
              Programando...
            </>
          ) : (
            <>
              <FaCheckCircle />
              Confirmar y Programar
            </>
          )}
        </button>
      </form>
    </div>
  );
}
