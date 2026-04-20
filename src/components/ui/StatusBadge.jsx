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
 * StatusBadge - Unified component for all statuses across the app.
 */
export default function StatusBadge({ status, type, icon: IconOverride, className = "" }) {
    if (!status) return null;

    const s = String(status).toUpperCase();

    // 1. Determine theme based on status or type
    let theme = type;

    if (!theme) {
        if (["PAGADA", "ACTIVO", "ENVIADA", "COMPLETADA", "EXITOSO", "VALIDO", "CONFIRMADA", "LEIDO", "RESPONDIDO"].includes(s)) {
            theme = "success";
        } else if (["PENDIENTE", "PROCESANDO", "EN PROCESO", "ESPERA"].includes(s)) {
            theme = "warning";
        } else if (["ANULADA", "INACTIVO", "CANCELADA", "FALLIDA", "RECHAZADA", "ELIMINADA", "NO_ASISTIO"].includes(s)) {
            theme = "error";
        } else if (["EN_ATENCION", "EN CURSO", "PROCESADO", "CONFIRMADA"].includes(s)) {
            theme = "info";
        } else if (["CONSULTA", "CONTROL", "URGENCIA", "SERVICIO"].includes(s)) {
            theme = "purple";
        } else if (["ADMINISTRADOR", "EMPLEADO", "CLIENTE"].includes(s)) {
            theme = "indigo";
        } else if (["PSE", "TARJETA", "TRANSFERENCIA", "EFECTIVO"].includes(s)) {
            theme = "cyan";
        } else {
            theme = "neutral";
        }
    }

    // 2. Select styles based on theme
    const themes = {
        success: "bg-emerald-50 text-emerald-700 border-emerald-100",
        warning: "bg-amber-50 text-amber-700 border-amber-100",
        error: "bg-red-50 text-red-700 border-red-100",
        info: "bg-blue-50 text-blue-700 border-blue-100",
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
        purple: "bg-purple-50 text-purple-700 border-purple-100",
        cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
        neutral: "bg-slate-50 text-slate-600 border-slate-200"
    };

    // 3. Select icon based on theme/status
    const getIcon = () => {
        if (IconOverride) return IconOverride;
        
        switch (theme) {
            case "success": return FaCheckCircle;
            case "error": return FaTimesCircle;
            case "warning": return FaHourglassHalf;
            case "info": return FaInfoCircle;
            case "indigo": return FaUserCircle;
            case "purple": return FaStethoscope;
            case "cyan": return FaCreditCard;
            default:
                if (s.includes("EN_ATENCION")) return FaStethoscope;
                if (s.includes("COMPLETADA")) return FaStar;
                return FaInfoCircle;
        }
    };

    const IconComp = getIcon() || FaInfoCircle;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm transition-all duration-200 hover:scale-[1.02] ${themes[theme] || themes.neutral} ${className}`}>
            <IconComp className="text-[11px]" />
            {String(status)}
        </span>
    );
}
