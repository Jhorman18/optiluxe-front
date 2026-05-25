import { useState, useEffect, useMemo } from "react";
import { FaBell, FaClock, FaCheck, FaEnvelopeOpen, FaFilter, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { obtenerMisNotificaciones, marcarNotificacionLeida } from "../../services/notificacionService";
import HeaderHome from "../../components/home/HeaderHome";
import Footer from "../../components/layout/Footer";

const POR_PAGINA = 5;

const formatFecha = (iso) =>
  new Date(iso).toLocaleString("es-CO", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export default function MisNotificacionesPage({ isView }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroLeida, setFiltroLeida] = useState(""); // "" | "no_leida" | "leida"
  const [pagina, setPagina] = useState(1);

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

  const limpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    setFiltroLeida("");
    setPagina(1);
  };

  const hayFiltrosActivos = fechaInicio || fechaFin || filtroLeida;

  const notificacionesFiltradas = useMemo(() => {
    return notificaciones.filter(n => {
      const fecha = new Date(n.notFechaProgramada);
      if (fechaInicio && fecha < new Date(fechaInicio + "T00:00:00")) return false;
      if (fechaFin && fecha > new Date(fechaFin + "T23:59:59")) return false;
      if (filtroLeida === "leida" && !n.notLeida) return false;
      if (filtroLeida === "no_leida" && n.notLeida) return false;
      return true;
    });
  }, [notificaciones, fechaInicio, fechaFin, filtroLeida]);

  const totalPaginas = Math.max(1, Math.ceil(notificacionesFiltradas.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);

  const notificacionesPagina = useMemo(() => {
    const inicio = (paginaSegura - 1) * POR_PAGINA;
    return notificacionesFiltradas.slice(inicio, inicio + POR_PAGINA);
  }, [notificacionesFiltradas, paginaSegura]);

  const cambiarPagina = (nueva) => {
    setPagina(nueva);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const noLeidas = notificaciones.filter(n => !n.notLeida).length;

  return (
    <div className={isView ? "flex-1 w-full flex flex-col bg-slate-50" : "min-h-screen bg-slate-50 flex flex-col"}>
      {!isView && <HeaderHome />}

      <main className={isView ? "flex-1 w-full py-6 px-4" : "flex-1 w-full py-12 px-4"}>
        <div className="max-w-3xl mx-auto">

        {/* Header */}
        <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200 shrink-0">
                  <FaBell className="text-white text-base md:text-lg" />
                </div>
                {noLeidas > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {noLeidas > 9 ? "9+" : noLeidas}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Mis Notificaciones</h1>
            </div>
            <p className="text-sm md:text-base text-slate-500 font-medium">
              {notificaciones.length} notificación{notificaciones.length !== 1 ? "es" : ""} en total
              {noLeidas > 0 && <span className="ml-2 text-blue-600 font-bold">· {noLeidas} sin leer</span>}
            </p>
          </div>

          {notificaciones.some(n => !n.notLeida) && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 font-bold text-sm rounded-xl transition cursor-pointer shadow-sm self-start md:self-auto"
            >
              <FaCheck className="text-xs" />
              Marcar todas como leídas
            </button>
          )}
        </header>

        {/* Filtros */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FaFilter className="text-slate-400 text-sm" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtros</span>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="ml-auto flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-bold transition cursor-pointer"
              >
                <FaTimes className="text-[10px]" /> Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Desde</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={e => { setFechaInicio(e.target.value); setPagina(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Hasta</label>
              <input
                type="date"
                value={fechaFin}
                onChange={e => { setFechaFin(e.target.value); setPagina(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
              <select
                value={filtroLeida}
                onChange={e => { setFiltroLeida(e.target.value); setPagina(1); }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer"
              >
                <option value="">Todas</option>
                <option value="no_leida">Sin leer</option>
                <option value="leida">Leídas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resultados info */}
        {!loading && hayFiltrosActivos && (
          <p className="text-sm text-slate-500 font-medium mb-4">
            Mostrando <span className="font-bold text-slate-700">{notificacionesFiltradas.length}</span> resultado{notificacionesFiltradas.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Lista */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notificacionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaEnvelopeOpen className="text-4xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {hayFiltrosActivos ? "Sin resultados" : "No tienes notificaciones"}
            </h2>
            <p className="text-slate-500">
              {hayFiltrosActivos
                ? "Prueba ajustando los filtros de búsqueda."
                : "Te avisaremos cuando haya novedades importantes para ti."}
            </p>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {notificacionesPagina.map((n) => (
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
                        {formatFecha(n.notFechaProgramada)}
                      </span>
                    </div>
                    <p className={`text-sm line-clamp-2 ${!n.notLeida ? "text-slate-700 font-medium" : "text-slate-500"}`}>
                      {n.notMensaje}
                    </p>
                  </div>

                  {!n.notLeida && (
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-2 shrink-0" title="No leída" />
                  )}
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-500 font-medium">
                  Página <span className="font-bold text-slate-700">{paginaSegura}</span> de <span className="font-bold text-slate-700">{totalPaginas}</span>
                  <span className="ml-2 text-slate-400">({notificacionesFiltradas.length} resultados)</span>
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => cambiarPagina(1)}
                    disabled={paginaSegura === 1}
                    className="px-3 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    «
                  </button>
                  <button
                    onClick={() => cambiarPagina(paginaSegura - 1)}
                    disabled={paginaSegura === 1}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <FaChevronLeft className="text-xs" /> Anterior
                  </button>

                  <div className="flex items-center gap-1 mx-1">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPaginas || Math.abs(p - paginaSegura) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "..." ? (
                          <span key={`sep-${idx}`} className="px-2 text-slate-400 text-sm">…</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => cambiarPagina(item)}
                            className={`w-9 h-9 rounded-lg text-sm font-bold transition cursor-pointer ${
                              item === paginaSegura
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                  </div>

                  <button
                    onClick={() => cambiarPagina(paginaSegura + 1)}
                    disabled={paginaSegura === totalPaginas}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Siguiente <FaChevronRight className="text-xs" />
                  </button>
                  <button
                    onClick={() => cambiarPagina(totalPaginas)}
                    disabled={paginaSegura === totalPaginas}
                    className="px-3 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </main>

      {/* Modal Detalle */}
      {selectedNotif && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedNotif(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FaBell className="text-blue-500" /> {selectedNotif.notTitulo}
              </h2>
              <button onClick={() => setSelectedNotif(null)} className="text-slate-400 hover:text-slate-600 transition text-xl cursor-pointer">×</button>
            </div>
            
            <div className="p-6 bg-white space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                <FaClock className="text-blue-400 shrink-0" />
                <span className="font-medium text-blue-700">Fecha</span>
                <span className="ml-auto">{formatFecha(selectedNotif.notFechaProgramada)}</span>
              </div>
              
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detalle</p>
                <p className="text-sm text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
                  {selectedNotif.notMensaje}
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setSelectedNotif(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition cursor-pointer shadow-lg shadow-blue-200"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {!isView && <Footer />}
    </div>
  );
}
