import { useState, useEffect } from "react";
import { FaCog, FaUser, FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "../../context/auth/AuthContext";
import { editarUsuario } from "../../services/usuarioService";
import toast from "react-hot-toast";

const INPUT_CLS = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm";

function Campo({ label, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">{label}</label>
            {children}
        </div>
    );
}

export default function ConfiguracionPage() {
    const { usuario, setUsuario } = useAuth();

    const [form, setForm] = useState({
        usuNombre:    usuario?.usuNombre    ?? "",
        usuApellido:  usuario?.usuApellido  ?? "",
        usuDocumento: usuario?.usuDocumento ?? "",
        usuTelefono:  usuario?.usuTelefono  ?? "",
        usuCorreo:    usuario?.usuCorreo    ?? "",
        usuDireccion: usuario?.usuDireccion ?? "",
        usuPassword:  "",
        confirmar:    "",
    });

    // Rellena el form cuando el usuario del contexto esté disponible
    useEffect(() => {
        if (!usuario) return;
        setForm(p => ({
            ...p,
            usuNombre:    usuario.usuNombre    ?? usuario.nombre    ?? "",
            usuApellido:  usuario.usuApellido  ?? usuario.apellido  ?? "",
            usuDocumento: usuario.usuDocumento ?? usuario.documento ?? "",
            usuTelefono:  usuario.usuTelefono  ?? usuario.telefono  ?? "",
            usuCorreo:    usuario.usuCorreo    ?? usuario.correo    ?? "",
            usuDireccion: usuario.usuDireccion ?? usuario.direccion ?? "",
        }));
    }, [usuario]);

    const [mostrarPass, setMostrarPass]       = useState(false);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);
    const [guardando, setGuardando]           = useState(false);

    const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.usuPassword && form.usuPassword !== form.confirmar) {
            toast.error("Las contraseñas no coinciden");
            return;
        }
        if (form.usuPassword && form.usuPassword.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        const payload = {
            usuNombre:    form.usuNombre,
            usuApellido:  form.usuApellido,
            usuDocumento: form.usuDocumento,
            usuTelefono:  form.usuTelefono,
            usuCorreo:    form.usuCorreo,
            usuDireccion: form.usuDireccion,
        };
        if (form.usuPassword) payload.usuPassword = form.usuPassword;

        try {
            setGuardando(true);
            const actualizado = await editarUsuario(usuario.idUsuario, payload);
            setUsuario(prev => ({ ...prev, ...actualizado }));
            setForm(p => ({ ...p, usuPassword: "", confirmar: "" }));
            toast.success("Configuración guardada correctamente");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Error al guardar los cambios");
        } finally {
            setGuardando(false);
        }
    };

    const hayPassword = form.usuPassword.length > 0;

    return (
        <div className="p-8 max-w-3xl mx-auto w-full">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                    <FaCog className="text-blue-600" /> Configuración
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    Actualiza tus datos personales y contraseña
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Tarjeta datos personales */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <FaUser className="text-blue-500" />
                        <h2 className="font-bold text-slate-900">Datos personales</h2>
                    </div>
                    <div className="px-6 py-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Campo label="Nombre">
                                <input
                                    required
                                    className={INPUT_CLS}
                                    value={form.usuNombre}
                                    onChange={set("usuNombre")}
                                />
                            </Campo>
                            <Campo label="Apellido">
                                <input
                                    required
                                    className={INPUT_CLS}
                                    value={form.usuApellido}
                                    onChange={set("usuApellido")}
                                />
                            </Campo>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Campo label="Documento">
                                <input
                                    className={INPUT_CLS}
                                    value={form.usuDocumento}
                                    onChange={set("usuDocumento")}
                                />
                            </Campo>
                            <Campo label="Teléfono">
                                <input
                                    className={INPUT_CLS}
                                    value={form.usuTelefono}
                                    onChange={set("usuTelefono")}
                                />
                            </Campo>
                        </div>
                        <Campo label="Correo electrónico">
                            <input
                                required
                                type="email"
                                className={INPUT_CLS}
                                value={form.usuCorreo}
                                onChange={set("usuCorreo")}
                            />
                        </Campo>
                        <Campo label="Dirección">
                            <input
                                className={INPUT_CLS}
                                value={form.usuDireccion}
                                onChange={set("usuDireccion")}
                            />
                        </Campo>
                    </div>
                </div>

                {/* Tarjeta contraseña */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <FaLock className="text-blue-500" />
                        <h2 className="font-bold text-slate-900">Cambiar contraseña</h2>
                        <span className="text-xs text-slate-400 font-medium ml-1">(opcional)</span>
                    </div>
                    <div className="px-6 py-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Campo label="Nueva contraseña">
                                <div className="relative">
                                    <input
                                        type={mostrarPass ? "text" : "password"}
                                        className={INPUT_CLS + " pr-10"}
                                        placeholder="Mínimo 8 caracteres"
                                        value={form.usuPassword}
                                        onChange={set("usuPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarPass(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                    >
                                        {mostrarPass ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </Campo>
                            <Campo label="Confirmar contraseña">
                                <div className="relative">
                                    <input
                                        type={mostrarConfirm ? "text" : "password"}
                                        className={INPUT_CLS + " pr-10"}
                                        placeholder="Repetir contraseña"
                                        value={form.confirmar}
                                        onChange={set("confirmar")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarConfirm(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                    >
                                        {mostrarConfirm ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </Campo>
                        </div>

                        {/* Indicador de coincidencia */}
                        {hayPassword && form.confirmar.length > 0 && (
                            <div className={`mt-3 flex items-center gap-2 text-xs font-semibold ${form.usuPassword === form.confirmar ? "text-emerald-600" : "text-red-500"}`}>
                                <FaCheckCircle />
                                {form.usuPassword === form.confirmar ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Botón guardar */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={guardando}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {guardando
                            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                            : "Guardar cambios"
                        }
                    </button>
                </div>

            </form>
        </div>
    );
}
