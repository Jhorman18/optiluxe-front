import { useEffect, useState, useMemo } from "react";
import { getMisSoportesPago } from "../../services/soportePagoService";
import HeaderHome from "../../components/home/HeaderHome";
import Footer from "../../components/layout/Footer";
import StatusBadge from "../../components/ui/StatusBadge";
import { FaShoppingBag, FaCalendarAlt, FaEye, FaFileInvoiceDollar, FaSearch, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const formatFecha = (iso) =>
    new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

function DetalleModal({ soporte, onClose }) {
    if (!soporte) return null;
    const productos = soporte.carrito?.carrito_producto ?? [];
    const servicios = soporte.carrito?.carrito_servicio ?? [];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <FaFileInvoiceDollar className="text-blue-500" /> {soporte.sopNumero}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">{formatFecha(soporte.sopFecha)}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition text-xl">×</button>
                </div>

                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Estado */}
                    <StatusBadge status={soporte.sopEstado} />

                    {/* Concepto */}
                    {soporte.sopConcepto && (
                        <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                            {soporte.sopConcepto}
                        </p>
                    )}

                    {/* Productos del carrito */}
                    {productos.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Productos</p>
                            <div className="space-y-2">
                                {productos.map((cp, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                                        <span className="text-slate-700 font-medium">{cp.producto?.proNombre ?? "Producto"}</span>
                                        <span className="text-slate-500">x{cp.cantidad} — <span className="font-bold text-slate-800">${(Number(cp.producto?.proPrecio || 0) * cp.cantidad).toLocaleString()}</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Servicios del carrito */}
                    {servicios.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Servicios</p>
                            <div className="space-y-2">
                                {servicios.map((cs, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                                        <div className="flex flex-col">
                                            <span className="text-slate-700 font-medium">{cs.csNombre}</span>
                                            <span className="text-slate-500 text-[10px]">{cs.csFecha} {cs.csHora}</span>
                                        </div>
                                        <span className="font-bold text-slate-800">${Number(cs.csPrecio || 0).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Totales */}
                    <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
                        <div className="flex justify-between px-4 py-2.5 text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-medium text-slate-800">${Number(soporte.sopSubtotal).toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between px-4 py-2.5 text-sm font-bold">
                            <span className="text-slate-900">Total</span>
                            <span className="text-blue-600 text-base">${Number(soporte.sopTotal).toLocaleString()}</span>
                        </div>
                    </div>

                    {soporte.sopEstado === "ANULADA" && soporte.sopMotivoAnulacion && (
                        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                            <span className="font-bold">Motivo de anulación: </span>{soporte.sopMotivoAnulacion}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PedidosPage({ isView }) {
    const [soportes, setSoportes] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [detalle, setDetalle]   = useState(null);
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");

    useEffect(() => {
        getMisSoportesPago()
            .then(setSoportes)
            .catch(() => toast.error("Error al cargar tus pedidos"))
            .finally(() => setLoading(false));
    }, []);

    const soportesFiltrados = useMemo(() => {
        return soportes.filter(s => {
            const fecha = new Date(s.sopFecha);
            if (fechaDesde && fecha < new Date(fechaDesde)) return false;
            if (fechaHasta) {
                const hasta = new Date(fechaHasta);
                hasta.setDate(hasta.getDate() + 1);
                if (fecha >= hasta) return false;
            }
            return true;
        });
    }, [soportes, fechaDesde, fechaHasta]);

    const limpiarFiltros = () => { setFechaDesde(""); setFechaHasta(""); };
    const hayFiltros = fechaDesde || fechaHasta;

    return (
        <div className={isView ? "flex-1 w-full flex flex-col bg-slate-50" : "min-h-screen bg-slate-50 flex flex-col"}>
            {!isView && <HeaderHome />}
            <main className={isView ? "flex-1 w-full py-6 px-4" : "flex-1 w-full py-12 px-4"}>
                <div className="max-w-3xl mx-auto">
                    <header className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                                <FaShoppingBag className="text-white text-xl" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                Mis Pedidos
                            </h1>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mt-2">Consulta el historial de tus compras y soportes de pago detallados.</p>
                    </header>

                    {/* Filtro por fecha */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-wrap items-end gap-3">
                        <FaSearch className="text-slate-400 mb-2 shrink-0" />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500">Desde</label>
                            <input
                                type="date"
                                value={fechaDesde}
                                onChange={e => setFechaDesde(e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-slate-500">Hasta</label>
                            <input
                                type="date"
                                value={fechaHasta}
                                onChange={e => setFechaHasta(e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                        {hayFiltros && (
                            <button
                                onClick={limpiarFiltros}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition mb-0.5"
                            >
                                <FaTimes className="text-xs" /> Limpiar
                            </button>
                        )}
                        {hayFiltros && (
                            <span className="ml-auto text-xs text-slate-400 self-end mb-2">
                                {soportesFiltrados.length} resultado{soportesFiltrados.length !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : soportes.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
                            <FaShoppingBag className="text-slate-200 text-5xl mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Aún no tienes pedidos registrados.</p>
                        </div>
                    ) : soportesFiltrados.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
                            <FaSearch className="text-slate-200 text-5xl mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No hay pedidos en ese rango de fechas.</p>
                            <button onClick={limpiarFiltros} className="mt-3 text-sm text-blue-600 hover:underline">Limpiar filtros</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {soportesFiltrados.map(s => {
                                return (
                                    <div key={s.idSoporte} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                <FaFileInvoiceDollar />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{s.sopNumero}</p>
                                                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                    <FaCalendarAlt className="text-xs" /> {formatFecha(s.sopFecha)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <StatusBadge status={s.sopEstado} />
                                                    <span className="text-sm font-bold text-slate-700">${Number(s.sopTotal).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setDetalle(s)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm rounded-xl transition shrink-0"
                                        >
                                            <FaEye /> Ver
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            {!isView && <Footer />}
            <DetalleModal soporte={detalle} onClose={() => setDetalle(null)} />
        </div>
    );
}
