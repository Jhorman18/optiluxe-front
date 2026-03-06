import { useState, useEffect } from "react";
import {
  FaTimes,
  FaUniversity,
  FaMoneyBillWave,
  FaCheckCircle,
  FaSpinner,
  FaChevronLeft,
} from "react-icons/fa";
import { useCart } from "../../context/cart/CartContext.jsx";
import EncuestaModal from "../encuesta/EncuestaModal";

const BANCOS = [
  "Bancolombia",
  "Davivienda",
  "Banco de Bogotá",
  "BBVA Colombia",
  "Nequi",
  "Banco Popular",
];

export default function PagoModal({ onClose }) {
  const { carrito, pagarCarrito } = useCart();
  const [step, setStep] = useState("select");
  const [metodo, setMetodo] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [factura, setFactura] = useState(null);
  const [error, setError] = useState("");
  const [showEncuesta, setShowEncuesta] = useState(false);

  const [banco, setBanco] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("ahorros");
  const [numeroCuenta, setNumeroCuenta] = useState("");

  const totalCarrito = carrito?.total || 0;

  useEffect(() => {
    if (banco === "Nequi") {
      setTipoCuenta("nequi");
    } else if (tipoCuenta === "nequi") {
      setTipoCuenta("ahorros");
    }
  }, [banco]);

  const seleccionarMetodo = (id) => {
    setMetodo(id);
    setStep("form");
    setError("");
  };

  const confirmarPago = async () => {
    if (metodo === "PSE") {
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
    }

    setError("");
    setProcesando(true);
    try {
      const resultado = await pagarCarrito(metodo);
      setFactura(resultado);
      setStep("success");
    } catch (err) {
      setError(err?.response?.data?.message || "Error al procesar el pago. Inténtalo de nuevo.");
    } finally {
      setProcesando(false);
    }
  };

  // ── RENDER: Selección de método ───────────────────────────────
  const renderSelect = () => (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">
        Total a pagar:{" "}
        <span className="font-bold text-blue-700 text-base">
          ${Math.round(totalCarrito).toLocaleString()}
        </span>
      </p>

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
          <p className="font-semibold text-gray-900">Efectivo</p>
          <p className="text-xs text-gray-500">Pago al recoger en sede</p>
        </div>
      </button>
    </div>
  );

  // ── RENDER: Formulario ────────────────────────────────────────
  const renderForm = () => (
    <div className="space-y-4">
      {metodo === "PSE" ? (
        <>
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
                      name="tipoCuentaCarrito"
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
                ? "Ingresa tu número celular registrado en Nequi (10 dígitos)."
                : "Ingresa tu número de cuenta bancaria (11 dígitos)."}
            </p>
          </div>
        </>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-green-800">Instrucciones de pago</p>
          <p className="text-sm text-green-700">
            Tu pedido quedará reservado. Podrás pagar en efectivo al recoger tus productos en nuestra sede.
          </p>
        </div>
      )}

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
            Procesando pago...
          </>
        ) : (
          `Pagar $${Math.round(totalCarrito).toLocaleString()}`
        )}
      </button>
    </div>
  );

  // ── RENDER: Éxito ─────────────────────────────────────────────
  const renderSuccess = () => {
    if (!factura) return null;
    return (
      <div className="text-center space-y-4 py-2">
        <FaCheckCircle className="text-green-500 text-5xl mx-auto" />
        <div>
          <p className="text-lg font-bold text-gray-900">¡Pago procesado con éxito!</p>
          <p className="text-sm text-gray-500 mt-1">Tu pedido ha sido confirmado</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Número de factura</span>
            <span className="font-bold text-blue-700">{factura.facNumero}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Método</span>
            <span className="font-medium text-gray-900">
              {factura.metodoPago === "PSE" ? "PSE" : "Efectivo"}
            </span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total pagado</span>
            <span className="text-green-600">${Math.round(factura.total).toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={() => setShowEncuesta(true)}
          className="w-full bg-gradient-to-r from-[#1D3B8B] to-[#3B82F6] hover:opacity-90 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
        >
          📋 ¿Cómo fue tu experiencia?
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    );
  };

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
              {step === "select" && "Selecciona el método de pago"}
              {step === "form" && (metodo === "PSE" ? "Pago con PSE" : "Pago en efectivo")}
              {step === "success" && "¡Pago confirmado!"}
            </h2>
          </div>
          {step !== "success" && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
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

      {showEncuesta && (
        <EncuestaModal
          categoria="compra"
          fkIdCita={null}
          fkIdFactura={factura?.idFactura || null}
          onClose={() => setShowEncuesta(false)}
        />
      )}
    </div>
  );
}