import { useState } from "react";
import { 
    FaChartBar, FaCalendarAlt, FaBoxOpen, FaFileInvoiceDollar, 
    FaFilePdf, FaFileCsv, FaSearch, FaExclamationTriangle, FaCheckCircle 
} from "react-icons/fa";
import * as reporteService from "../../services/reporteService";
import { generatePDF, generateCSV } from "../../utils/exportUtils";
import toast from "react-hot-toast";

export default function ReportesPage() {
    const [tipoReporte, setTipoReporte] = useState("ventas");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    // Limpiar datos cuando cambie el tipo de reporte para evitar errores de renderizado
    const cambiarTipo = (tipo) => {
        setTipoReporte(tipo);
        setData(null);
        setFechaInicio("");
        setFechaFin("");
    };

    const handleGenerar = async () => {
        if ((tipoReporte === "ventas" || tipoReporte === "citas") && (!fechaInicio || !fechaFin)) {
            toast.error("Por favor selecciona un rango de fechas");
            return;
        }

        setLoading(true);
        setData(null);
        try {
            let res;
            if (tipoReporte === "ventas") {
                res = await reporteService.getReporteVentas(fechaInicio, fechaFin);
            } else if (tipoReporte === "inventario") {
                res = await reporteService.getReporteInventario();
            } else if (tipoReporte === "citas") {
                res = await reporteService.getReporteCitas(fechaInicio, fechaFin);
            }
            setData(res);
            toast.success("Reporte generado correctamente");
        } catch (error) {
            toast.error("Error al generar el reporte");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fmtFecha = (iso) => new Date(iso).toLocaleDateString("es-CO");

    const handleExportPDF = () => {
        if (!data) return;

        if (tipoReporte === "ventas") {
            const columnas = ["Número", "Fecha", "Cliente", "Total", "Estado"];
            const filas = [...data.efectivas, ...data.anuladas].map(f => [
                f.facNumero,
                fmtFecha(f.facFecha),
                `${f.usuario?.usuNombre} ${f.usuario?.usuApellido}`,
                `$${Number(f.facTotal).toLocaleString()}`,
                f.facEstado,
            ]);
            generatePDF("Reporte de Ventas", columnas, filas, `ventas_${fechaInicio}_${fechaFin}.pdf`, {
                periodo: `${fmtFecha(fechaInicio)} — ${fmtFecha(fechaFin)}`,
                resumen: [
                    { label: "Ventas Efectivas",  valor: data.resumen.totalEfectivas },
                    { label: "Monto Efectivo",     valor: `$${data.resumen.montoTotalEfectivas.toLocaleString()}` },
                    { label: "Ventas Anuladas",    valor: data.resumen.totalAnuladas },
                    { label: "Monto Anulado",      valor: `$${data.resumen.montoTotalAnuladas.toLocaleString()}` },
                ],
            });
        } else if (tipoReporte === "inventario") {
            const columnas = ["Producto", "Categoría", "Stock", "Precio", "Estado"];
            const filas = data.productos.map(p => [
                p.proNombre,
                p.categoria?.catNombre,
                p.proStock,
                `$${Number(p.proPrecio).toLocaleString()}`,
                p.proEstado,
            ]);
            generatePDF("Reporte de Inventario", columnas, filas, "inventario.pdf", {
                resumen: [
                    { label: "Total Productos",    valor: data.resumen.totalProductos },
                    { label: "Valor Inventario",   valor: `$${data.resumen.valorTotalInventario.toLocaleString()}` },
                    { label: "Stock Bajo (<5)",    valor: data.resumen.productosStockBajo },
                ],
            });
        } else if (tipoReporte === "citas") {
            const columnas = ["Paciente", "Motivo", "Fecha", "Hora", "Estado"];
            const filas = data.citas.map(c => [
                `${c.usuario?.usuNombre} ${c.usuario?.usuApellido}`,
                c.citMotivo,
                fmtFecha(c.citFecha),
                new Date(c.citFecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                c.citEstado,
            ]);
            generatePDF("Reporte de Citas", columnas, filas, `citas_${fechaInicio}_${fechaFin}.pdf`, {
                periodo: `${fmtFecha(fechaInicio)} — ${fmtFecha(fechaFin)}`,
                resumen: [
                    { label: "Total Citas",     valor: data.resumen.totalCitas },
                    { label: "Completadas",     valor: data.resumen.COMPLETADA || 0 },
                    { label: "Pendientes",      valor: (data.resumen.PENDIENTE || 0) + (data.resumen.EN_ATENCION || 0) },
                    { label: "Canceladas",      valor: data.resumen.CANCELADA || 0 },
                ],
            });
        }
    };

    const handleExportCSV = () => {
        if (!data) return;
        let exportData = [];
        if (tipoReporte === "ventas") {
            exportData = [...data.efectivas, ...data.anuladas].map(f => ({
                Numero: f.facNumero,
                Fecha: new Date(f.facFecha).toLocaleDateString(),
                Cliente: `${f.usuario?.usuNombre} ${f.usuario?.usuApellido}`,
                Total: f.facTotal,
                Estado: f.facEstado
            }));
        } else if (tipoReporte === "inventario") {
            exportData = data.productos.map(p => ({
                Producto: p.proNombre,
                Categoria: p.categoria?.catNombre,
                Stock: p.proStock,
                Precio: p.proPrecio,
                Estado: p.proEstado
            }));
        } else if (tipoReporte === "citas") {
            exportData = data.citas.map(c => ({
                Paciente: `${c.usuario?.usuNombre} ${c.usuario?.usuApellido}`,
                Motivo: c.citMotivo,
                Fecha: new Date(c.citFecha).toLocaleDateString(),
                Estado: c.citEstado
            }));
        }
        generateCSV(exportData, `reporte_${tipoReporte}.csv`);
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full min-h-screen bg-slate-50">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                        <FaChartBar className="text-white text-xl" />
                    </div>
                    <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Generación de Reportes
                    </h1>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-2">Analiza el rendimiento de OptiLuxe con datos detallados y reportes en tiempo real.</p>
            </header>

            {/* Panel de Control */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">Tipo de Reporte</label>
                        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                            <button 
                                onClick={() => cambiarTipo("ventas")}
                                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-[11px] font-bold transition ${tipoReporte === "ventas" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <FaFileInvoiceDollar className="text-lg" /> Ventas
                            </button>
                            <button 
                                onClick={() => cambiarTipo("inventario")}
                                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-[11px] font-bold transition ${tipoReporte === "inventario" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <FaBoxOpen className="text-lg" /> Inventario
                            </button>
                            <button 
                                onClick={() => cambiarTipo("citas")}
                                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-[11px] font-bold transition ${tipoReporte === "citas" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <FaCalendarAlt className="text-lg" /> Citas
                            </button>
                        </div>
                    </div>

                    {tipoReporte !== "inventario" && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Fecha Inicio</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={fechaInicio}
                                    onChange={e => setFechaInicio(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Fecha Fin</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={fechaFin}
                                    onChange={e => setFechaFin(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <button 
                        onClick={handleGenerar}
                        disabled={loading}
                        className="md:col-span-1 bg-blue-700 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition shadow-lg shadow-blue-700/10 disabled:opacity-50 cursor-pointer h-[52px]"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div> : <FaSearch />}
                        Generar Reporte
                    </button>
                </div>
            </div>

            {/* Resultados */}
            {data && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Resumen KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tipoReporte === "ventas" && (
                            <>
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Ventas Efectivas</p>
                                    <p className="text-3xl font-extrabold text-slate-900">{data.resumen.totalEfectivas}</p>
                                    <p className="text-xl font-bold text-slate-500 mt-1">${data.resumen.montoTotalEfectivas.toLocaleString()}</p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Ventas Anuladas</p>
                                    <p className="text-3xl font-extrabold text-slate-900">{data.resumen.totalAnuladas}</p>
                                    <p className="text-xl font-bold text-slate-500 mt-1">${data.resumen.montoTotalAnuladas.toLocaleString()}</p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                    <div className="flex gap-4">
                                        <button onClick={handleExportPDF} className="flex-1 bg-red-50 text-red-600 p-4 rounded-2xl hover:bg-red-600 hover:text-white transition flex flex-col items-center gap-2 font-bold cursor-pointer">
                                            <FaFilePdf className="text-xl" /> <span className="text-[10px]">PDF</span>
                                        </button>
                                        <button onClick={handleExportCSV} className="flex-1 bg-emerald-50 text-emerald-600 p-4 rounded-2xl hover:bg-emerald-600 hover:text-white transition flex flex-col items-center gap-2 font-bold cursor-pointer">
                                            <FaFileCsv className="text-xl" /> <span className="text-[10px]">CSV</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {tipoReporte === "inventario" && (
                            <>
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Productos</p>
                                    <p className="text-3xl font-extrabold text-slate-900">{data.resumen.totalProductos}</p>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">Valor total: ${data.resumen.valorTotalInventario.toLocaleString()}</p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1 flex items-center gap-2">
                                        <FaExclamationTriangle /> Stock Bajo (&lt;5)
                                    </p>
                                    <p className="text-3xl font-extrabold text-red-600">{data.resumen.productosStockBajo}</p>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">Requieren reposición urgente</p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                    <div className="flex gap-4">
                                        <button onClick={handleExportPDF} className="flex-1 bg-red-50 text-red-600 p-4 rounded-2xl hover:bg-red-600 hover:text-white transition flex flex-col items-center gap-2 font-bold cursor-pointer">
                                            <FaFilePdf className="text-xl" /> <span className="text-[10px]">PDF</span>
                                        </button>
                                        <button onClick={handleExportCSV} className="flex-1 bg-emerald-50 text-emerald-600 p-4 rounded-2xl hover:bg-emerald-600 hover:text-white transition flex flex-col items-center gap-2 font-bold cursor-pointer">
                                            <FaFileCsv className="text-xl" /> <span className="text-[10px]">CSV</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {tipoReporte === "citas" && (
                            <>
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Citas</p>
                                    <p className="text-3xl font-extrabold text-slate-900">{data.resumen.totalCitas}</p>
                                    <p className="text-sm text-slate-500 mt-1 font-medium flex items-center gap-2">
                                        <FaCheckCircle className="text-emerald-500" /> {data.resumen.COMPLETADA || 0} Completadas
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Pendientes / En Atención</p>
                                    <p className="text-3xl font-extrabold text-slate-900">{(data.resumen.PENDIENTE || 0) + (data.resumen.EN_ATENCION || 0)}</p>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">Canceladas: {data.resumen.CANCELADA || 0}</p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                    <div className="flex gap-4">
                                        <button onClick={handleExportPDF} className="flex-1 bg-red-50 text-red-600 p-4 rounded-2xl hover:bg-red-600 hover:text-white transition flex flex-col items-center gap-2 font-bold cursor-pointer">
                                            <FaFilePdf className="text-xl" /> <span className="text-[10px]">PDF</span>
                                        </button>
                                        <button onClick={handleExportCSV} className="flex-1 bg-emerald-50 text-emerald-600 p-4 rounded-2xl hover:bg-emerald-600 hover:text-white transition flex flex-col items-center gap-2 font-bold cursor-pointer">
                                            <FaFileCsv className="text-xl" /> <span className="text-[10px]">CSV</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Tabla Detalle */}
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-900">Detalle del Reporte</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                    <tr>
                                        {tipoReporte === "ventas" && (
                                            <>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Número</th>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Fecha</th>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Cliente</th>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Total</th>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Estado</th>
                                            </>
                                        )}
                                        {tipoReporte === "inventario" && (
                                            <>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Producto</th>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Categoría</th>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Stock</th>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Precio</th>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Estado</th>
                                            </>
                                        )}
                                        {tipoReporte === "citas" && (
                                            <>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Paciente</th>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Motivo</th>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Fecha</th>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Hora</th>
                                                <th className="px-4 sm:px-8 py-3 sm:py-4">Estado</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {tipoReporte === "ventas" && [...data.efectivas, ...data.anuladas].map(f => (
                                        <tr key={f.idFactura} className="hover:bg-slate-50 transition">
                                            <td className="px-4 sm:px-8 py-3 sm:py-4 font-bold text-slate-900">{f.facNumero}</td>
                                            <td className="px-4 sm:px-8 py-3 sm:py-4 text-slate-500">{new Date(f.facFecha).toLocaleDateString()}</td>
                                            <td className="px-4 sm:px-8 py-3 sm:py-4 text-slate-700 font-medium">{f.usuario?.usuNombre} {f.usuario?.usuApellido}</td>
                                            <td className="px-4 sm:px-8 py-3 sm:py-4 font-bold text-slate-900">${Number(f.facTotal).toLocaleString()}</td>
                                            <td className="px-4 sm:px-8 py-3 sm:py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${f.facEstado === "PAGADA" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                                    {f.facEstado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {tipoReporte === "inventario" && data.productos.map(p => (
                                        <tr key={p.idProducto} className="hover:bg-slate-50 transition">
                                            <td className="px-4 sm:px-8 py-3 sm:py-4 font-bold text-slate-900">{p.proNombre}</td>
                                            <td className="px-4 sm:px-8 py-3 sm:py-4 text-slate-500">{p.categoria?.catNombre}</td>
                                            <td className="px-4 sm:px-8 py-3 sm:py-4">
                                                <span className={`font-bold ${p.proStock < 5 ? "text-red-600" : "text-slate-900"}`}>
                                                    {p.proStock}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-8 py-3 sm:py-4 font-bold text-slate-900">${Number(p.proPrecio).toLocaleString()}</td>
                                            <td className="px-4 sm:px-8 py-3 sm:py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${p.proEstado === "ACTIVO" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                                                    {p.proEstado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {tipoReporte === "citas" && data.citas.map(c => (
                                        <tr key={c.idCita} className="hover:bg-slate-50 transition">
                                            <td className="px-4 sm:px-8 py-3 sm:py-4 font-bold text-slate-900">{c.usuario?.usuNombre} {c.usuario?.usuApellido}</td>
                                            <td className="px-4 sm:px-8 py-3 sm:py-4 text-slate-500">{c.citMotivo}</td>
                                            <td className="px-4 sm:px-8 py-3 sm:py-4 text-slate-700 font-medium">{new Date(c.citFecha).toLocaleDateString()}</td>
                                            <td className="px-4 sm:px-8 py-3 sm:py-4 text-slate-500">{new Date(c.citFecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="px-4 sm:px-8 py-3 sm:py-4">
                                                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-700">
                                                    {c.citEstado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
