import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { services } from "../../config/servicesData";
import { registrarCita } from "../../services/citaService";
import { useAuth } from "../../context/auth/AuthContext";
import toast from "react-hot-toast";
import PagoCitaModal from "../cart/PagoCitaModal";
import EncuestaModal from "../encuesta/EncuestaModal";

const availableTimes = [
  "08:00", "09:00", "10:00", "11:00",
  "14:00", "15:00", "16:00", "17:00"
];

const AgendarCita = () => {
  const navigate = useNavigate();
  const { usuario, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    citMotivo: "",
    citFecha: "",
    citHora: "",
    citObservaciones: "",
    totalAPagar: ""
  });
  const [showPago, setShowPago] = useState(false);
  const [showEncuesta, setShowEncuesta] = useState(false);
  const [citaIdCreada, setCitaIdCreada] = useState(null);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const iniciarProcesoCita = (e) => {
    e?.preventDefault();
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agendar una cita.");
      return navigate("/login");
    }

    if (formData.totalAPagar !== "Servicio gratuito" && formData.totalAPagar !== "0") {
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
        fkIdUsuario: usuario?.idUsuario
      };

      await registrarCita(payload);
      toast.success("¡Cita agendada con éxito!");

      setStep(4);
    } catch (error) {
      toast.error(error.message || "Error al agendar la cita");
    } finally {
      setLoading(false);
      setShowPago(false);
    }
  };


  const Step1 = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <h2 className="text-2xl font-semibold text-slate-800">1. Selecciona un Servicio</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setFormData({ ...formData, citMotivo: service.title, totalAPagar: service.price });
              handleNext();
            }}
            className={`flex flex-col items-start rounded-xl border p-5 text-left transition-all ${formData.citMotivo === service.title
                ? "border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
          >
            <div className="flex w-full items-center justify-between">
              <span className="font-medium text-slate-900">{service.title}</span>
              {formData.citMotivo === service.title && (
                <FaCheckCircle className="text-blue-600" />
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">{service.description}</p>
            <div className="mt-4 flex items-center justify-between">
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
  );

  const Step2 = () => {

    const today = new Date().toISOString().split("T")[0];

    return (
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
                min={today}
                required
                value={formData.citFecha}
                onChange={(e) => setFormData({ ...formData, citFecha: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 pl-10 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Horario disponible</label>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setFormData({ ...formData, citHora: time })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${formData.citHora === time
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleBack}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Atrás
          </button>
          <button
            onClick={handleNext}
            disabled={!formData.citFecha || !formData.citHora}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  };


  const Step3 = () => (
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

      {!isAuthenticated && (
        <div className="rounded-lg bg-amber-50 p-4 flex gap-3 text-amber-800 text-sm">
          <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
          <p>
            Debes iniciar sesión para agendar la cita. Al confirmar, te redirigiremos a la página de inicio de sesión.
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleBack}
          type="button"
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Atrás
        </button>
        <button
          onClick={iniciarProcesoCita}
          disabled={loading}
          className="flex-1 rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Procesando..." : (formData.totalAPagar === "Servicio gratuito" ? "Confirmar Cita" : "Pagar y Confirmar")}
        </button>
      </div>
    </div>
  );


  const Step4 = () => (
    <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center animate-in zoom-in-95">
      <div className="rounded-full bg-green-100 p-4">
        <FaCheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800">¡Cita Agendada!</h2>
      <p className="max-w-md text-slate-500">
        Tu cita para <strong>{formData.citMotivo}</strong> el día <strong>{formData.citFecha}</strong> a las <strong>{formData.citHora}</strong> ha sido agendada con éxito.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
        <button
          onClick={() => setShowEncuesta(true)}
          className="rounded-lg bg-gradient-to-r from-[#1D3B8B] to-[#3B82F6] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition cursor-pointer"
        >
          📋 ¿Cómo fue tu experiencia?
        </button>
        <button
          onClick={() => navigate("/")}
          className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 cursor-pointer"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );

  return (
    <section className="bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8">
          <h1 className="text-center text-3xl font-bold text-slate-900">Programa tu Cita</h1>
          <p className="mt-2 text-center text-slate-500">
            Reserva tu espacio rápido y seguro. Sigue los pasos para agendar tu cita visual.
          </p>
        </div>

        {/* Progreso Visual */}
        {step < 4 && (
          <div className="mb-8 flex items-center justify-center gap-2">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${step >= num
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-500"
                    }`}
                >
                  {num}
                </div>
                {num !== 3 && (
                  <div
                    className={`h-1 w-12 sm:w-20 transition-colors ${step > num ? "bg-blue-600" : "bg-slate-200"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-10 border border-slate-100">
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
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
    </section>
  );
};

export default AgendarCita;
