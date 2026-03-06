import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaStar,
  FaRegStar,
  FaCheckCircle,
  FaSpinner,
  FaClipboardList,
} from "react-icons/fa";
import { enviarEncuesta } from "../../services/encuestaService";
import toast from "react-hot-toast";


const PREGUNTAS_CITA = [
  {
    idPregunta: 1,
    preTexto: "¿Cómo calificarías tu experiencia agendando la cita?",
    preTipo: "estrellas",
    preCategoria: "cita",
  },
  {
    idPregunta: 2,
    preTexto: "¿Habías agendado una cita con OptiLuxe anteriormente?",
    preTipo: "si_no",
    preCategoria: "cita",
  },
  {
    idPregunta: 3,
    preTexto: "¿Qué tan fácil fue el proceso de agendamiento?",
    preTipo: "seleccion",
    preCategoria: "cita",
    opciones: ["Muy fácil", "Fácil", "Normal", "Difícil"],
  },
  {
    idPregunta: 4,
    preTexto: "¿Recomendarías nuestros servicios a familiares o amigos?",
    preTipo: "si_no",
    preCategoria: "cita",
  },
  {
    idPregunta: 5,
    preTexto: "¿Tienes algún comentario para mejorar nuestro servicio?",
    preTipo: "texto",
    preCategoria: "cita",
  },
];

const PREGUNTAS_COMPRA = [
  {
    idPregunta: 6,
    preTexto: "¿Cómo calificarías tu experiencia de compra en OptiLuxe?",
    preTipo: "estrellas",
    preCategoria: "compra",
  },
  {
    idPregunta: 7,
    preTexto: "¿Habías comprado productos en OptiLuxe anteriormente?",
    preTipo: "si_no",
    preCategoria: "compra",
  },
  {
    idPregunta: 8,
    preTexto: "¿Cómo conociste a OptiLuxe?",
    preTipo: "seleccion",
    preCategoria: "compra",
    opciones: ["Redes sociales", "Recomendación", "Búsqueda en internet", "Publicidad", "Otro"],
  },
  {
    idPregunta: 9,
    preTexto: "¿Recomendarías nuestros productos a familiares o amigos?",
    preTipo: "si_no",
    preCategoria: "compra",
  },
  {
    idPregunta: 10,
    preTexto: "¿Tienes algún comentario para mejorar tu experiencia de compra?",
    preTipo: "texto",
    preCategoria: "compra",
  },
];



const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(String(star))}
        className="text-2xl transition-transform hover:scale-110 cursor-pointer"
      >
        {Number(value) >= star ? (
          <FaStar className="text-amber-400" />
        ) : (
          <FaRegStar className="text-gray-300" />
        )}
      </button>
    ))}
    {value && (
      <span className="ml-2 text-sm font-medium text-gray-500 self-center">
        {value}/5
      </span>
    )}
  </div>
);

const SiNoButtons = ({ value, onChange }) => (
  <div className="flex gap-3">
    {["Sí", "No"].map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition cursor-pointer ${value === opt
          ? "border-blue-600 bg-blue-50 text-blue-700"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

const SeleccionButtons = ({ value, onChange, opciones }) => (
  <div className="flex flex-wrap gap-2">
    {opciones.map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={`rounded-lg border px-3 py-2 text-sm font-medium transition cursor-pointer ${value === opt
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

const TextInput = ({ value, onChange }) => (
  <textarea
    rows={3}
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Escribe tu respuesta aquí..."
    className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
  />
);



/**
 * @param {Object} props
 * @param {"cita"|"compra"} props.categoria - Tipo de encuesta
 * @param {number|null} props.fkIdCita - ID de la cita asociada
 * @param {number|null} props.fkIdFactura - ID de la factura asociada
 * @param {Function} props.onClose - Callback al cerrar el modal
 */
export default function EncuestaModal({ categoria, fkIdCita, fkIdFactura, onClose }) {
  const navigate = useNavigate();
  const preguntas = categoria === "cita" ? PREGUNTAS_CITA : PREGUNTAS_COMPRA;


  const [respuestas, setRespuestas] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const preguntaActual = preguntas[currentStep];
  const totalPreguntas = preguntas.length;
  const progreso = ((currentStep + 1) / totalPreguntas) * 100;

  const setRespuesta = (idPregunta, valor) => {
    setRespuestas((prev) => ({ ...prev, [idPregunta]: valor }));
  };

  const puedeAvanzar = respuestas[preguntaActual?.idPregunta] !== undefined &&
    respuestas[preguntaActual?.idPregunta] !== "";

  const handleEnviar = async () => {
    setEnviando(true);
    try {
      const payload = {
        enTipo: categoria === "cita" ? "Satisfacción Cita" : "Satisfacción Compra",
        fkIdCita: fkIdCita || null,
        fkIdFactura: fkIdFactura || null,
        respuestas: Object.entries(respuestas).map(([idPregunta, resValor]) => ({
          fkIdPregunta: Number(idPregunta),
          resValor: String(resValor),
        })),
      };

      await enviarEncuesta(payload);
      setEnviado(true);
      toast.success("¡Gracias por tu opinión!");
    } catch (error) {

      console.error("Error enviando encuesta:", error);
      setEnviado(true);
      toast.success("¡Gracias por tu opinión!");
    } finally {
      setEnviando(false);
    }
  };

  const renderPregunta = (pregunta) => {
    const valor = respuestas[pregunta.idPregunta] || "";

    switch (pregunta.preTipo) {
      case "estrellas":
        return <StarRating value={valor} onChange={(v) => setRespuesta(pregunta.idPregunta, v)} />;
      case "si_no":
        return <SiNoButtons value={valor} onChange={(v) => setRespuesta(pregunta.idPregunta, v)} />;
      case "seleccion":
        return (
          <SeleccionButtons
            value={valor}
            onChange={(v) => setRespuesta(pregunta.idPregunta, v)}
            opciones={pregunta.opciones || []}
          />
        );
      case "texto":
        return <TextInput value={valor} onChange={(v) => setRespuesta(pregunta.idPregunta, v)} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#1D3B8B] to-[#3B82F6] px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaClipboardList className="text-lg" />
              <h2 className="font-bold text-lg">
                {enviado ? "¡Encuesta Completada!" : "Tu opinión importa"}
              </h2>
            </div>
          </div>
          {!enviado && (
            <p className="text-sm text-white/80 mt-1">
              {categoria === "cita"
                ? "Cuéntanos cómo fue tu experiencia agendando tu cita"
                : "Cuéntanos cómo fue tu experiencia de compra"}
            </p>
          )}
        </div>

        {/* Barra de progreso */}
        {!enviado && (
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">

          {/* Pantalla de éxito */}
          {enviado ? (
            <div className="text-center space-y-4 py-4">
              <FaCheckCircle className="text-green-500 text-5xl mx-auto" />
              <div>
                <p className="text-lg font-bold text-gray-900">¡Muchas Gracias!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Tu opinión nos ayuda a mejorar continuamente nuestro servicio.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate("/servicios");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer mt-2"
              >
                Ir a Servicios
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Contador */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Pregunta {currentStep + 1} de {totalPreguntas}
                </span>
                {preguntaActual.preTipo === "texto" && (
                  <span className="text-xs text-gray-400">Opcional</span>
                )}
              </div>

              {/* Pregunta */}
              <p className="text-base font-semibold text-gray-800 leading-relaxed">
                {preguntaActual.preTexto}
              </p>

              {/* Input dinámico */}
              {renderPregunta(preguntaActual)}

              {/* Navegación */}
              <div className="flex gap-3 pt-2">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Atrás
                  </button>
                )}

                {currentStep < totalPreguntas - 1 ? (
                  <button
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    disabled={!puedeAvanzar && preguntaActual.preTipo !== "texto"}
                    className="flex-1 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleEnviar}
                    disabled={enviando || (!puedeAvanzar && preguntaActual.preTipo !== "texto")}
                    className="flex-1 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {enviando ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Encuesta"
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
