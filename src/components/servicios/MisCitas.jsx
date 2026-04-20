import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt, FaClock, FaHistory, FaCheckCircle,
  FaTimesCircle, FaHourglassHalf, FaStar, FaSignInAlt,
  FaTimes, FaFileInvoiceDollar, FaCalendarCheck, FaSpinner,
  FaBan, FaExclamationTriangle,
} from "react-icons/fa";
import {
  getMisCitas, actualizarEstadoCita, reprogramarCita, getHorariosOcupados,
} from "../../services/citaService";
import { useAuth } from "../../context/auth/AuthContext";
import toast from "react-hot-toast";

// ─── slot helpers ─────────────────────────────────────────────────────────────

const ALL_SLOTS = [];
for (let min = 8 * 60; min <= 16 * 60 + 30; min += 30) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  ALL_SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
}
const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const getSlotsForDuration = (dur) => ALL_SLOTS.filter((s) => toMin(s) + dur <= 17 * 60);
const isSlotOccupied = (slot, dur, occ) => {
  const s = toMin(slot); const e = s + dur;
  return occ.some(({ inicio, fin }) => toMin(inicio) < e && toMin(fin) > s);
};

// ─── date helpers ─────────────────────────────────────────────────────────────

const formatFecha = (iso) =>
  new Date(iso).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const formatHora = (iso) => {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};
const formatMoneda = (val) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

// ─── estado config ────────────────────────────────────────────────────────────

const ESTADO_CONFIG = {
  pendiente:   { label: "Pendiente",   Icon: FaHourglassHalf, bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-100"   },
  confirmada:  { label: "Confirmada",  Icon: FaCheckCircle,   bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-100"  },
  cancelada:   { label: "Cancelada",   Icon: FaTimesCircle,   bg: "bg-red-50",     text: "text-red-700",     border: "border-red-100"     },
  completada:  { label: "Completada",  Icon: FaStar,          bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  en_atencion: { label: "En Atención", Icon: FaCheckCircle,   bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-100"    },
  no_asistio:  { label: "No asistió",  Icon: FaTimesCircle,   bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200"   },
};
const getEstadoCfg = (estado) =>
  ESTADO_CONFIG[(estado ?? "").toLowerCase()] ?? ESTADO_CONFIG.pendiente;

const isUpcoming = (cita) => {
  const e = (cita.citEstado ?? "").toLowerCase();
  return (
    new Date(cita.citFecha) >= new Date() &&
    e !== "cancelada" && e !== "completada" && e !== "no_asistio"
  );
};

const canAct = (cita) => {
  const e = (cita.citEstado ?? "").toUpperCase();
  return ["PENDIENTE", "CONFIRMADA"].includes(e) && new Date(cita.citFecha) >= new Date();
};

const detectarMetodoPago = (cita) => {
  // 1. Relación directa (Nuevo flujo)
  let fac = cita.factura?.[0];

  // 2. Relación indirecta (Antiguo flujo vía encuesta)
  if (!fac) {
    fac = cita.encuesta?.[0]?.factura;
  }

  if (fac) {
    const condiciones = fac.facCondiciones || "";
    if (condiciones.includes("EFECTIVO")) return { metodo: "Efectivo", virtual: false };
    if (condiciones.includes("PSE") || condiciones.includes("TARJETA")) return { metodo: "PSE", virtual: true };
    return { metodo: "Procesado", virtual: true };
  }

  // 3. "Quemado" / Fallback para citas ya gestionadas
  const estado = (cita.citEstado ?? "").toUpperCase();
  if (["COMPLETADA", "EN_ATENCION", "CONFIRMADA"].includes(estado)) {
    return { metodo: "Procesado", virtual: false, fallback: true };
  }

  return null;
};

// ─── PagoBadge ────────────────────────────────────────────────────────────────

function PagoBadge({ cita }) {
  const pago = detectarMetodoPago(cita);
  
  if (!pago) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700 uppercase tracking-wider shadow-sm">
        <FaHourglassHalf className="text-[11px]" /> PAGO: Pendiente
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${
      pago.virtual ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100"
    }`}>
      {pago.virtual ? <FaFileInvoiceDollar className="text-[11px]" /> : <FaCheckCircle className="text-[11px]" />}
      PAGO: {pago.metodo}
    </span>
  );
}

// ─── CitaBadge ────────────────────────────────────────────────────────────────

function CitaBadge({ estado }) {
  const { label, Icon, bg, text, border } = getEstadoCfg(estado);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-sm ${bg} ${text} ${border}`}>
      <Icon className="text-[11px]" />{label}
    </span>
  );
}

// ─── CancelModal ──────────────────────────────────────────────────────────────

function CancelModal({ cita, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="bg-red-50 px-5 py-4 flex items-center gap-3 border-b border-red-100">
          <FaExclamationTriangle className="text-red-500 text-lg shrink-0" />
          <h3 className="font-bold text-red-900">Cancelar Cita</h3>
          <button onClick={onClose} className="ml-auto text-red-400 hover:text-red-600"><FaTimes /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-700">
            ¿Confirmas la cancelación de tu cita de <strong>{cita.citMotivo}</strong> el{" "}
            <span className="capitalize">{formatFecha(cita.citFecha)}</span> a las{" "}
            {formatHora(cita.citFecha)}?
          </p>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1.5">
            <p className="text-xs font-semibold text-amber-800">
              ¿Ya realizaste el pago de esta cita?
            </p>
            <p className="text-xs text-amber-700">
              Si es así, te recomendamos <strong>reprogramarla</strong> en lugar de cancelarla. Si definitivamente no deseas la cita, comunícate con nosotros:
            </p>
            <a
              href="mailto:project.optiluxe@gmail.com"
              className="block text-xs font-medium text-amber-900 underline underline-offset-2"
            >
              project.optiluxe@gmail.com
            </a>
          </div>
          <p className="text-xs text-slate-400">La cancelación no se puede deshacer.</p>
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Mantener
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <FaSpinner className="animate-spin" /> : "Sí, cancelar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ReprogramarModal ─────────────────────────────────────────────────────────

function ReprogramarModal({ cita, onClose, onConfirm, loading }) {
  const today = new Date().toISOString().split("T")[0];
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [ocupados, setOcupados] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const dur = cita.citDuracion;
  const validSlots = getSlotsForDuration(dur);

  useEffect(() => {
    if (!fecha) return;
    setLoadingSlots(true);
    setHora("");
    setOcupados([]);
    getHorariosOcupados(fecha)
      .then((d) => setOcupados(Array.isArray(d) ? d : []))
      .catch(() => setOcupados([]))
      .finally(() => setLoadingSlots(false));
  }, [fecha]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="bg-blue-50 px-5 py-4 flex items-center gap-3 border-b border-blue-100">
          <FaCalendarCheck className="text-blue-500 text-lg shrink-0" />
          <h3 className="font-bold text-blue-900">Reprogramar Cita</h3>
          <button onClick={onClose} className="ml-auto text-blue-400 hover:text-blue-600"><FaTimes /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-500">
            <strong>{cita.citMotivo}</strong> · {dur} min
          </p>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nueva fecha</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <FaCalendarAlt className="text-slate-400 text-sm" />
              </div>
              <input
                type="date"
                min={today}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Horario</label>
            {!fecha ? (
              <p className="text-sm text-slate-400 italic py-2">Selecciona primero una fecha.</p>
            ) : loadingSlots ? (
              <div className="flex items-center gap-2 py-4 text-slate-500 text-sm">
                <FaSpinner className="animate-spin" /> Consultando disponibilidad…
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {validSlots.map((slot) => {
                  const occ = isSlotOccupied(slot, dur, ocupados);
                  const sel = hora === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={occ}
                      onClick={() => !occ && setHora(slot)}
                      className={`relative rounded-lg border px-2 py-2 text-xs font-medium transition-all
                        ${occ
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through"
                          : sel
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                    >
                      {occ && <FaBan className="absolute top-0.5 right-0.5 text-[8px] text-slate-400" />}
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => fecha && hora && onConfirm(`${fecha}T${hora}:00.000Z`)}
              disabled={loading || !fecha || !hora}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <FaSpinner className="animate-spin" /> : "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FacturaModal ─────────────────────────────────────────────────────────────

function FacturaModal({ factura, citMotivo, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 flex items-center gap-3 border-b border-slate-100">
          <FaFileInvoiceDollar className="text-slate-500 text-lg shrink-0" />
          <h3 className="font-bold text-slate-900">Detalle de Factura</h3>
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600"><FaTimes /></button>
        </div>
        <div className="p-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 divide-y divide-slate-100">
            {[
              { label: "Número", value: `#${factura.facNumero}` },
              { label: "Servicio", value: citMotivo },
              {
                label: "Fecha",
                value: new Date(factura.facFecha).toLocaleDateString("es-CO", { dateStyle: "medium", timeZone: "UTC" }),
              },
              { label: "Total", value: formatMoneda(factura.facTotal), highlight: true },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex justify-between px-4 py-3">
                <span className="text-sm text-slate-500">{label}</span>
                <span className={`text-sm font-semibold ${highlight ? "text-blue-700" : "text-slate-900"}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CitaCardUpcoming ─────────────────────────────────────────────────────────

function CitaCardUpcoming({ cita, onCancel, onReprogramar }) {
  const showActions = canAct(cita);
  return (
    <div className="rounded-xl border border-blue-200 bg-linear-to-br from-blue-50 to-blue-100/50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="font-semibold text-blue-900 leading-tight">{cita.citMotivo}</p>
          <PagoBadge cita={cita} />
        </div>
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
      {showActions && (
        <div className="flex gap-2 pt-1 border-t border-blue-200">
          <button
            onClick={() => onReprogramar(cita)}
            className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 transition cursor-pointer"
          >
            Reprogramar
          </button>
          <button
            onClick={() => onCancel(cita)}
            className="flex-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

// ─── CitaRowHistory ───────────────────────────────────────────────────────────

function CitaRowHistory({ cita, onVerFactura }) {
  const factura = cita.factura?.[0];
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-0 overflow-hidden">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 truncate">{cita.citMotivo}</p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <p className="text-[10px] text-slate-400 font-bold capitalize">
            {formatFecha(cita.citFecha)} &middot; {formatHora(cita.citFecha)}
          </p>
          <PagoBadge cita={cita} />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {factura && (
          <button
            onClick={() => onVerFactura(factura, cita.citMotivo)}
            className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <FaFileInvoiceDollar className="text-[9px]" />
            Factura
          </button>
        )}
        <CitaBadge estado={cita.citEstado} />
      </div>
    </div>
  );
}

// ─── SkeletonCard ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-2/3" />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MisCitas({ refreshKey = 0, onRefresh }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [reprogramarTarget, setReprogramarTarget] = useState(null);
  const [facturaTarget, setFacturaTarget] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    getMisCitas()
      .then(setCitas)
      .catch(() => setCitas([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, refreshKey]);

  const handleCancelar = async () => {
    try {
      setActionLoading(true);
      await actualizarEstadoCita(cancelTarget.idCita, "CANCELADA");
      toast.success("Cita cancelada.");
      setCancelTarget(null);
      onRefresh?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "No se pudo cancelar la cita.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReprogramar = async (nuevaFechaISO) => {
    try {
      setActionLoading(true);
      await reprogramarCita(reprogramarTarget.idCita, nuevaFechaISO);
      toast.success("Cita reprogramada.");
      setReprogramarTarget(null);
      onRefresh?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "No se pudo reprogramar la cita.");
    } finally {
      setActionLoading(false);
    }
  };

  const proximas = citas.filter(isUpcoming);
  const historial = citas.filter((c) => !isUpcoming(c));

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
          <FaSignInAlt /> Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-white">
          <FaCalendarAlt className="text-blue-600" />
          <h2 className="font-bold text-slate-800">Mis Citas</h2>
        </div>

        <div className="p-5 space-y-6">
          {/* próxima cita */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Próxima Cita
            </p>
            {loading ? (
              <SkeletonCard />
            ) : proximas.length > 0 ? (
              <div className="space-y-3">
                {proximas.map((c) => (
                  <CitaCardUpcoming
                    key={c.idCita}
                    cita={c}
                    onCancel={setCancelTarget}
                    onReprogramar={setReprogramarTarget}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
                <FaCalendarAlt className="mx-auto text-slate-300 text-2xl mb-2" />
                <p className="text-sm text-slate-400">Sin citas programadas</p>
              </div>
            )}
          </div>

          {/* historial */}
          {(loading || historial.length > 0) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <FaHistory className="text-slate-300" /> Historial
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
                    <CitaRowHistory
                      key={c.idCita}
                      cita={c}
                      onVerFactura={(factura, citMotivo) => setFacturaTarget({ factura, citMotivo })}
                    />
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

      {cancelTarget && (
        <CancelModal
          cita={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancelar}
          loading={actionLoading}
        />
      )}
      {reprogramarTarget && (
        <ReprogramarModal
          cita={reprogramarTarget}
          onClose={() => setReprogramarTarget(null)}
          onConfirm={handleReprogramar}
          loading={actionLoading}
        />
      )}
      {facturaTarget && (
        <FacturaModal
          factura={facturaTarget.factura}
          citMotivo={facturaTarget.citMotivo}
          onClose={() => setFacturaTarget(null)}
        />
      )}
    </>
  );
}
