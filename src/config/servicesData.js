import {
  FaEye,
  FaGlasses,
  FaRegDotCircle,
} from "react-icons/fa";

export const services = [
  {
    title: "Examen Visual Completo",
    description:
      "Evaluación exhaustiva de tu salud visual con tecnología de punta",
    duration: "45 min",
    price: "Desde $80.000 COP",
    features: [
      "Evaluación de agudeza visual",
      "Medición de presión intraocular",
      "Análisis de fondo de ojo",
      "Detección de enfermedades oculares",
      "Actualización de fórmula",
    ],
    icon: FaEye,
  },
  {
    title: "Renovación de Fórmula",
    description: "Actualización de tu prescripción óptica actual",
    duration: "30 min",
    price: "Desde $60.000 COP",
    features: [
      "Revisión de fórmula actual",
      "Pruebas de refracción",
      "Ajuste de graduación",
      "Recomendaciones personalizadas",
      "Certificado digital",
    ],
    icon: FaGlasses,
  },
  {
    title: "Adaptación de Lentes de Contacto",
    description:
      "Encuentra los lentes de contacto perfectos para tu estilo de vida",
    duration: "60 min",
    price: "Desde $100.000 COP",
    features: [
      "Evaluación de córnea",
      "Prueba de diferentes tipos",
      "Capacitación de uso y cuidado",
      "Seguimiento personalizado",
      "Kit de inicio incluido",
    ],
    icon: FaRegDotCircle,
  },
  {
    title: "Selección y Ajuste de Monturas",
    description: "Asesoría personalizada para encontrar el estilo perfecto",
    duration: "30 min",
    price: "Servicio gratuito",
    features: [
      "Análisis de rostro y estilo",
      "Prueba ilimitada de modelos",
      "Ajuste ergonómico profesional",
      "Monturas de marcas premium",
      "Garantía de satisfacción",
    ],
    icon: FaGlasses,
  },
];

export const processSteps = [
  { n: 1, title: "Agenda tu Cita", desc: "Elige fecha y hora según tu disponibilidad" },
  { n: 2, title: "Consulta Inicial", desc: "Evaluación completa por nuestros especialistas" },
  { n: 3, title: "Diagnóstico", desc: "Análisis detallado y recomendaciones personalizadas" },
  { n: 4, title: "Seguimiento", desc: "Acompañamiento continuo para tu salud visual" },
];