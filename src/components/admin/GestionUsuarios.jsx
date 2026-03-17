import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaUserPlus } from "react-icons/fa";
import * as usuarioService from "../../services/usuarioService";
import toast from "react-hot-toast";
import UsuariosTabla from "./usuarios/UsuariosTabla";
import EditarUsuarioModal from "./usuarios/EditarUsuarioModal";
import CrearUsuarioModal from "./usuarios/CrearUsuarioModal";

const ROLES = ["CLIENTE", "ADMINISTRADOR", "EMPLEADO"];

export default function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRol, setSelectedRol] = useState("");

    const [editando, setEditando] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [guardando, setGuardando] = useState(false);
    const [mostrarPass, setMostrarPass] = useState(false);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);

    const [modalCrear, setModalCrear] = useState(false);
    const [creando, setCreando] = useState(false);

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

    const abrirEditar = (u) => {
        setEditando(u);
        setEditForm({
            usuNombre: u.usuNombre ?? "",
            usuApellido: u.usuApellido ?? "",
            usuDocumento: u.usuDocumento ?? "",
            usuTelefono: u.usuTelefono ?? "",
            usuCorreo: u.usuCorreo ?? "",
            usuDireccion: u.usuDireccion ?? "",
            rolNombre: u.rol?.rolNombre ?? "CLIENTE",
            usuPassword: "",
            confirmarPassword: "",
        });
        setMostrarPass(false);
        setMostrarConfirm(false);
    };

    const handleCrearUsuario = async (payload, resetForm) => {
        try {
            setCreando(true);
            const nuevo = await usuarioService.crearUsuario(payload);
            setUsuarios((prev) => [nuevo, ...prev]);
            toast.success("Usuario creado correctamente.");
            setModalCrear(false);
            resetForm();
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Error al crear usuario.");
        } finally {
            setCreando(false);
        }
    };

    const handleGuardarEdicion = async (e) => {
        e.preventDefault();
        if (editForm.usuPassword && editForm.usuPassword !== editForm.confirmarPassword) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }
        try {
            setGuardando(true);
            const payload = { ...editForm };
            delete payload.confirmarPassword;
            if (!payload.usuPassword) delete payload.usuPassword;
            const actualizado = await usuarioService.editarUsuario(editando.idUsuario, payload);
            setUsuarios(prev => prev.map(u => u.idUsuario === actualizado.idUsuario ? actualizado : u));
            toast.success("Usuario actualizado correctamente.");
            setEditando(null);
        } catch (error) {
            toast.error(error.message || "Error al actualizar usuario.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Usuarios</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Consulta y gestiona el estado de todos los usuarios registrados</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setModalCrear(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                    >
                        <FaUserPlus /> Crear usuario
                    </button>
                    <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
                        <p className="text-2xl font-extrabold text-blue-600">{usuarios.length}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</p>
                    </div>
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

            <UsuariosTabla
                usuarios={usuarios}
                loading={loading}
                onEditar={abrirEditar}
                onToggleEstado={handleToggleEstado}
            />

            <CrearUsuarioModal
                abierto={modalCrear}
                guardando={creando}
                onClose={() => setModalCrear(false)}
                onSubmit={handleCrearUsuario}
            />

            <EditarUsuarioModal
                editando={editando}
                editForm={editForm}
                setEditForm={setEditForm}
                guardando={guardando}
                mostrarPass={mostrarPass}
                setMostrarPass={setMostrarPass}
                mostrarConfirm={mostrarConfirm}
                setMostrarConfirm={setMostrarConfirm}
                onClose={() => setEditando(null)}
                onSubmit={handleGuardarEdicion}
            />
        </div>
    );
}
