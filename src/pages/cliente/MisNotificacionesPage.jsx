import { useState, useEffect } from "react";
import { FaBell, FaClock, FaCheck, FaEnvelopeOpen } from "react-icons/fa";
import { obtenerMisNotificaciones, marcarNotificacionLeida } from "../../services/notificacionService";
import HeaderHome from "../../components/home/HeaderHome";
import Footer from "../../components/layout/Footer";

export default function MisNotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await obtenerMisNotificaciones();
      setNotificaciones(data);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await marcarNotificacionLeida(id);
      setNotificaciones(prev =>
        prev.map(n => n.idNotificacion === id ? { ...n, notLeida: true } : n)
      );
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notificaciones.filter(n => !n.notLeida);
    if (!unread.length) return;
    try {
      await Promise.all(unread.map(n => marcarNotificacionLeida(n.idNotificacion)));
      setNotificaciones(prev => prev.map(n => ({ ...n, notLeida: true })));
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };

  const openDetail = (notif) => {
    setSelectedNotif(notif);
    if (!notif.notLeida) {
      handleMarkAsRead(notif.idNotificacion);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <HeaderHome />
      
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-10">
        <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200 shrink-0">
                <FaBell className="text-white text-base md:text-lg" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Mis Notificaciones</h1>
            </div>
            <p className="text-sm md:text-base text-slate-500 font-medium">Mantente al tanto de tus citas, pedidos y promociones.</p>
          </div>
          
          {notificaciones.some(n => !n.notLeida) && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 font-bold text-sm rounded-xl transition cursor-pointer shadow-sm"
            >
              <FaCheck className="text-xs" />
              Marcar todas como leídas
            </button>
          )}
        </header>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaEnvelopeOpen className="text-4xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No tienes notificaciones</h2>
            <p className="text-slate-500">Te avisaremos cuando haya novedades importantes para ti.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {notificaciones.map((n) => (
              <div
                key={n.idNotificacion}
                onClick={() => openDetail(n)}
                className={`group bg-white p-5 rounded-2xl border transition cursor-pointer flex items-start gap-4 hover:shadow-md hover:border-blue-200 ${
                  !n.notLeida ? "border-blue-100 bg-blue-50/30" : "border-slate-100"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition ${
                  !n.notLeida ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  <FaBell className="text-lg" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1">
                    <h3 className={`text-base truncate transition ${!n.notLeida ? "text-slate-900 font-bold" : "text-slate-600 font-semibold"}`}>
                      {n.notTitulo}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium flex items-center gap-1.5 whitespace-nowrap">
                      <FaClock className="text-[10px]" />
                      {new Date(n.notFechaProgramada).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm line-clamp-2 ${!n.notLeida ? "text-slate-700 font-medium" : "text-slate-500"}`}>
                    {n.notMensaje}
                  </p>
                </div>
                
                {!n.notLeida && (
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-2" title="No leída" />
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Detalle */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center border-b border-slate-50 relative">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                <FaBell className="text-2xl" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedNotif.notTitulo}</h2>
              <div className="mt-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <FaClock /> {new Date(selectedNotif.notFechaProgramada).toLocaleString()}
              </div>
            </div>
            <div className="p-10 bg-white">
              <p className="text-slate-600 leading-relaxed text-center text-lg whitespace-pre-wrap">
                {selectedNotif.notMensaje}
              </p>
            </div>
            <div className="p-6 bg-slate-50">
              <button
                onClick={() => setSelectedNotif(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition cursor-pointer shadow-xl shadow-slate-200"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
