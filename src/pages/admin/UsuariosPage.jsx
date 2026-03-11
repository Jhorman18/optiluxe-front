import { useState, useEffect, useMemo } from "react";
import {
    FaSearch, FaFilter, FaToggleOn, FaToggleOff,
    FaCheckCircle, FaTimesCircle, FaSort, FaSortUp, FaSortDown,
    FaUserCircle
} from "react-icons/fa";
import * as usuarioService from "../../services/usuarioService";
import toast from "react-hot-toast";

const ROLES = ["CLIENTE", "ADMINISTRADOR", "EMPLEADO"];

const ROL_COLORS = {
    ADMINISTRADOR: "bg-purple-100 text-purple-700",
    EMPLEADO: "bg-blue-100 text-blue-700",
    CLIENTE: "bg-slate-100 text-slate-600",
};

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRol, setSelectedRol] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "idUsuario", direction: "desc" });

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

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    const sortedUsuarios = useMemo(() => {
        return [...usuarios].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if (sortConfig.key === "rol") {
                aVal = a.rol?.rolNombre ?? "";
                bVal = b.rol?.rolNombre ?? "";
            }
            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [usuarios, sortConfig]);

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

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <FaSort className="text-slate-300 ml-1" />;
        return sortConfig.direction === "asc"
            ? <FaSortUp className="text-blue-600 ml-1" />
            : <FaSortDown className="text-blue-600 ml-1" />;
    };

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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition select-none"
                                    onClick={() => handleSort("usuNombre")}
                                >
                                    <div className="flex items-center">Usuario <SortIcon column="usuNombre" /></div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition select-none"
                                    onClick={() => handleSort("usuDocumento")}
                                >
                                    <div className="flex items-center">Documento <SortIcon column="usuDocumento" /></div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition select-none"
                                    onClick={() => handleSort("usuCorreo")}
                                >
                                    <div className="flex items-center">Correo <SortIcon column="usuCorreo" /></div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Teléfono
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition select-none"
                                    onClick={() => handleSort("rol")}
                                >
                                    <div className="flex items-center">Rol <SortIcon column="rol" /></div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition select-none"
                                    onClick={() => handleSort("usuEstado")}
                                >
                                    <div className="flex items-center">Estado <SortIcon column="usuEstado" /></div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 w-40 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-36 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-10 bg-slate-100 float-right rounded"></div></td>
                                    </tr>
                                ))
                            ) : sortedUsuarios.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No se encontraron usuarios.
                                    </td>
                                </tr>
                            ) : (
                                sortedUsuarios.map(u => {
                                    const rolNombre = u.rol?.rolNombre ?? "—";
                                    const iniciales = ((u.usuNombre?.[0] ?? "") + (u.usuApellido?.[0] ?? "")).toUpperCase();

                                    return (
                                        <tr key={u.idUsuario} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                        {iniciales || <FaUserCircle className="text-lg" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 leading-tight">{u.usuNombre} {u.usuApellido}</p>
                                                        <p className="text-xs text-slate-400 font-mono">ID #{u.idUsuario}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{u.usuDocumento ?? "—"}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{u.usuCorreo}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{u.usuTelefono ?? "—"}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ROL_COLORS[rolNombre] ?? "bg-slate-100 text-slate-600"}`}>
                                                    {rolNombre}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.usuEstado === "ACTIVO" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                                                    {u.usuEstado === "ACTIVO" ? <FaCheckCircle /> : <FaTimesCircle />}
                                                    {u.usuEstado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
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
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
