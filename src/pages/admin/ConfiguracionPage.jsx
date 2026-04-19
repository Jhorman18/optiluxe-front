import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaCog, FaUser, FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "../../context/auth/AuthContext";
import { editarPerfilPropio } from "../../services/usuarioService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const INPUT_CLS        = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm";
const INPUT_ERROR_CLS  = "w-full px-4 py-2.5 bg-red-50 border border-red-400 rounded-xl focus:ring-2 focus:ring-red-400 outline-none transition text-sm";
const INPUT_READONLY_CLS = "w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed select-none";

function Campo({ label, error, children }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 font-medium">{error.message}</p>}
        </div>
    );
}

export default function ConfiguracionPage() {
    const { usuario, setUsuario, logout } = useAuth();
    const navigate = useNavigate();

    const [mostrarPass, setMostrarPass]       = useState(false);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);
    const [guardando, setGuardando]           = useState(false);
    const [passValue, setPassValue]           = useState("");
    const [confirmValue, setConfirmValue]     = useState("");

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: {
            usuTelefono:  usuario?.usuTelefono  ?? "",
            usuCorreo:    usuario?.usuCorreo    ?? usuario?.correo ?? "",
            usuDireccion: usuario?.usuDireccion ?? "",
        },
    });

    // Sincroniza cuando el usuario del contexto esté disponible
    useEffect(() => {
        if (!usuario) return;
        reset({
            usuTelefono:  usuario.usuTelefono  ?? usuario.telefono  ?? "",
            usuCorreo:    usuario.usuCorreo    ?? usuario.correo    ?? "",
            usuDireccion: usuario.usuDireccion ?? usuario.direccion ?? "",
        });
    }, [usuario, reset]);

    const onSubmit = async (data) => {
        if (passValue && passValue !== confirmValue) {
            toast.error("Las contraseñas no coinciden");
            return;
        }
        if (passValue && passValue.length < 8) {
            toast.error("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        const original = {
            usuTelefono:  usuario?.usuTelefono  ?? usuario?.telefono  ?? "",
            usuCorreo:    usuario?.usuCorreo    ?? usuario?.correo    ?? "",
            usuDireccion: usuario?.usuDireccion ?? usuario?.direccion ?? "",
        };
        const sinCambios =
            data.usuTelefono  === original.usuTelefono  &&
            data.usuCorreo    === original.usuCorreo    &&
            data.usuDireccion === original.usuDireccion &&
            !passValue;

        if (sinCambios) {
            toast("No hay cambios para guardar.", { icon: "ℹ️" });
            return;
        }

        const payload = {
            usuTelefono:  data.usuTelefono,
            usuCorreo:    data.usuCorreo,
            usuDireccion: data.usuDireccion,
        };
        if (passValue) payload.usuPassword = passValue;

        try {
            setGuardando(true);
            const actualizado = await editarPerfilPropio(payload);

            if (passValue) {
                toast.success("Contraseña cambiada. Inicia sesión nuevamente.");
                await logout();
                navigate("/login");
                return;
            }

            setUsuario(prev => ({
                ...prev,
                ...actualizado,
                rol: actualizado.rol?.rolNombre ?? prev.rol,
            }));
            setPassValue("");
            setConfirmValue("");
            toast.success("Configuración guardada correctamente");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Error al guardar los cambios");
        } finally {
            setGuardando(false);
        }
    };

    // Valores de solo lectura del contexto
    const nombre    = usuario?.usuNombre    ?? usuario?.nombre    ?? "";
    const apellido  = usuario?.usuApellido  ?? usuario?.apellido  ?? "";
    const documento = usuario?.usuDocumento ?? usuario?.documento ?? "";

    const hayPassword = passValue.length > 0;

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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Tarjeta datos personales */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <FaUser className="text-blue-500" />
                        <h2 className="font-bold text-slate-900">Datos personales</h2>
                    </div>
                    <div className="px-6 py-6 space-y-4">
                        <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
                            Solo puedes editar tu <strong>teléfono</strong>, <strong>correo electrónico</strong> y <strong>dirección</strong>. Para cambiar otros datos contáctanos.
                        </p>

                        {/* Readonly */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Campo label="Nombre">
                                <input readOnly tabIndex={-1} className={INPUT_READONLY_CLS} value={nombre} />
                            </Campo>
                            <Campo label="Apellido">
                                <input readOnly tabIndex={-1} className={INPUT_READONLY_CLS} value={apellido} />
                            </Campo>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Campo label="Documento">
                                <input readOnly tabIndex={-1} className={INPUT_READONLY_CLS} value={documento} />
                            </Campo>

                            {/* Teléfono — editable con validación */}
                            <Campo label="Teléfono" error={errors.usuTelefono}>
                                <input
                                    inputMode="numeric"
                                    className={errors.usuTelefono ? INPUT_ERROR_CLS : INPUT_CLS}
                                    {...register("usuTelefono", {
                                        required: "El teléfono es obligatorio",
                                        pattern: {
                                            value: /^\d{10}$/,
                                            message: "Debe tener exactamente 10 dígitos",
                                        },
                                    })}
                                />
                            </Campo>
                        </div>

                        {/* Correo — editable con validación */}
                        <Campo label="Correo electrónico" error={errors.usuCorreo}>
                            <input
                                type="email"
                                className={errors.usuCorreo ? INPUT_ERROR_CLS : INPUT_CLS}
                                {...register("usuCorreo", {
                                    required: "El correo es obligatorio",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Ingresa un correo válido (ej: nombre@dominio.com)",
                                    },
                                })}
                            />
                        </Campo>

                        {/* Dirección — editable con validación */}
                        <Campo label="Dirección" error={errors.usuDireccion}>
                            <input
                                className={errors.usuDireccion ? INPUT_ERROR_CLS : INPUT_CLS}
                                {...register("usuDireccion", {
                                    required: "La dirección es obligatoria",
                                    minLength: { value: 5, message: "Mínimo 5 caracteres" },
                                })}
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
                                        value={passValue}
                                        onChange={e => setPassValue(e.target.value)}
                                    />
                                    <button type="button" onClick={() => setMostrarPass(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
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
                                        value={confirmValue}
                                        onChange={e => setConfirmValue(e.target.value)}
                                    />
                                    <button type="button" onClick={() => setMostrarConfirm(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                                        {mostrarConfirm ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </Campo>
                        </div>

                        {/* Indicador de coincidencia */}
                        {hayPassword && confirmValue.length > 0 && (
                            <div className={`mt-3 flex items-center gap-2 text-xs font-semibold ${passValue === confirmValue ? "text-emerald-600" : "text-red-500"}`}>
                                <FaCheckCircle />
                                {passValue === confirmValue ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
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
