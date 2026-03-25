import { FaEdit, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import CustomSelect from "../../ui/CustomSelect";

const ROLES = ["CLIENTE", "ADMINISTRADOR", "EMPLEADO"];

const CAMPO = ({ label, children }) => {
    const [text, asterisk] = label.endsWith(" *") ? [label.slice(0, -2), true] : [label, false];
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">
                {text}{asterisk && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
};

const INPUT_CLS = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm";

export default function EditarUsuarioModal({
    editando,
    editForm,
    setEditForm,
    guardando,
    mostrarPass,
    setMostrarPass,
    mostrarConfirm,
    setMostrarConfirm,
    onClose,
    onSubmit,
}) {
    if (!editando) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <FaEdit className="text-blue-500" /> Editar Usuario
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">ID #{editando.idUsuario}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="px-8 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <CAMPO label="Nombre *">
                            <input required className={INPUT_CLS} value={editForm.usuNombre}
                                onChange={e => setEditForm(p => ({ ...p, usuNombre: e.target.value }))} />
                        </CAMPO>
                        <CAMPO label="Apellido *">
                            <input required className={INPUT_CLS} value={editForm.usuApellido}
                                onChange={e => setEditForm(p => ({ ...p, usuApellido: e.target.value }))} />
                        </CAMPO>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <CAMPO label="Documento *">
                            <input required className={INPUT_CLS} value={editForm.usuDocumento}
                                onChange={e => setEditForm(p => ({ ...p, usuDocumento: e.target.value }))} />
                        </CAMPO>
                        <CAMPO label="Teléfono *">
                            <input required className={INPUT_CLS} value={editForm.usuTelefono}
                                onChange={e => setEditForm(p => ({ ...p, usuTelefono: e.target.value }))} />
                        </CAMPO>
                    </div>

                    <CAMPO label="Correo electrónico *">
                        <input required type="email" className={INPUT_CLS} value={editForm.usuCorreo}
                            onChange={e => setEditForm(p => ({ ...p, usuCorreo: e.target.value }))} />
                    </CAMPO>

                    <CAMPO label="Dirección *">
                        <input required className={INPUT_CLS} value={editForm.usuDireccion}
                            onChange={e => setEditForm(p => ({ ...p, usuDireccion: e.target.value }))} />
                    </CAMPO>

                    <CAMPO label="Rol *">
                        <CustomSelect
                            value={editForm.rolNombre}
                            onChange={(val) => setEditForm(p => ({ ...p, rolNombre: val }))}
                            options={ROLES.map(r => ({ value: r, label: r }))}
                            required={true}
                        />
                    </CAMPO>

                    <div className="border-t border-slate-100 pt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                            Cambiar contraseña (opcional)
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <CAMPO label="Nueva contraseña">
                                <div className="relative">
                                    <input
                                        type={mostrarPass ? "text" : "password"}
                                        className={INPUT_CLS + " pr-10"}
                                        placeholder="Dejar vacío para no cambiar"
                                        value={editForm.usuPassword}
                                        onChange={e => setEditForm(p => ({ ...p, usuPassword: e.target.value }))}
                                    />
                                    <button type="button" onClick={() => setMostrarPass(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {mostrarPass ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </CAMPO>
                            <CAMPO label="Confirmar contraseña">
                                <div className="relative">
                                    <input
                                        type={mostrarConfirm ? "text" : "password"}
                                        className={INPUT_CLS + " pr-10"}
                                        placeholder="Repetir contraseña"
                                        value={editForm.confirmarPassword}
                                        onChange={e => setEditForm(p => ({ ...p, confirmarPassword: e.target.value }))}
                                    />
                                    <button type="button" onClick={() => setMostrarConfirm(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {mostrarConfirm ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </CAMPO>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">
                            Cancelar
                        </button>
                        <button type="submit" disabled={guardando}
                            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50">
                            {guardando ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
