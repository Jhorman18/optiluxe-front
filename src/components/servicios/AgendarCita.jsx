import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaBan, FaLock } from "react-icons/fa";
import { services } from "../../config/servicesData";
import { registrarCita, getHorariosOcupados, getTieneCitaActiva } from "../../services/citaService";
import { useAuth } from "../../context/auth/AuthContext";
import toast from "react-hot-toast";
import PagoCitaModal from "../cart/PagoCitaModal";
import EncuestaModal from "../encuesta/EncuestaModal";

// Slots de 30 minutos desde 08:00 hasta 16:30 (el más tardío que puede quedar
// dentro del horario según la duración mínima de 30 min → fin máx 17:00)
const ALL_SLOTS = [];
for (let min = 8 * 60; min <= 16 * 60 + 30; min += 30) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  ALL_SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
}

/** Convierte "HH:MM" → minutos desde medianoche */
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Slots válidos según duración: slot_inicio + duración ≤ 17:00 */
const getSlotsForDuration = (durationMinutes) =>
  ALL_SLOTS.filter((slot) => toMin(slot) + durationMinutes <= 17 * 60);

/** Verifica si un slot ya pasó (para el día de hoy en UTC) */
const isSlotPast = (slot, fecha) => {
  if (!fecha) return false;
  return new Date(`${fecha}T${slot}:00.000Z`) <= new Date();
};

/** Verifica si un slot se superpone con alguna cita existente.
 *  Regla: inicio_existente < nuevo_fin  AND  fin_existente > nuevo_inicio
 */
const isSlotOccupied = (slot, durationMinutes, occupiedRanges) => {
  const slotStart = toMin(slot);
  const slotEnd = slotStart + durationMinutes;
  return occupiedRanges.some(
    ({ inicio, fin }) => toMin(inicio) < slotEnd && toMin(fin) > slotStart
  );
};


const AgendarCita = ({ onCitaAgendada, refreshKey = 0 }) => {
  const navigate = useNavigate();
  const { usuario, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [occupiedRanges, setOccupiedRanges] = useState([]);
  const [citaActiva, setCitaActiva] = useState(null);
  const [loadingCitaActiva, setLoadingCitaActiva] = useState(false);
  const [formData, setFormData] = useState({
    citMotivo: "",
    citFecha: "",
    citHora: "",
    citObservaciones: "",
    totalAPagar: "",
    durationMinutes: 30,
  });
  const [showPago, setShowPago] = useState(false);
  const [showEncuesta, setShowEncuesta] = useState(false);
  const [citaIdCreada, setCitaIdCreada] = useState(null);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  // Verifica si el usuario ya tiene una cita activa (futura, no cancelada)
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingCitaActiva(true);
    getTieneCitaActiva()
      .then(({ cita }) => setCitaActiva(cita ?? null))
      .catch(() => setCitaActiva(null))
      .finally(() => setLoadingCitaActiva(false));
  }, [isAuthenticated, refreshKey]);

  // Carga los horarios ocupados del backend cada vez que cambia la fecha
  // y estamos en el paso 2
  useEffect(() => {
    if (step !== 2 || !formData.citFecha) return;

    setLoadingSlots(true);
    setOccupiedRanges([]);

    getHorariosOcupados(formData.citFecha)
      .then((data) => setOccupiedRanges(Array.isArray(data) ? data : []))
      .catch(() => {
        // Si el endpoint aún no está disponible, continúa sin bloquear slots
        setOccupiedRanges([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [formData.citFecha, step]);

  const iniciarProcesoCita = (e) => {
    e?.preventDefault();
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agendar una cita.");
      return navigate("/login");
    }

    if (
      formData.totalAPagar !== "Servicio gratuito" &&
      formData.totalAPagar !== "0"
    ) {
      setShowPago(true);
    } else {
      procesarCitaBackend("Gratuito");
    }
  };

  const procesarCitaBackend = async (metodoPago) => {
    try {
      setLoading(true);

      const dateTimeString = `${formData.citFecha}T${formData.citHora}:00.000Z`;

      const payload = {
        citMotivo: formData.citMotivo,
        citFecha: dateTimeString,
        citEstado: "Pendiente",
        citObservaciones: formData.citObservaciones,
        citDuracion: formData.durationMinutes,
        fkIdUsuario: usuario?.id,
      };

      if (metodoPago && metodoPago !== "Gratuito") {
        const valorNumerico = parseFloat(formData.totalAPagar.replace(/[^\d.-]/g, ''));
        payload.pago = {
          metodo: metodoPago,
          estado: "Aprobado",
          totalAPagar: valorNumerico
        };
      }

       const response = await registrarCita(payload);
      const idCita = response.data?.cita?.idCita;
      if (idCita) setCitaIdCreada(idCita);

      toast.success("¡Cita agendada con éxito!");
      // Actualiza el estado de cita activa y notifica al panel MisCitas
      getTieneCitaActiva().then(({ cita }) => setCitaActiva(cita ?? null)).catch(() => { });
      onCitaAgendada?.();
      setStep(4);
      // El usuario podrá elegir responder la encuesta en el Paso 4 (Opcional)
      setShowPago(false);
      return idCita;
    } catch (error) {
      toast.error(error.message || "Error al agendar la cita");
    } finally {
      setLoading(false);
      setShowPago(false);
    }
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  // Skeleton mientras se verifica cita activa
  if (loadingCitaActiva) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-8 space-y-4 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto" />
        <div className="h-4 bg-slate-100 rounded w-2/3 mx-auto" />
        <div className="h-32 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  // Bloqueo: usuario autenticado con cita activa (solo si no estamos en el paso de éxito)
  if (isAuthenticated && citaActiva && step !== 4) {
    return (
      <div className="rounded-2xl bg-white border border-amber-200 shadow-sm overflow-hidden">
        <div className="bg-amber-50 px-6 py-5 flex items-center gap-3">
          <div className="rounded-full bg-amber-100 p-2.5 shrink-0">
            <FaLock className="text-amber-600 text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900">Ya tienes una cita activa</h3>
            <p className="text-sm text-amber-700 mt-0.5">
              No puedes agendar una nueva cita hasta que la actual sea completada o cancelada.
              Puedes cancelarla o reprogramarla desde el panel <strong>Mis Citas</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Título y descripción */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Programa tu Cita</h2>
        <p className="mt-1 text-slate-500 text-sm">
          Reserva tu espacio rápido y seguro. Sigue los pasos a continuación.
        </p>
      </div>

      {/* Progreso visual */}
      {step < 4 && (
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${step >= num ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
              >
                {num}
              </div>
              {num !== 3 && (
                <div
                  className={`h-1 w-12 sm:w-16 transition-colors ${step > num ? "bg-blue-600" : "bg-slate-200"
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8 border border-slate-100">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h2 className="text-2xl font-semibold text-slate-800">1. Selecciona un Servicio</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      citMotivo: service.title,
                      totalAPagar: service.price,
                      durationMinutes: service.durationMinutes,
                      citHora: "",
                    });
                    handleNext();
                  }}
                  className={`flex flex-col items-start rounded-xl border p-5 text-left transition-all ${formData.citMotivo === service.title
                    ? "border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium text-slate-900">{service.title}</span>
                    {formData.citMotivo === service.title && <FaCheckCircle className="text-blue-600" />}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{service.description}</p>
                  <div className="mt-4 flex items-center justify-between w-full">
                    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <FaClock className="mr-1.5 inline h-3 w-3" /> {service.duration}
                    </span>
                    <span className={`text-sm font-semibold ${service.price === "Servicio gratuito" ? "text-green-600" : "text-blue-700"}`}>
                      {service.price}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h2 className="text-2xl font-semibold text-slate-800">2. Escoge Fecha y Hora</h2>
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Fecha de la cita</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <FaCalendarAlt className="text-slate-400" />
                  </div>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    required
                    value={formData.citFecha}
                    onChange={(e) => setFormData({ ...formData, citFecha: e.target.value, citHora: "" })}
                    className="block w-full rounded-lg border border-slate-300 pl-10 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Horario disponible</label>
                  <span className="text-xs text-slate-400">Duración: {formData.durationMinutes} min</span>
                </div>
                {!formData.citFecha ? (
                  <p className="text-sm text-slate-400 italic py-4">Selecciona primero una fecha para ver los horarios.</p>
                ) : loadingSlots ? (
                  <div className="flex items-center gap-2 py-6 text-slate-500 text-sm">
                    <FaSpinner className="animate-spin" />
                    Consultando disponibilidad…
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {getSlotsForDuration(formData.durationMinutes).map((slot) => {
                      const occupied = isSlotOccupied(slot, formData.durationMinutes, occupiedRanges) || isSlotPast(slot, formData.citFecha);
                      const selected = formData.citHora === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={occupied}
                          onClick={() => setFormData({ ...formData, citHora: slot })}
                          className={`relative rounded-lg border px-3 py-2 text-sm font-medium transition-all ${occupied
                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through"
                            : selected
                              ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                            }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={handleBack} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Atrás</button>
              <button onClick={handleNext} disabled={!formData.citFecha || !formData.citHora || loadingSlots} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Continuar</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h2 className="text-2xl font-semibold text-slate-800">3. Confirma tu Cita</h2>
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6">
              <h3 className="text-sm font-medium uppercase tracking-wider text-blue-800">Resumen</h3>
              <ul className="mt-4 flex flex-col gap-3">
                <li className="flex justify-between border-b border-blue-100 pb-2">
                  <span className="text-slate-600">Servicio</span>
                  <span className="font-medium text-slate-900">{formData.citMotivo}</span>
                </li>
                <li className="flex justify-between border-b border-blue-100 pb-2">
                  <span className="text-slate-600">Fecha</span>
                  <span className="font-medium text-slate-900">{formData.citFecha}</span>
                </li>
                <li className="flex justify-between border-b border-blue-100 pb-2">
                  <span className="text-slate-600">Hora</span>
                  <span className="font-medium text-slate-900">{formData.citHora}</span>
                </li>
                <li className="flex justify-between pt-1">
                  <span className="text-slate-600 font-semibold">Valor del Servicio</span>
                  <span className={`font-bold ${formData.totalAPagar === "Servicio gratuito" ? "text-green-600" : "text-blue-700"}`}>
                    {formData.totalAPagar}
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Observaciones (Opcional)</label>
              <textarea
                rows={3}
                value={formData.citObservaciones}
                onChange={(e) => setFormData({ ...formData, citObservaciones: e.target.value })}
                placeholder="Ej: Tengo sensibilidad a la luz últimamente..."
                className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={handleBack} disabled={loading} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Atrás</button>
              <button onClick={iniciarProcesoCita} disabled={loading} className="flex-1 rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? "Procesando..." : formData.totalAPagar === "Servicio gratuito" ? "Confirmar Cita" : "Pagar y Confirmar"}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center animate-in zoom-in-95">
            <div className="rounded-full bg-green-100 p-4">
              <FaCheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">¡Cita Agendada!</h2>
            <p className="max-w-md text-slate-500">
              Tu cita para <strong>{formData.citMotivo}</strong> el día <strong>{formData.citFecha}</strong> a las <strong>{formData.citHora}</strong> ha sido agendada con éxito.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
              <button onClick={() => setShowEncuesta(true)} className="rounded-lg bg-gradient-to-r from-[#1D3B8B] to-[#3B82F6] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition cursor-pointer">📋 ¿Cómo fue tu experiencia?</button>
              <button onClick={() => navigate("/")} className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 cursor-pointer">Volver al Inicio</button>
            </div>
          </div>
        )}
      </div>

      {showPago && (
        <PagoCitaModal
          onClose={() => setShowPago(false)}
          totalAPagar={formData.totalAPagar}
          onConfirmar={procesarCitaBackend}
        />
      )}

      {showEncuesta && (
        <EncuestaModal
          categoria="cita"
          fkIdCita={citaIdCreada}
          fkIdFactura={null}
          onClose={() => setShowEncuesta(false)}
        />
      )}
    </div>
  );
};

export default AgendarCita;
