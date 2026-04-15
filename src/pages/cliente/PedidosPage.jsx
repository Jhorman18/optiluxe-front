import { useEffect, useState } from "react";
import { getMisFacturas } from "../../services/facturaService";
import HeaderHome from "../../components/home/HeaderHome";
import Footer from "../../components/layout/Footer";
import { FaShoppingBag, FaCalendarAlt, FaEye, FaFileInvoiceDollar, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from "react-icons/fa";
import toast from "react-hot-toast";

const formatFecha = (iso) =>
    new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

const ESTADO_CFG = {
    PAGADA:   { label: "Pagada",   cls: "bg-emerald-100 text-emerald-700", Icon: FaCheckCircle },
    PENDIENTE:{ label: "Pendiente",cls: "bg-amber-100 text-amber-700",    Icon: FaHourglassHalf },
    ANULADA:  { label: "Anulada",  cls: "bg-red-100 text-red-600",        Icon: FaTimesCircle },
};

function DetalleModal({ factura, onClose }) {
    if (!factura) return null;
    const cfg = ESTADO_CFG[factura.facEstado] ?? ESTADO_CFG.PENDIENTE;
    const productos = factura.carrito?.carrito_producto ?? [];

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
                            <FaFileInvoiceDollar className="text-blue-500" /> {factura.facNumero}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">{formatFecha(factura.facFecha)}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition text-xl">×</button>
                </div>

                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Estado */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${cfg.cls}`}>
                        <cfg.Icon /> {cfg.label}
                    </span>

                    {/* Concepto */}
                    {factura.facConcepto && (
                        <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                            {factura.facConcepto}
                        </p>
                    )}

                    {/* Productos del carrito */}
                    {productos.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Productos</p>
                            <div className="space-y-2">
                                {productos.map((cp, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                                        <span className="text-slate-700 font-medium">{cp.producto?.nombre ?? "Producto"}</span>
                                        <span className="text-slate-500">x{cp.cantidad} — <span className="font-bold text-slate-800">${(Number(cp.precio) * cp.cantidad).toLocaleString()}</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Totales */}
                    <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
                        <div className="flex justify-between px-4 py-2.5 text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-medium text-slate-800">${Number(factura.facSubtotal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between px-4 py-2.5 text-sm">
                            <span className="text-slate-500">IVA (19%)</span>
                            <span className="font-medium text-slate-800">${Number(factura.facIva).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between px-4 py-2.5 text-sm font-bold">
                            <span className="text-slate-900">Total</span>
                            <span className="text-blue-600 text-base">${Number(factura.facTotal).toLocaleString()}</span>
                        </div>
                    </div>

                    {factura.facEstado === "ANULADA" && factura.facMotivoAnulacion && (
                        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                            <span className="font-bold">Motivo de anulación: </span>{factura.facMotivoAnulacion}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PedidosPage() {
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [detalle, setDetalle]   = useState(null);

    useEffect(() => {
        getMisFacturas()
            .then(setFacturas)
            .catch(() => toast.error("Error al cargar tus pedidos"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <HeaderHome />
            <main className="min-h-screen bg-slate-50 py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                            <FaShoppingBag className="text-blue-600" /> Mis Pedidos
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Historial de tus compras y facturas</p>
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
                    ) : facturas.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
                            <FaShoppingBag className="text-slate-200 text-5xl mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Aún no tienes pedidos registrados.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {facturas.map(f => {
                                const cfg = ESTADO_CFG[f.facEstado] ?? ESTADO_CFG.PENDIENTE;
                                return (
                                    <div key={f.idFactura} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                <FaFileInvoiceDollar />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{f.facNumero}</p>
                                                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                    <FaCalendarAlt className="text-xs" /> {formatFecha(f.facFecha)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.cls}`}>
                                                        <cfg.Icon className="text-[9px]" /> {cfg.label}
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-700">${Number(f.facTotal).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setDetalle(f)}
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
            <Footer />
            <DetalleModal factura={detalle} onClose={() => setDetalle(null)} />
        </>
    );
}
