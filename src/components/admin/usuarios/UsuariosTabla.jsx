import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
    FaToggleOn, FaToggleOff, FaCheckCircle, FaTimesCircle,
    FaUserCircle, FaEdit,
} from "react-icons/fa";
import DataTable from "../../ui/DataTable";

const ROL_COLORS = {
    ADMINISTRADOR: "bg-purple-100 text-purple-700",
    EMPLEADO: "bg-blue-100 text-blue-700",
    CLIENTE: "bg-sky-100 text-sky-700",
};

const columnHelper = createColumnHelper();

export default function UsuariosTabla({ usuarios, loading, onEditar, onToggleEstado, esEmpleado }) {
    const columns = useMemo(() => {
        const baseColumns = [
            columnHelper.accessor("usuNombre", {
                header: "Usuario",
                cell: ({ row: { original: u } }) => {
                    const iniciales = ((u.usuNombre?.[0] ?? "") + (u.usuApellido?.[0] ?? "")).toUpperCase();
                    return (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                                {iniciales || <FaUserCircle className="text-lg" />}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 leading-tight">{u.usuNombre} {u.usuApellido}</p>
                                <p className="text-xs text-slate-400 font-mono">ID #{u.idUsuario}</p>
                            </div>
                        </div>
                    );
                },
                meta: { skeletonClass: "h-10 w-40" },
            }),
            columnHelper.accessor("usuDocumento", {
                header: "Documento",
                cell: ({ getValue }) => <span className="text-sm text-slate-600">{getValue() ?? "—"}</span>,
                meta: { skeletonClass: "h-6 w-24" },
            }),
            columnHelper.accessor("usuCorreo", {
                header: "Correo",
                cell: ({ getValue }) => <span className="text-sm text-slate-600">{getValue()}</span>,
                meta: { skeletonClass: "h-6 w-36" },
            }),
            columnHelper.accessor("usuTelefono", {
                header: "Teléfono",
                enableSorting: false,
                cell: ({ getValue }) => <span className="text-sm text-slate-600">{getValue() ?? "—"}</span>,
                meta: { skeletonClass: "h-6 w-24" },
            }),
            columnHelper.accessor(row => row.rol?.rolNombre ?? "", {
                id: "rol",
                header: "Rol",
                cell: ({ getValue }) => {
                    const rolNombre = getValue() || "—";
                    return (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ROL_COLORS[rolNombre] ?? "bg-slate-100 text-slate-600"}`}>
                            {rolNombre}
                        </span>
                    );
                },
                meta: { skeletonClass: "h-6 w-20" },
            }),
            columnHelper.accessor("usuEstado", {
                header: "Estado",
                cell: ({ getValue }) => {
                    const estado = getValue();
                    return (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${estado === "ACTIVO" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                            {estado === "ACTIVO" ? <FaCheckCircle /> : <FaTimesCircle />}
                            {estado}
                        </span>
                    );
                },
                meta: { skeletonClass: "h-6 w-20" },
            })
        ];

        if (!esEmpleado) {
            baseColumns.push(
                columnHelper.display({
                    id: "_acciones",
                    header: "Acciones",
                    cell: ({ row: { original: u } }) => (
                        <div className="flex justify-end gap-1">
                            <button
                                onClick={() => onEditar(u)}
                                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                title="Editar usuario"
                            >
                                <FaEdit className="text-base" />
                            </button>
                            <button
                                onClick={() => onToggleEstado(u)}
                                className={`p-2 transition rounded-lg ${u.usuEstado === "ACTIVO"
                                    ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    : "text-slate-400 hover:text-green-600 hover:bg-green-50"
                                }`}
                                title={u.usuEstado === "ACTIVO" ? "Desactivar" : "Activar"}
                            >
                                {u.usuEstado === "ACTIVO"
                                    ? <FaToggleOn className="text-xl" />
                                    : <FaToggleOff className="text-xl" />}
                            </button>
                        </div>
                    ),
                    meta: { headerClassName: "text-right", skeletonClass: "h-6 w-16 float-right" },
                })
            );
        }

        return baseColumns;
    }, [onEditar, onToggleEstado, esEmpleado]);

    return (
        <DataTable
            columns={columns}
            data={usuarios}
            loading={loading}
            emptyMessage="No se encontraron usuarios."
        />
    );
}
