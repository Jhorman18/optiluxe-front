import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  FaClock,
  FaComments,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";

const INFO_ITEMS = [
  {
    icon: FaMapMarkerAlt,
    label: "Dirección",
    lines: ["Calle 123 #45-67, Bogotá, Colombia"],
  },
  {
    icon: FaPhoneAlt,
    label: "Teléfono",
    lines: ["+57 1 234 5678", "+57 310 123 4567 (WhatsApp)"],
  },
  {
    icon: FaEnvelope,
    label: "Email",
    lines: ["contacto@optiluxe.com", "citas@optiluxe.com"],
  },
  {
    icon: FaClock,
    label: "Horario de Atención",
    lines: [
      "Lunes a Viernes: 9:00 AM - 7:00 PM",
      "Sábados: 9:00 AM - 3:00 PM",
      "Domingos y festivos: Cerrado",
    ],
  },
];

export default function ContactoFormSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async () => {
    await toast.promise(new Promise((res) => setTimeout(res, 1000)), {
      loading: "Enviando mensaje...",
      success: "¡Mensaje enviado! Te contactaremos pronto.",
      error: "No fue posible enviar el mensaje.",
    });
    reset();
  };

  return (
    <section className="bg-gray-50 py-16 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-start">

        {/* Formulario */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Envíanos un Mensaje</h2>
          <p className="text-sm text-gray-500 mb-6">
            Completa el formulario y nos pondremos en contacto contigo pronto
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                placeholder="Juan Pérez"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200 ${
                  errors.nombre ? "border-red-400" : "border-gray-300"
                }`}
                {...register("nombre", { required: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="juan@ejemplo.com"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200 ${
                  errors.correo ? "border-red-400" : "border-gray-300"
                }`}
                {...register("correo", { required: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="+57 310 123 4567"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                {...register("telefono")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                rows={4}
                placeholder="Cuéntanos cómo podemos ayudarte..."
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 ${
                  errors.mensaje ? "border-red-400" : "border-gray-300"
                }`}
                {...register("mensaje", { required: true })}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-medium py-3 rounded-lg transition disabled:opacity-60"
            >
              <FaPaperPlane />
              {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
            </button>
          </form>
        </div>

        {/* Información de contacto */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Información de Contacto</h2>
          <p className="text-sm text-gray-500 mb-6">
            Visítenos en nuestras instalaciones o contáctenos por cualquiera de estos medios
          </p>

          <div className="space-y-3 mb-6">
            {INFO_ITEMS.map(({ icon: Icon, label, lines }) => (
              <div
                key={label}
                className="flex gap-4 items-start bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
              >
                <div className="bg-blue-100 text-blue-600 rounded-full w-9 h-9 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  {lines.map((line) => (
                    <p key={line} className="text-sm text-gray-500">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tarjeta WhatsApp */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
                <FaComments />
              </div>
              <h3 className="font-semibold">Atención Inmediata</h3>
            </div>
            <p className="text-sm text-blue-200 mb-4">
              Escríbenos por WhatsApp para atención más rápida
            </p>
            <a
              href="https://wa.me/573101234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
            >
              <FaWhatsapp />
              Abrir WhatsApp
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
