import {
  FaEye,
  FaStar,
  FaCalendarAlt,
  FaCheckCircle
} from 'react-icons/fa';

export default function WhyChooseUsSection() {
  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-6">

        {/* Título */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            ¿Por Qué <span className="text-blue-600">Elegirnos?</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-4 gap-6">

          {/* Card 1 */}
          <div className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 mx-auto flex items-center justify-center bg-blue-600 text-white rounded-full mb-6">
              <FaEye size={20} />
            </div>

            <h3 className="font-semibold text-gray-800 mb-2">
              Experiencia
            </h3>

            <p className="text-gray-600 text-sm">
              +10 años cuidando la visión de nuestros clientes
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 mx-auto flex items-center justify-center bg-blue-600 text-white rounded-full mb-6">
              <FaStar size={20} />
            </div>

            <h3 className="font-semibold text-gray-800 mb-2">
              Calidad
            </h3>

            <p className="text-gray-600 text-sm">
              Productos premium de las mejores marcas internacionales
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 mx-auto flex items-center justify-center bg-blue-600 text-white rounded-full mb-6">
              <FaCalendarAlt size={20} />
            </div>

            <h3 className="font-semibold text-gray-800 mb-2">
              Flexibilidad
            </h3>

            <p className="text-gray-600 text-sm">
              Horarios convenientes y atención personalizada
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 mx-auto flex items-center justify-center bg-blue-600 text-white rounded-full mb-6">
              <FaCheckCircle size={20} />
            </div>

            <h3 className="font-semibold text-gray-800 mb-2">
              Garantía
            </h3>

            <p className="text-gray-600 text-sm">
              100% de satisfacción en todos nuestros servicios
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
