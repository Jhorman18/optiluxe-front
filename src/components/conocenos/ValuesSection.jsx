import { FaEye, FaBullseye, FaHeart } from "react-icons/fa";

const values = [
  {
    icon: FaEye,
    title: "Visión",
    text: "Ser el centro de optometría de referencia en Colombia, reconocido por nuestra excelencia, innovación y compromiso con la salud visual.",
  },
  {
    icon: FaBullseye,
    title: "Misión",
    text: "Proporcionar servicios de optometría de alta calidad, utilizando tecnología avanzada y atención personalizada.",
  },
  {
    icon: FaHeart,
    title: "Valores",
    text: "Integridad, profesionalismo, innovación y compromiso con el bienestar de nuestros pacientes.",
  },
];

export default function ValuesSection() {
  return (
    <section className="bg-slate-50 py-14">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Nuestros Valores
        </h2>
        <p className="text-slate-500 mb-10 text-sm">
          Los principios que guían nuestro trabajo cada día
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {values.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white border-gray-200 border rounded-xl p-6 shadow-sm"
              >
                <div className="bg-blue-100 w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-3">
                  <Icon className="text-blue-600 text-sm" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}