import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaUserPlus, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";

const ROLES = ["CLIENTE", "ADMINISTRADOR", "EMPLEADO"];

const INPUT_CLS = "w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm";
const inputCls = (error) =>
    INPUT_CLS + (error ? " border-red-400 bg-red-50" : " border-slate-200");

const Error = ({ msg }) =>
    msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null;

const CAMPO = ({ label, error, children }) => (
    <div className="space-y-1">
        <label className="block text-sm font-bold text-slate-700">
            {label}<span className="text-red-500 ml-0.5">*</span>
        </label>
        {children}
        <Error msg={error?.message} />
    </div>
);

export default function CrearUsuarioModal({ abierto, guardando, onClose, onSubmit }) {
    const [mostrarPass, setMostrarPass] = useState(false);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: { rolNombre: "CLIENTE" } });

    if (!abierto) return null;

    const handleClose = () => {
        reset();
        setMostrarPass(false);
        setMostrarConfirm(false);
        onClose();
    };

    const submit = (data) => {
        const { confirmarPassword, ...payload } = data;
        onSubmit(payload, () => {
            reset();
            setMostrarPass(false);
            setMostrarConfirm(false);
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleClose}
        >
            <div
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <FaUserPlus className="text-blue-500" /> Crear Usuario
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">Completa los datos del nuevo usuario</p>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition">
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(submit)} className="px-8 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <CAMPO label="Nombre" error={errors.usuNombre}>
                            <input
                                className={inputCls(errors.usuNombre)}
                                {...register("usuNombre", {
                                    required: "El nombre es obligatorio",
                                    minLength: { value: 2, message: "Mínimo 2 caracteres" },
                                })}
                            />
                        </CAMPO>
                        <CAMPO label="Apellido" error={errors.usuApellido}>
                            <input
                                className={inputCls(errors.usuApellido)}
                                {...register("usuApellido", {
                                    required: "El apellido es obligatorio",
                                    minLength: { value: 2, message: "Mínimo 2 caracteres" },
                                })}
                            />
                        </CAMPO>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <CAMPO label="Cédula" error={errors.usuDocumento}>
                            <input
                                className={inputCls(errors.usuDocumento)}
                                inputMode="numeric"
                                {...register("usuDocumento", {
                                    required: "La cédula es obligatoria",
                                    pattern: { value: /^\d+$/, message: "Solo se permiten números" },
                                    minLength: { value: 6, message: "Mínimo 6 dígitos" },
                                    maxLength: { value: 10, message: "Máximo 10 dígitos" },
                                })}
                            />
                        </CAMPO>
                        <CAMPO label="Teléfono" error={errors.usuTelefono}>
                            <input
                                className={inputCls(errors.usuTelefono)}
                                inputMode="numeric"
                                {...register("usuTelefono", {
                                    required: "El teléfono es obligatorio",
                                    pattern: { value: /^\d{10}$/, message: "Debe tener exactamente 10 dígitos" },
                                })}
                            />
                        </CAMPO>
                    </div>

                    <CAMPO label="Correo electrónico" error={errors.usuCorreo}>
                        <input
                            type="email"
                            className={inputCls(errors.usuCorreo)}
                            {...register("usuCorreo", {
                                required: "El correo es obligatorio",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Ingresa un correo válido (ej: nombre@dominio.com)",
                                },
                            })}
                        />
                    </CAMPO>

                    <CAMPO label="Dirección" error={errors.usuDireccion}>
                        <input
                            className={inputCls(errors.usuDireccion)}
                            {...register("usuDireccion", {
                                required: "La dirección es obligatoria",
                                minLength: { value: 5, message: "Mínimo 5 caracteres" },
                            })}
                        />
                    </CAMPO>

                    <CAMPO label="Rol" error={errors.rolNombre}>
                        <select
                            className={inputCls(errors.rolNombre) + " cursor-pointer appearance-none"}
                            {...register("rolNombre", { required: "Selecciona un rol" })}
                        >
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </CAMPO>

                    <div className="grid grid-cols-2 gap-4">
                        <CAMPO label="Contraseña" error={errors.usuPassword}>
                            <div className="relative">
                                <input
                                    type={mostrarPass ? "text" : "password"}
                                    className={inputCls(errors.usuPassword) + " pr-10"}
                                    {...register("usuPassword", {
                                        required: "La contraseña es obligatoria",
                                        minLength: { value: 8, message: "Mínimo 8 caracteres" },
                                        validate: {
                                            tieneMinuscula: (v) => /[a-z]/.test(v) || "Debe contener al menos una minúscula",
                                            tieneMayuscula: (v) => /[A-Z]/.test(v) || "Debe contener al menos una mayúscula",
                                            tieneNumero: (v) => /\d/.test(v) || "Debe contener al menos un número",
                                            tieneSimbolo: (v) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) || "Debe contener al menos un símbolo (!@#$...)",
                                        },
                                    })}
                                />
                                <button type="button" onClick={() => setMostrarPass((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {mostrarPass ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </CAMPO>
                        <CAMPO label="Confirmar contraseña" error={errors.confirmarPassword}>
                            <div className="relative">
                                <input
                                    type={mostrarConfirm ? "text" : "password"}
                                    className={inputCls(errors.confirmarPassword) + " pr-10"}
                                    {...register("confirmarPassword", {
                                        required: "Confirma la contraseña",
                                        validate: (val) =>
                                            val === watch("usuPassword") || "Las contraseñas no coinciden",
                                    })}
                                />
                                <button type="button" onClick={() => setMostrarConfirm((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {mostrarConfirm ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </CAMPO>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={handleClose}
                            className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">
                            Cancelar
                        </button>
                        <button type="submit" disabled={guardando}
                            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50">
                            {guardando ? "Creando..." : "Crear usuario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
