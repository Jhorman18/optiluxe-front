import { useEffect, useState } from "react";
import { getMisHistorias } from "../../services/historiaClinicaService";
import HeaderHome from "../../components/home/HeaderHome";
import Footer from "../../components/layout/Footer";
import { FaStethoscope, FaCalendarAlt, FaEye, FaTimes, FaFileMedical } from "react-icons/fa";
import toast from "react-hot-toast";

const formatFecha = (iso) =>
    new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

function DetalleModal({ historia, onClose }) {
    if (!historia) return null;
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
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FaStethoscope className="text-blue-500" /> Historia Clínica
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition text-xl">×</button>
                </div>
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                        <FaCalendarAlt className="text-blue-400 shrink-0" />
                        <span className="font-medium text-blue-700">{historia.cita?.citMotivo}</span>
                        <span className="ml-auto">{formatFecha(historia.cita?.citFecha)}</span>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diagnóstico</p>
                        <p className="text-sm text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-4 leading-relaxed">
                            {historia.hisDiagnostico}
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fórmula Óptica</p>
                        <pre className="text-sm font-mono text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-4 whitespace-pre-wrap leading-relaxed">
                            {historia.hisFormulaOptica}
                        </pre>
                    </div>
                    {historia.hisObservaciones && (
                        <div className="space-y-1.5">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Observaciones</p>
                            <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-4 leading-relaxed">
                                {historia.hisObservaciones}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function HistoriaClinicaPage({ isView }) {
    const [historias, setHistorias] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [detalle, setDetalle]     = useState(null);

    useEffect(() => {
        getMisHistorias()
            .then(setHistorias)
            .catch(() => toast.error("Error al cargar tu historial clínico"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className={isView ? "flex-1 w-full flex flex-col bg-slate-50" : "min-h-screen bg-slate-50 flex flex-col"}>
            {!isView && <HeaderHome />}
            <main className={isView ? "flex-1 w-full py-6 px-4" : "flex-1 w-full py-12 px-4"}>
                <div className="max-w-3xl mx-auto">
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                                <FaFileMedical className="text-white text-xl" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                Mi Historial Clínico
                            </h1>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mt-2">Consulta el registro de tus atenciones, diagnósticos y fórmulas ópticas.</p>
                    </header>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : historias.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
                            <FaStethoscope className="text-slate-200 text-5xl mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Aún no tienes historias clínicas registradas.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {historias.map(h => (
                                <div key={h.idHistoriaClinica} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                            <FaStethoscope />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{h.cita?.citMotivo ?? "Atención"}</p>
                                            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                <FaCalendarAlt className="text-xs" />
                                                {formatFecha(h.hisFecha)}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{h.hisDiagnostico}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setDetalle(h)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm rounded-xl transition shrink-0"
                                    >
                                        <FaEye /> Ver
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            {!isView && <Footer />}
            <DetalleModal historia={detalle} onClose={() => setDetalle(null)} />
        </div>
    );
}
