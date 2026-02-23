import { FaTruck, FaShieldAlt, FaCertificate } from "react-icons/fa";

const benefits = [
  {
    icon: FaTruck,
    title: "Envío Gratis",
    text: "En compras superiores a $200.000",
  },
  {
    icon: FaShieldAlt,
    title: "Garantía Premium",
    text: "12 meses en todos nuestros productos",
  },
  {
    icon: FaCertificate,
    title: "Marcas Originales",
    text: "100% productos auténticos",
  },
];

export default function ProductsBenefits() {
  return (
    <section className="bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
        {benefits.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 text-center">
              <Icon className="mx-auto text-blue-600 mb-2" />
              <h4 className="font-semibold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-500">{item.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}