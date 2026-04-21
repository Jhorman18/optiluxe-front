import React from "react";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaExclamationCircle,
    FaInfoCircle,
    FaCreditCard,
    FaUserCircle,
    FaStethoscope,
    FaStar,
    FaHourglassHalf
} from "react-icons/fa";

/**
 * STATUS_CONFIG - Mapeo de configuraciones por estado, SOLID: Separación de intereses
 */
const STATUS_CONFIG = {
    // Exito / Completado, Success
    "PAGADA": { theme: "success", icon: FaCheckCircle },
    "ACTIVO": { theme: "success", icon: FaCheckCircle },
    "ENVIADA": { theme: "success", icon: FaCheckCircle },
    "COMPLETADA": { theme: "success", icon: FaStar },
    "EXITOSO": { theme: "success", icon: FaCheckCircle },
    "VALIDO": { theme: "success", icon: FaCheckCircle },
    "CONFIRMADA": { theme: "success", icon: FaCheckCircle },
    "LEIDO": { theme: "success", icon: FaCheckCircle },
    "RESPONDIDO": { theme: "success", icon: FaCheckCircle },
    "VENTA": { theme: "success", icon: FaCreditCard },

    // Espera / Pendiente, Warning
    "PENDIENTE": { theme: "warning", icon: FaHourglassHalf },
    "PROCESANDO": { theme: "warning", icon: FaHourglassHalf },
    "EN PROCESO": { theme: "warning", icon: FaHourglassHalf },
    "ESPERA": { theme: "warning", icon: FaHourglassHalf },

    // Cancelado / Error, Error
    "ANULADA": { theme: "error", icon: FaTimesCircle },
    "INACTIVO": { theme: "error", icon: FaTimesCircle },
    "CANCELADA": { theme: "error", icon: FaTimesCircle },
    "FALLIDA": { theme: "error", icon: FaTimesCircle },
    "RECHAZADA": { theme: "error", icon: FaTimesCircle },
    "ELIMINADA": { theme: "error", icon: FaTimesCircle },
    "NO_ASISTIO": { theme: "error", icon: FaTimesCircle },
    "NO ASISTIÓ": { theme: "error", icon: FaTimesCircle },
    "NO ASISTIO": { theme: "error", icon: FaTimesCircle },

    // Información / Consulta, Info
    "EN_ATENCION": { theme: "info", icon: FaStethoscope },
    "EN ATENCIÓN": { theme: "info", icon: FaStethoscope },
    "EN ATENCION": { theme: "info", icon: FaStethoscope },
    "EN CURSO": { theme: "info", icon: FaInfoCircle },
    "PROCESADO": { theme: "info", icon: FaInfoCircle },
    "CONSULTA": { theme: "info", icon: FaStethoscope },

    // Categorías Especiales, Colores variados
    "CONTROL": { theme: "purple", icon: FaStethoscope },
    "URGENCIA": { theme: "purple", icon: FaStethoscope },
    "SERVICIO": { theme: "purple", icon: FaStethoscope },

    "ADMINISTRADOR": { theme: "indigo", icon: FaUserCircle },
    "EMPLEADO": { theme: "indigo", icon: FaUserCircle },
    "CLIENTE": { theme: "indigo", icon: FaUserCircle },

    "PSE": { theme: "cyan", icon: FaCreditCard },
    "TARJETA": { theme: "cyan", icon: FaCreditCard },
    "TRANSFERENCIA": { theme: "cyan", icon: FaCreditCard },
    "EFECTIVO": { theme: "cyan", icon: FaCreditCard },
};

/**
 * TEMAS_ESTILOS - Definición de estilos por tema
 */
const TEMAS_ESTILOS = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-red-50 text-red-700 border-red-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
    neutral: "bg-slate-50 text-slate-600 border-slate-200"
};

/**
 * StatusBadge - Componente unificado para todos los estados de la aplicación.
 * Aplicando principios SOLID: Responsabilidad Única y Abierto/Cerrado.
 */
export default function StatusBadge({ status, type, icon: IconOverride, className = "" }) {
    if (!status) return null;

    const s = String(status).toUpperCase();
    const config = STATUS_CONFIG[s] || { theme: "neutral", icon: FaInfoCircle };

    // El 'type' manual tiene prioridad sobre el tema mapeado, Polimorfismo
    const activeTheme = type || config.theme;

    // El 'IconOverride' manual tiene prioridad sobre el icono mapeado
    const IconComp = IconOverride || config.icon || FaInfoCircle;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm transition-all duration-200 hover:scale-[1.02] ${TEMAS_ESTILOS[activeTheme] || TEMAS_ESTILOS.neutral} ${className}`}>
            <IconComp className="text-[11px]" />
            {String(status).replace(/_/g, " ")}
        </span>
    );
}
