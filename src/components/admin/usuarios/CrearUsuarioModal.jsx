import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaUserPlus, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import CustomSelect from "../../ui/CustomSelect";

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
        setValue,
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
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Premium */}
                <div className="bg-blue-600 px-8 py-7 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/5">
                            <FaUserPlus />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight uppercase">Nuevo Usuario</h2>
                            <p className="text-[10px] text-blue-200 font-mono tracking-[0.2em] opacity-80 uppercase">Registro Administrativo</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2.5 hover:bg-white/10 rounded-full transition cursor-pointer group">
                        <FaTimes className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(submit)} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30">
                    
                    {/* Sección 1: Datos Personales */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[9px] ml-2">
                            <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center text-[10px]">1</span>
                            Información de Identidad
                            <div className="h-[1px] flex-1 bg-slate-200 ml-2" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <CAMPO label="Nombre" error={errors.usuNombre}>
                                <input
                                    placeholder="Ej: Juan"
                                    className={inputCls(errors.usuNombre)}
                                    {...register("usuNombre", {
                                        required: "El nombre es obligatorio",
                                        minLength: { value: 2, message: "Mínimo 2 caracteres" },
                                    })}
                                />
                            </CAMPO>
                            <CAMPO label="Apellido" error={errors.usuApellido}>
                                <input
                                    placeholder="Ej: Pérez"
                                    className={inputCls(errors.usuApellido)}
                                    {...register("usuApellido", {
                                        required: "El apellido es obligatorio",
                                        minLength: { value: 2, message: "Mínimo 2 caracteres" },
                                    })}
                                />
                            </CAMPO>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <CAMPO label="Cédula / Documento" error={errors.usuDocumento}>
                                <input
                                    maxLength={10}
                                    placeholder="Ej: 1234567890"
                                    className={inputCls(errors.usuDocumento)}
                                    {...register("usuDocumento", {
                                        required: "La cédula es obligatoria",
                                        pattern: { value: /^\d+$/, message: "Solo se permiten números" },
                                        minLength: { value: 6, message: "Mínimo 6 dígitos" },
                                        onChange: (e) => {
                                            e.target.value = e.target.value.replace(/\D/g, "");
                                        }
                                    })}
                                />
                            </CAMPO>
                            <CAMPO label="Rol de Usuario" error={errors.rolNombre}>
                                <CustomSelect
                                    value={watch("rolNombre")}
                                    onChange={(val) => setValue("rolNombre", val, { shouldValidate: true })}
                                    options={ROLES.map(r => ({ value: r, label: r }))}
                                    required={true}
                                />
                            </CAMPO>
                        </div>
                    </div>

                    {/* Sección 2: Contacto */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[9px] ml-2">
                            <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center text-[10px]">2</span>
                            Contacto y Ubicación
                            <div className="h-[1px] flex-1 bg-slate-200 ml-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <CAMPO label="Correo electrónico" error={errors.usuCorreo}>
                                <input
                                    type="text"
                                    placeholder="correo@ejemplo.com"
                                    className={inputCls(errors.usuCorreo)}
                                    {...register("usuCorreo", {
                                        required: "El correo es obligatorio",
                                        pattern: {
                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                            message: "Formato inválido (debe incluir @ y punto)",
                                        },
                                    })}
                                />
                            </CAMPO>
                            <CAMPO label="Teléfono" error={errors.usuTelefono}>
                                <input
                                    maxLength={10}
                                    placeholder="Ej: 300 000 0000"
                                    className={inputCls(errors.usuTelefono)}
                                    {...register("usuTelefono", {
                                        required: "El teléfono es obligatorio",
                                        pattern: { value: /^\d{10}$/, message: "Debe tener exactamente 10 dígitos" },
                                        onChange: (e) => {
                                            e.target.value = e.target.value.replace(/\D/g, "");
                                        }
                                    })}
                                />
                            </CAMPO>
                        </div>

                        <CAMPO label="Dirección de Residencia" error={errors.usuDireccion}>
                            <input
                                placeholder="Ej: Calle 123 #45-67, Ciudad"
                                className={inputCls(errors.usuDireccion)}
                                {...register("usuDireccion", {
                                    required: "La dirección es obligatoria",
                                    minLength: { value: 5, message: "Mínimo 5 caracteres" },
                                })}
                            />
                        </CAMPO>
                    </div>

                    {/* Sección 3: Seguridad */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[9px] ml-2">
                            <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center text-[10px]">3</span>
                            Seguridad de la Cuenta
                            <div className="h-[1px] flex-1 bg-slate-200 ml-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <CAMPO label="Contraseña" error={errors.usuPassword}>
                                <div className="relative">
                                    <input
                                        type={mostrarPass ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={inputCls(errors.usuPassword) + " pr-10 font-mono"}
                                        {...register("usuPassword", {
                                            required: "La contraseña es obligatoria",
                                            minLength: { value: 8, message: "Mínimo 8 caracteres" },
                                            validate: {
                                                tieneMinuscula: (v) => /[a-z]/.test(v) || "Debe contener al menos una minúscula",
                                                tieneMayuscula: (v) => /[A-Z]/.test(v) || "Debe contener al menos una mayúscula",
                                                tieneNumero: (v) => /\d/.test(v) || "Debe contener al menos un número",
                                                tieneSimbolo: (v) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) || "Debe contener al menos un símbolo",
                                            },
                                        })}
                                    />
                                    <button type="button" onClick={() => setMostrarPass((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                                        {mostrarPass ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </CAMPO>
                            <CAMPO label="Confirmar Contraseña" error={errors.confirmarPassword}>
                                <div className="relative">
                                    <input
                                        type={mostrarConfirm ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={inputCls(errors.confirmarPassword) + " pr-10 font-mono"}
                                        {...register("confirmarPassword", {
                                            required: "Confirma la contraseña",
                                            validate: (val) =>
                                                val === watch("usuPassword") || "Las contraseñas no coinciden",
                                        })}
                                    />
                                    <button type="button" onClick={() => setMostrarConfirm((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                                        {mostrarConfirm ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </CAMPO>
                        </div>
                    </div>
                </form>

                {/* Footer con botones mejorados */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
                    <button 
                        type="button" 
                        onClick={handleClose}
                        className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit(submit)} 
                        disabled={guardando}
                        className="flex-[2] py-3.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-600/30 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                    >
                        {guardando ? (
                            <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando Usuario...</>
                        ) : (
                            <><FaUserPlus /> Crear Usuario</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
