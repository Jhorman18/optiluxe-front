import { useState, useEffect, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
    FaSearch, FaStethoscope, FaUser, FaCalendarAlt,
    FaEye, FaIdCard, FaPhone, FaEnvelope, FaEdit, FaTrashAlt, FaFileMedical
} from "react-icons/fa";
import { getHistorias, actualizarHistoriaClinica, eliminarHistoriaClinica } from "../../services/historiaClinicaService";
import { useAuth } from "../../context/auth/AuthContext";
import toast from "react-hot-toast";
import DataTable from "../ui/DataTable";

const columnHelper = createColumnHelper();

const formatFecha = (iso) =>
    new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

export default function GestionHistorialClinico() {
    const { rol } = useAuth();
    const esAdmin = rol === "ADMINISTRADOR";

    const [historias, setHistorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedHistoria, setSelectedHistoria] = useState(null);

    const [editando, setEditando] = useState(null);
    const [editForm, setEditForm] = useState({ hisDiagnostico: "", hisFormulaOptica: "", hisObservaciones: "" });
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const data = await getHistorias(searchTerm || undefined);
                setHistorias(data);
            } catch {
                toast.error("Error al cargar historias clínicas");
            } finally {
                setLoading(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const abrirEditar = (h) => {
        setEditando(h);
        setEditForm({
            hisDiagnostico: h.hisDiagnostico ?? "",
            hisFormulaOptica: h.hisFormulaOptica ?? "",
            hisObservaciones: h.hisObservaciones ?? "",
        });
    };

    const handleGuardarEdicion = async (e) => {
        e.preventDefault();
        try {
            setGuardando(true);
            const actualizada = await actualizarHistoriaClinica(editando.idHistoriaClinica, editForm);
            setHistorias(prev => prev.map(h => h.idHistoriaClinica === editando.idHistoriaClinica ? { ...h, ...actualizada } : h));
            toast.success("Historia clínica actualizada");
            setEditando(null);
        } catch {
            toast.error("Error al actualizar la historia clínica");
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (h) => {
        if (!window.confirm(`¿Eliminar la historia clínica de ${h.cita?.usuario?.usuNombre} ${h.cita?.usuario?.usuApellido}? Esta acción no se puede deshacer.`)) return;
        try {
            await eliminarHistoriaClinica(h.idHistoriaClinica);
            setHistorias(prev => prev.filter(x => x.idHistoriaClinica !== h.idHistoriaClinica));
            toast.success("Historia clínica eliminada");
        } catch {
            toast.error("Error al eliminar la historia clínica");
        }
    };

    const columns = useMemo(() => [
        columnHelper.display({
            id: "paciente",
            header: "Paciente",
            cell: ({ row: { original: h } }) => {
                const u = h.cita?.usuario;
                const iniciales = ((u?.usuNombre?.[0] ?? "") + (u?.usuApellido?.[0] ?? "")).toUpperCase();
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {iniciales}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 leading-tight">{u?.usuNombre} {u?.usuApellido}</p>
                            <p className="text-xs text-slate-400 font-mono">{u?.usuDocumento}</p>
                        </div>
                    </div>
                );
            },
            meta: { skeletonClass: "h-10 w-40" },
        }),
        columnHelper.accessor("hisFecha", {
            header: "Fecha",
            cell: ({ getValue }) => (
                <span className="text-sm text-slate-600 font-medium">{formatFecha(getValue())}</span>
            ),
            meta: { skeletonClass: "h-5 w-24" },
        }),
        columnHelper.display({
            id: "servicio",
            header: "Servicio",
            cell: ({ row: { original: h } }) => (
                <span className="text-sm text-slate-600 max-w-36 truncate block">{h.cita?.citMotivo ?? "—"}</span>
            ),
            meta: { skeletonClass: "h-5 w-28" },
        }),
        columnHelper.accessor("hisDiagnostico", {
            header: "Diagnóstico",
            cell: ({ getValue }) => (
                <span className="text-sm text-slate-700 max-w-56 truncate block">{getValue()}</span>
            ),
            meta: { skeletonClass: "h-5 w-40" },
        }),
        columnHelper.display({
            id: "formula",
            header: "Fórmula Óptica",
            cell: ({ row: { original: h } }) => (
                <span className="text-xs font-mono text-slate-500 max-w-40 truncate block">{h.hisFormulaOptica}</span>
            ),
            meta: { skeletonClass: "h-5 w-32" },
        }),
        columnHelper.display({
            id: "_acciones",
            header: "",
            cell: ({ row: { original: h } }) => (
                <div className="flex justify-end gap-1">
                    <button
                        onClick={() => setSelectedHistoria(h)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Ver detalle"
                    >
                        <FaEye />
                    </button>
                    {esAdmin && (
                        <>
                            <button
                                onClick={() => abrirEditar(h)}
                                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                title="Editar"
                            >
                                <FaEdit />
                            </button>
                            <button
                                onClick={() => handleEliminar(h)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Eliminar"
                            >
                                <FaTrashAlt />
                            </button>
                        </>
                    )}
                </div>
            ),
            meta: { skeletonClass: "h-6 w-20 float-right" },
        }),
    ], [esAdmin, abrirEditar, handleEliminar]);

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">

            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                            <FaFileMedical className="text-white text-xl" />
                        </div>
                        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Historial Clínico</h1>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
                        <p className="text-2xl font-extrabold text-blue-600">{historias.length}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</p>
                    </div>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-2">Consulta el registro de diagnósticos y fórmulas ópticas de los pacientes desde un solo panel.</p>
            </header>

            {/* Buscador */}
            <div className="relative max-w-lg mb-8">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido, documento o diagnóstico..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tabla */}
            <DataTable
                columns={columns}
                data={historias}
                loading={loading}
                emptyMessage="No se encontraron historias clínicas."
                pageSize={10}
                initialSorting={[{ id: "hisFecha", desc: true }]}
                onRowClick={setSelectedHistoria}
            />

            {/* Modal Detalle */}
            {selectedHistoria && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => setSelectedHistoria(null)}
                >
                    <div
                        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <FaStethoscope className="text-blue-500" /> Historia Clínica
                                </h2>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Registrada el {formatFecha(selectedHistoria.hisFecha)}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedHistoria(null)}
                                className="text-slate-400 hover:text-slate-600 transition text-xl font-bold leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="px-8 py-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Paciente */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <FaUser className="text-blue-500" /> Paciente
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">Nombre</p>
                                        <p className="font-bold text-slate-900">
                                            {selectedHistoria.cita?.usuario?.usuNombre} {selectedHistoria.cita?.usuario?.usuApellido}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><FaIdCard className="text-[10px]" /> Documento</p>
                                        <p className="font-bold text-slate-900">{selectedHistoria.cita?.usuario?.usuDocumento}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><FaPhone className="text-[10px]" /> Teléfono</p>
                                        <p className="font-bold text-slate-900">{selectedHistoria.cita?.usuario?.usuTelefono ?? "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1"><FaEnvelope className="text-[10px]" /> Correo</p>
                                        <p className="font-bold text-slate-900 truncate">{selectedHistoria.cita?.usuario?.usuCorreo}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cita */}
                            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 text-sm">
                                <FaCalendarAlt className="text-blue-500 shrink-0" />
                                <div>
                                    <span className="text-blue-700 font-bold">{selectedHistoria.cita?.citMotivo}</span>
                                    <span className="text-blue-500 ml-2">{formatFecha(selectedHistoria.cita?.citFecha)}</span>
                                </div>
                            </div>

                            {/* Diagnóstico */}
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnóstico</p>
                                <p className="text-sm text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-4 leading-relaxed">
                                    {selectedHistoria.hisDiagnostico}
                                </p>
                            </div>

                            {/* Fórmula Óptica */}
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fórmula Óptica</p>
                                <pre className="text-sm font-mono text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-4 whitespace-pre-wrap leading-relaxed">
                                    {selectedHistoria.hisFormulaOptica}
                                </pre>
                            </div>

                            {/* Observaciones */}
                            {selectedHistoria.hisObservaciones && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observaciones</p>
                                    <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-4 leading-relaxed">
                                        {selectedHistoria.hisObservaciones}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Historia Clínica */}
            {editando && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => !guardando && setEditando(null)}
                >
                    <div
                        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <FaEdit className="text-amber-500" /> Editar Historia Clínica
                                </h2>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    {editando.cita?.usuario?.usuNombre} {editando.cita?.usuario?.usuApellido}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditando(null)}
                                disabled={guardando}
                                className="text-slate-400 hover:text-slate-600 transition text-xl font-bold leading-none disabled:opacity-40"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleGuardarEdicion} className="px-8 py-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Diagnóstico</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={editForm.hisDiagnostico}
                                    onChange={e => setEditForm(p => ({ ...p, hisDiagnostico: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Fórmula Óptica</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={editForm.hisFormulaOptica}
                                    onChange={e => setEditForm(p => ({ ...p, hisFormulaOptica: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Observaciones <span className="text-slate-400 font-normal">(opcional)</span></label>
                                <textarea
                                    rows={2}
                                    value={editForm.hisObservaciones}
                                    onChange={e => setEditForm(p => ({ ...p, hisObservaciones: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditando(null)}
                                    disabled={guardando}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition disabled:opacity-40"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {guardando ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
}
