import { useState, useEffect, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
    FaSearch, FaFilter, FaToggleOn, FaToggleOff,
    FaCheckCircle, FaTimesCircle, FaUserCircle
} from "react-icons/fa";
import * as usuarioService from "../../services/usuarioService";
import toast from "react-hot-toast";
import DataTable from "../ui/DataTable";

const ROLES = ["CLIENTE", "ADMINISTRADOR", "EMPLEADO"];

const ROL_COLORS = {
    ADMINISTRADOR: "bg-purple-100 text-purple-700",
    EMPLEADO: "bg-blue-100 text-blue-700",
    CLIENTE: "bg-sky-100 text-sky-700",
};

const columnHelper = createColumnHelper();

export default function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRol, setSelectedRol] = useState("");

    const fetchUsuarios = async (busqueda, rol) => {
        try {
            setLoading(true);
            const data = await usuarioService.getUsuarios({
                ...(busqueda && { busqueda }),
                ...(rol && { rol }),
            });
            setUsuarios(data);
        } catch {
            toast.error("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsuarios(searchTerm, selectedRol);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedRol]);

    const handleToggleEstado = async (usuario) => {
        const nuevoEstado = usuario.usuEstado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
        try {
            await usuarioService.toggleUsuarioEstado(usuario.idUsuario, nuevoEstado);
            setUsuarios(prev =>
                prev.map(u =>
                    u.idUsuario === usuario.idUsuario ? { ...u, usuEstado: nuevoEstado } : u
                )
            );
            toast.success(`Usuario ${nuevoEstado === "ACTIVO" ? "activado" : "desactivado"}`);
        } catch {
            toast.error("Error al cambiar estado del usuario");
        }
    };

    const columns = useMemo(() => [
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
        }),
        columnHelper.display({
            id: "_acciones",
            header: "Acciones",
            cell: ({ row: { original: u } }) => (
                <div className="flex justify-end">
                    <button
                        onClick={() => handleToggleEstado(u)}
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
            meta: { headerClassName: "text-right", skeletonClass: "h-6 w-10 float-right" },
        }),
    ], [handleToggleEstado]);

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Usuarios</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Consulta y gestiona el estado de todos los usuarios registrados</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
                    <p className="text-2xl font-extrabold text-blue-600">{usuarios.length}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="relative col-span-1 md:col-span-2">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido, correo o documento..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none cursor-pointer"
                        value={selectedRol}
                        onChange={(e) => setSelectedRol(e.target.value)}
                    >
                        <option value="">Todos los roles</option>
                        {ROLES.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabla */}
            <DataTable
                columns={columns}
                data={usuarios}
                loading={loading}
                emptyMessage="No se encontraron usuarios."
            />
        </div>
    );
}
