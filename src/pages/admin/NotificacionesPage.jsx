import { useState, useEffect } from "react";
import { FaBell, FaHistory, FaPlus, FaCheckCircle, FaClock, FaExclamationCircle, FaTrashAlt, FaSearch } from "react-icons/fa";
import FormNotificacion from "../../components/admin/FormNotificacion";
import { obtenerNotificaciones, eliminarNotificacion } from "../../services/notificacionService";
import toast from "react-hot-toast";

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await obtenerNotificaciones();
      setNotificaciones(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar historial de notificaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta notificación programada?")) return;
    try {
      await eliminarNotificacion(id);
      toast.success("Notificación eliminada");
      fetchData();
    } catch (error) {
      toast.error(error.message || "No se pudo eliminar");
    }
  };

  const filteredNotifs = notificaciones.filter(n => 
    n.notTitulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.notMensaje.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Notificaciones <FaBell className="text-blue-500 text-2xl" />
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Gestiona la comunicación y recordatorios con tus pacientes
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition cursor-pointer ${
            showForm 
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
          }`}
        >
          {showForm ? "Ver Historial" : <><FaPlus /> Nueva Notificación</>}
        </button>
      </div>

      {showForm ? (
        <div className="animate-in fade-in duration-500 max-w-3xl">
          <FormNotificacion onSuccess={() => { setShowForm(false); fetchData(); }} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Barra de Búsqueda */}
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por título o contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm"
            />
          </div>

          {/* Listado */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
              <FaHistory className="text-slate-400" />
              <h3 className="font-bold text-slate-700">Historial de Envío</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Paciente</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Contenido</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Programación</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Canal / Estado</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                        Cargando historial...
                      </td>
                    </tr>
                  ) : filteredNotifs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                        No se encontraron notificaciones.
                      </td>
                    </tr>
                  ) : (
                    filteredNotifs.map((notif) => (
                      <tr key={notif.idNotificacion} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{notif.usuario?.usuNombre} {notif.usuario?.usuApellido}</p>
                          <p className="text-[11px] text-slate-500">{notif.usuario?.usuCorreo}</p>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="font-bold text-sm text-slate-800 truncate">{notif.notTitulo}</p>
                          <p className="text-xs text-slate-500 line-clamp-2">{notif.notMensaje}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium text-sm">
                            <FaClock className="text-slate-300 text-xs" />
                            {new Date(notif.notFechaProgramada).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{notif.notCanal}</span>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider w-fit ${
                              notif.notEstado === "Enviada" ? "bg-emerald-100 text-emerald-700" :
                              notif.notEstado === "Pendiente" ? "bg-blue-100 text-blue-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {notif.notEstado === "Enviada" && <FaCheckCircle className="text-[9px]" />}
                              {notif.notEstado === "Pendiente" && <FaClock className="text-[9px]" />}
                              {notif.notEstado === "Fallida" && <FaExclamationCircle className="text-[9px]" />}
                              {notif.notEstado}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {notif.notEstado === "Pendiente" && (
                            <button 
                              onClick={() => handleDelete(notif.idNotificacion)}
                              className="text-slate-300 hover:text-red-500 transition p-2 cursor-pointer"
                              title="Cancelar programación"
                            >
                              <FaTrashAlt />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
