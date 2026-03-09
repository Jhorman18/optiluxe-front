import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt, FaClock, FaHistory, FaCheckCircle,
  FaTimesCircle, FaHourglassHalf, FaStar, FaSignInAlt,
} from "react-icons/fa";
import { getMisCitas } from "../../services/citaService";
import { useAuth } from "../../context/auth/AuthContext";

// ─── helpers ─────────────────────────────────────────────────────────────────

const formatFecha = (iso) => {
  const d = new Date(iso);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toLocaleDateString("es-CO", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
};

const formatHora = (iso) => {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

const ESTADO_CONFIG = {
  pendiente:  { label: "Pendiente",  Icon: FaHourglassHalf, bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  confirmada: { label: "Confirmada", Icon: FaCheckCircle,   bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  cancelada:  { label: "Cancelada",  Icon: FaTimesCircle,   bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"    },
  completada: { label: "Completada", Icon: FaStar,          bg: "bg-slate-50",  text: "text-slate-500",  border: "border-slate-200"  },
};

const getEstadoCfg = (estado) =>
  ESTADO_CONFIG[(estado ?? "").toLowerCase()] ?? ESTADO_CONFIG.pendiente;

const isUpcoming = (cita) => {
  const e = (cita.citEstado ?? "").toLowerCase();
  return new Date(cita.citFecha) >= new Date() && e !== "cancelada" && e !== "completada";
};

// ─── sub-componentes ─────────────────────────────────────────────────────────

function CitaBadge({ estado }) {
  const { label, Icon, bg, text, border } = getEstadoCfg(estado);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${bg} ${text} ${border}`}>
      <Icon className="text-[10px]" />
      {label}
    </span>
  );
}

function CitaCardUpcoming({ cita }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-blue-900 leading-tight">{cita.citMotivo}</p>
        <CitaBadge estado={cita.citEstado} />
      </div>
      <div className="flex flex-col gap-1.5 text-sm text-blue-800">
        <span className="flex items-center gap-2">
          <FaCalendarAlt className="shrink-0 text-blue-400" />
          <span className="capitalize">{formatFecha(cita.citFecha)}</span>
        </span>
        <span className="flex items-center gap-2">
          <FaClock className="shrink-0 text-blue-400" />
          {formatHora(cita.citFecha)} &middot; {cita.citDuracion} min
        </span>
      </div>
      {cita.citObservaciones && (
        <p className="text-xs text-blue-700/60 border-t border-blue-200 pt-2 italic line-clamp-2">
          &ldquo;{cita.citObservaciones}&rdquo;
        </p>
      )}
    </div>
  );
}

function CitaRowHistory({ cita }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{cita.citMotivo}</p>
        <p className="text-xs text-slate-400 mt-0.5 capitalize">
          {formatFecha(cita.citFecha)} &middot; {formatHora(cita.citFecha)}
        </p>
      </div>
      <CitaBadge estado={cita.citEstado} />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-2/3" />
    </div>
  );
}

// ─── componente principal ─────────────────────────────────────────────────────

export default function MisCitas({ refreshKey = 0 }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    getMisCitas()
      .then(setCitas)
      .catch(() => setCitas([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, refreshKey]);

  const proximas = citas.filter(isUpcoming);
  const historial = citas.filter((c) => !isUpcoming(c));

  // ── sin autenticar ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center text-center gap-4">
        <div className="rounded-full bg-blue-50 p-4">
          <FaCalendarAlt className="h-8 w-8 text-blue-500" />
        </div>
        <div>
          <p className="font-semibold text-slate-800">Mis Citas</p>
          <p className="text-sm text-slate-500 mt-1">
            Inicia sesión para ver tu historial y próximas citas.
          </p>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          <FaSignInAlt />
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-white">
        <FaCalendarAlt className="text-blue-600" />
        <h2 className="font-bold text-slate-800">Mis Citas</h2>
      </div>

      <div className="p-5 space-y-6">

        {/* ── próxima cita ──────────────────────────────────── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Próxima Cita
          </p>
          {loading ? (
            <SkeletonCard />
          ) : proximas.length > 0 ? (
            <div className="space-y-3">
              {proximas.map((c) => (
                <CitaCardUpcoming key={c.idCita} cita={c} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
              <FaCalendarAlt className="mx-auto text-slate-300 text-2xl mb-2" />
              <p className="text-sm text-slate-400">Sin citas programadas</p>
            </div>
          )}
        </div>

        {/* ── historial ─────────────────────────────────────── */}
        {(loading || historial.length > 0) && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FaHistory className="text-slate-300" />
              Historial
            </p>
            {loading ? (
              <div className="space-y-1">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse flex justify-between py-3 border-b border-slate-100">
                    <div className="space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded w-32" />
                      <div className="h-2.5 bg-slate-100 rounded w-24" />
                    </div>
                    <div className="h-5 bg-slate-100 rounded-full w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {historial.slice(0, 5).map((c) => (
                  <CitaRowHistory key={c.idCita} cita={c} />
                ))}
                {historial.length > 5 && (
                  <p className="text-xs text-slate-400 text-center pt-3">
                    +{historial.length - 5} citas anteriores
                  </p>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
