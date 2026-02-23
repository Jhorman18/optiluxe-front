import { FaUserMd, FaMicrochip, FaUserCheck, FaShieldAlt } from "react-icons/fa";

const reasons = [
  {
    icon: FaUserMd,
    title: "Experiencia Comprobada",
    text: "Más de 10 años cuidando la salud visual de miles de pacientes.",
  },
  {
    icon: FaMicrochip,
    title: "Tecnología Avanzada",
    text: "Equipos de última generación para diagnósticos precisos.",
  },
  {
    icon: FaUserCheck,
    title: "Atención Personalizada",
    text: "Cada cliente recibe un servicio adaptado a sus necesidades.",
  },
  {
    icon: FaShieldAlt,
    title: "Compromiso Total",
    text: "Garantizamos tu satisfacción en cada visita.",
  },
];

export default function WhyUsSection() {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-10">
          ¿Por Qué OptiLuxe?
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {reasons.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="bg-blue-100 w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-3">
                  <Icon className="text-blue-600 text-sm" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}