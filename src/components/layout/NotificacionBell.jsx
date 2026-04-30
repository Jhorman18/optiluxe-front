import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaEnvelopeOpen, FaClock, FaTimes, FaCheck } from "react-icons/fa";
import { obtenerMisNotificaciones, marcarNotificacionLeida } from "../../services/notificacionService";
import { useAuth } from "../../context/auth/AuthContext";

const PREVIEW_COUNT = 5;

function NotifRow({ n, onClick }) {
  return (
    <div
      onClick={() => onClick(n)}
      className={`p-4 hover:bg-slate-50 transition cursor-pointer relative ${!n.notLeida ? "bg-blue-50/40" : ""}`}
    >
      {!n.notLeida && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full" />
      )}
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${n.notLeida ? "bg-slate-100 text-slate-400" : "bg-blue-100 text-blue-600"}`}>
          <FaBell className="text-xs" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${n.notLeida ? "text-slate-500 font-medium" : "text-slate-900 font-bold"}`}>
            {n.notTitulo}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.notMensaje}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-medium">
            <FaClock className="text-[9px]" />
            {new Date(n.notFechaProgramada).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificacionBell() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const bellRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notificaciones.filter(n => !n.notLeida).length;
  const preview = notificaciones.slice(0, PREVIEW_COUNT);
  const hasMore = notificaciones.length > PREVIEW_COUNT;

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 120000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotificaciones = async () => {
    try {
      const data = await obtenerMisNotificaciones();
      setNotificaciones(data);
    } catch {
      console.error("Error al cargar notificaciones");
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notificaciones.filter(n => !n.notLeida);
    if (!unread.length) return;
    try {
      await Promise.all(unread.map(n => marcarNotificacionLeida(n.idNotificacion)));
      setNotificaciones(prev => prev.map(n => ({ ...n, notLeida: true })));
    } catch {
      console.error("Error al marcar como leídas");
    }
  };

  const handleOpenNotif = (notif) => {
    setSelectedNotif(notif);
    setIsOpen(false);
  };

  const handleCloseDetail = async () => {
    if (selectedNotif && !selectedNotif.notLeida) {
      try {
        await marcarNotificacionLeida(selectedNotif.idNotificacion);
        setNotificaciones(prev =>
          prev.map(n => n.idNotificacion === selectedNotif.idNotificacion ? { ...n, notLeida: true } : n)
        );
      } catch {
        console.error("No se pudo marcar como leída");
      }
    }
    setSelectedNotif(null);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={bellRef}>
      {/* Botón campana con badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown — últimas 5 */}
      {isOpen && (
        <div className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
            <h3 className="font-bold text-slate-800 text-sm">Notificaciones</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer transition whitespace-nowrap"
                >
                  <FaCheck className="text-[9px]" />
                  Marcar leídas
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center">
                <FaEnvelopeOpen className="text-slate-200 text-3xl mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No tienes mensajes nuevos</p>
              </div>
            ) : (
              <>
                {preview.map(n => (
                  <NotifRow key={n.idNotificacion} n={n} onClick={handleOpenNotif} />
                ))}
                {hasMore && (
                  <div className="p-3 text-center border-t border-slate-100">
                    <button
                      onClick={() => { navigate("/mis-notificaciones"); setIsOpen(false); }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition"
                    >
                      Ver más ({notificaciones.length - PREVIEW_COUNT} más)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}


      {/* Modal — detalle de una notificación */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-black/50 z-110 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
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
            <div className="p-6 bg-slate-50">
              <button
                onClick={handleCloseDetail}
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
