import { useState, useEffect, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { FaHistory, FaCheckCircle, FaClock, FaExclamationCircle, FaTrashAlt, FaSearch } from "react-icons/fa";
import { obtenerNotificaciones, eliminarNotificacion } from "../../services/notificacionService";
import toast from "react-hot-toast";
import DataTable from "../ui/DataTable";

const columnHelper = createColumnHelper();

export default function HistorialNotificaciones({ refreshKey }) {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await obtenerNotificaciones();
            setNotificaciones(data);
        } catch {
            toast.error("Error al cargar historial de notificaciones");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshKey]);

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

    const filteredNotifs = useMemo(() =>
        notificaciones.filter(n =>
            n.notTitulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.notMensaje.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [notificaciones, searchTerm]
    );

    const columns = useMemo(() => [
        columnHelper.display({
            id: "paciente",
            header: "Paciente",
            cell: ({ row: { original: notif } }) => (
                <>
                    <p className="font-bold text-slate-900">{notif.usuario?.usuNombre} {notif.usuario?.usuApellido}</p>
                    <p className="text-[11px] text-slate-500">{notif.usuario?.usuCorreo}</p>
                </>
            ),
            meta: { skeletonClass: "h-10 w-32" },
        }),
        columnHelper.display({
            id: "contenido",
            header: "Contenido",
            cell: ({ row: { original: notif } }) => (
                <div className="max-w-xs">
                    <p className="font-bold text-sm text-slate-800 truncate">{notif.notTitulo}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{notif.notMensaje}</p>
                </div>
            ),
            meta: { skeletonClass: "h-10 w-40" },
        }),
        columnHelper.display({
            id: "programacion",
            header: "Programación",
            cell: ({ row: { original: notif } }) => (
                <div className="flex items-center gap-1.5 text-slate-700 font-medium text-sm">
                    <FaClock className="text-slate-300 text-xs" />
                    {new Date(notif.notFechaProgramada).toLocaleString()}
                </div>
            ),
            meta: { skeletonClass: "h-6 w-32" },
        }),
        columnHelper.display({
            id: "canal",
            header: "Canal / Estado",
            cell: ({ row: { original: notif } }) => (
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
            ),
            meta: { skeletonClass: "h-10 w-24" },
        }),
        columnHelper.display({
            id: "_acciones",
            header: "",
            cell: ({ row: { original: notif } }) => notif.notEstado === "Pendiente" ? (
                <div className="flex justify-end">
                    <button
                        onClick={() => handleDelete(notif.idNotificacion)}
                        className="text-slate-300 hover:text-red-500 transition p-2 cursor-pointer"
                        title="Cancelar programación"
                    >
                        <FaTrashAlt />
                    </button>
                </div>
            ) : null,
            meta: { skeletonClass: "h-6 w-8" },
        }),
    ], [handleDelete]);

    return (
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

            {/* Tabla */}
            <DataTable
                columns={columns}
                data={filteredNotifs}
                loading={loading}
                emptyMessage="No se encontraron notificaciones."
                pageSize={10}
                header={
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <FaHistory className="text-slate-400" />
                        <h3 className="font-bold text-slate-700">Historial de Envío</h3>
                    </div>
                }
            />
        </div>
    );
}
