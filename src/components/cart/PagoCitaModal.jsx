import { useState, useEffect } from "react";
import {
  FaTimes,
  FaUniversity,
  FaMoneyBillWave,
  FaCheckCircle,
  FaSpinner,
  FaChevronLeft,
} from "react-icons/fa";

const BANCOS = [
  "Bancolombia",
  "Davivienda",
  "Banco de Bogotá",
  "BBVA Colombia",
  "Nequi",
  "Banco Popular",
];

export default function PagoCitaModal({ onClose, totalAPagar, onConfirmar }) {
  const [step, setStep] = useState("select");
  const [metodo, setMetodo] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const [banco, setBanco] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("ahorros");
  const [numeroCuenta, setNumeroCuenta] = useState("");

  useEffect(() => {
    if (banco === "Nequi") {
      setTipoCuenta("nequi");
    } else if (tipoCuenta === "nequi") {
      setTipoCuenta("ahorros");
    }
  }, [banco]);

  const seleccionarMetodo = (id) => {
    setMetodo(id);
    if (id === "EFECTIVO") {
      procesarPago(id);
    } else {
      setStep("form");
      setError("");
    }
  };

  const confirmarPago = () => {
    if (!banco || !numeroCuenta) {
      setError("Completa todos los campos para continuar.");
      return;
    }
    if (banco === "Nequi" && numeroCuenta.length !== 10) {
      setError("Nequi debe tener 10 dígitos (número celular).");
      return;
    }
    if (banco !== "Nequi" && numeroCuenta.length !== 11) {
      setError("La cuenta bancaria debe tener 11 dígitos.");
      return;
    }
    procesarPago("PSE");
  };

  const procesarPago = async (metodoElegido) => {
    setError("");
    setProcesando(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await onConfirmar(metodoElegido);
      setStep("success");
    } catch (err) {
      setError(err?.message || "Error al procesar el pago. Inténtalo de nuevo.");
      if (metodoElegido === "EFECTIVO") setStep("select");
    } finally {
      setProcesando(false);
    }
  };

  const renderSelect = () => (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
        <p className="text-sm text-blue-800 font-medium">
          Este servicio tiene un costo asociado para poder agendar su cita.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Total a pagar:{" "}
          <span className="font-bold text-blue-700 text-base">{totalAPagar}</span>
        </p>
      </div>

      {procesando ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600 font-medium">Agendando tu cita...</p>
        </div>
      ) : (
        <>
          <button
            onClick={() => seleccionarMetodo("PSE")}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-blue-100 hover:border-blue-400 bg-blue-50 transition cursor-pointer text-left hover:shadow-md"
          >
            <div className="p-3 rounded-xl bg-blue-600">
              <FaUniversity className="text-white text-xl" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">PSE</p>
              <p className="text-xs text-gray-500">Débito bancario en línea</p>
            </div>
          </button>

          <button
            onClick={() => seleccionarMetodo("EFECTIVO")}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-green-100 hover:border-green-400 bg-green-50 transition cursor-pointer text-left hover:shadow-md"
          >
            <div className="p-3 rounded-xl bg-green-600">
              <FaMoneyBillWave className="text-white text-xl" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Pago en Sede</p>
              <p className="text-xs text-gray-500">Paga al asistir a tu cita</p>
            </div>
          </button>
        </>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
          {error}
        </p>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Banco</label>
        <select
          value={banco}
          onChange={(e) => setBanco(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Selecciona tu banco</option>
          {BANCOS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {banco && banco !== "Nequi" && (
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Tipo de cuenta</label>
          <div className="flex gap-3">
            {["ahorros", "corriente"].map((tipo) => (
              <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipoCuentaCita"
                  value={tipo}
                  checked={tipoCuenta === tipo}
                  onChange={() => setTipoCuenta(tipo)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700 capitalize">{tipo}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">
          {banco === "Nequi" ? "Número celular" : "Número de cuenta"}
        </label>
        <input
          type="text"
          value={numeroCuenta}
          onChange={(e) => setNumeroCuenta(e.target.value.replace(/\D/g, ""))}
          placeholder={banco === "Nequi" ? "Ej: 3001234567" : "Ej: 12345678901"}
          maxLength={banco === "Nequi" ? 10 : 11}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <p className="text-xs text-gray-500 mt-1">
          {banco === "Nequi"
            ? "Ingresa tu número celular registrado en Nequi."
            : "Ingresa tu número de cuenta bancaria."}
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={confirmarPago}
        disabled={procesando}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
      >
        {procesando ? (
          <>
            <FaSpinner className="animate-spin" />
            Agendando cita...
          </>
        ) : (
          `Pagar ${totalAPagar}`
        )}
      </button>
    </div>
  );


  const renderSuccess = () => (
    <div className="text-center space-y-4 py-2">
      <FaCheckCircle className="text-green-500 text-5xl mx-auto" />
      <div>
        <p className="text-lg font-bold text-gray-900">¡Transacción Exitosa!</p>
        <p className="text-sm text-gray-500 mt-1">
          El valor del servicio ha sido saldado y tu cita confirmada.
        </p>
      </div>
      <button
        onClick={onClose}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
      >
        Ver Resumen
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {step === "form" && (
              <button
                onClick={() => { setStep("select"); setError(""); }}
                className="text-gray-400 hover:text-gray-600 transition mr-1 cursor-pointer"
              >
                <FaChevronLeft />
              </button>
            )}
            <h2 className="font-bold text-gray-900 text-lg">
              {step === "select" && "Valor del Servicio"}
              {step === "form" && "Pago con PSE"}
              {step === "success" && "¡Pago confirmado!"}
            </h2>
          </div>
          {step !== "success" && (
            <button
              onClick={onClose}
              disabled={procesando}
              className="text-gray-400 hover:text-gray-600 transition cursor-pointer disabled:opacity-50"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {step === "select" && renderSelect()}
          {step === "form" && renderForm()}
          {step === "success" && renderSuccess()}
        </div>
      </div>
    </div>
  );
}
