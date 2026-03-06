import { useState, useEffect, useRef } from "react";
import { FaBell, FaEnvelopeOpen, FaClock, FaTimes, FaCheckCircle } from "react-icons/fa";
import { obtenerMisNotificaciones, marcarNotificacionLeida } from "../../services/notificacionService";
import { useAuth } from "../../context/auth/AuthContext";

export default function NotificacionBell() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [loading, setLoading] = useState(false);
  const bellRef = useRef(null);

  // Filtrar las que no han sido leídas para el punto rojo
  const hasUnread = notificaciones.some(n => !n.notLeida);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificaciones();
      const interval = setInterval(fetchNotificaciones, 120000); // 2 min
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotificaciones = async () => {
    try {
      const data = await obtenerMisNotificaciones();
      setNotificaciones(data);
    } catch (error) {
      console.error("Error al cargar notificaciones");
    }
  };

  const handleOpenNotif = (notif) => {
    setSelectedNotif(notif);
    setIsOpen(false); // Cerrar el dropdown
  };

  const handleCloseModal = async () => {
    if (selectedNotif && !selectedNotif.notLeida) {
      try {
        // Marcar como leída en el backend
        await marcarNotificacionLeida(selectedNotif.idNotificacion);
        // Actualizar estado local para que el punto rojo desaparezca
        setNotificaciones(prev => 
          prev.map(n => n.idNotificacion === selectedNotif.idNotificacion ? { ...n, notLeida: true } : n)
        );
      } catch (error) {
        console.error("No se pudo marcar como leída");
      }
    }
    setSelectedNotif(null);
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={bellRef}>
      {/* Botón Campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
      >
        <FaBell className="text-xl" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Dropdown de Notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Notificaciones</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <FaTimes className="text-xs" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center">
                <FaEnvelopeOpen className="text-slate-200 text-3xl mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No tienes mensajes nuevos</p>
              </div>
            ) : (
              notificaciones.map((n) => (
                <div 
                  key={n.idNotificacion} 
                  onClick={() => handleOpenNotif(n)}
                  className={`p-4 hover:bg-slate-50 transition cursor-pointer relative ${!n.notLeida ? "bg-blue-50/30" : ""}`}
                >
                  {!n.notLeida && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${n.notLeida ? "bg-slate-100 text-slate-400" : "bg-blue-100 text-blue-600"}`}>
                      <FaBell className="text-xs" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${n.notLeida ? "text-slate-500 font-medium" : "text-slate-900 font-bold"}`}>
                        {n.notTitulo}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {n.notMensaje}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-medium">
                        <FaClock className="text-[9px]" />
                        {new Date(n.notFechaProgramada).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center border-b border-slate-50">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBell className="text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{selectedNotif.notTitulo}</h2>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-1">
                <FaClock /> {new Date(selectedNotif.notFechaProgramada).toLocaleString()}
              </p>
            </div>
            
            <div className="p-8">
              <p className="text-slate-600 leading-relaxed text-center whitespace-pre-wrap">
                {selectedNotif.notMensaje}
              </p>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button
                onClick={handleCloseModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition cursor-pointer shadow-lg shadow-blue-200"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
