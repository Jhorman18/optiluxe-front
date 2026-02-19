import { FaEye, FaGlasses, FaPalette, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function ServicesPreviewSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Nuestros <span className="text-blue-600">Servicios</span>
          </h2>
          <p className="mt-4 text-gray-600">
            Ofrecemos una amplia gama de servicios de cuidado visual profesional
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-8">

          {/* Card 1 */}
          <div className="group border border-gray-200 rounded-xl p-8 hover:shadow-lg transition duration-300">
            <div className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg mb-6">
              <FaEye size={22} />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Exámenes Visuales
            </h3>

            <p className="text-gray-600 text-sm mb-6">
              Evaluación completa con equipos de última generación para diagnósticos precisos.
            </p>

            <Link
              to="/servicios"
              className="flex items-center gap-2 text-blue-600 font-medium group-hover:translate-x-1 transition"
            >
              Ver más
              <FaArrowRight size={12} />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="group border border-gray-200 rounded-xl p-8 hover:shadow-lg transition duration-300">
            <div className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg mb-6">
              <FaGlasses size={22} />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Lentes de Contacto
            </h3>

            <p className="text-gray-600 text-sm mb-6">
              Adaptación personalizada y asesoría profesional para encontrar los lentes ideales.
            </p>

            <Link
              to="/servicios"
              className="flex items-center gap-2 text-blue-600 font-medium group-hover:translate-x-1 transition"
            >
              Ver más
              <FaArrowRight size={12} />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="group border border-gray-200 rounded-xl p-8 hover:shadow-lg transition duration-300">
            <div className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg mb-6">
              <FaPalette size={22} />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Monturas de Diseño
            </h3>

            <p className="text-gray-600 text-sm mb-6">
              Amplia selección de marcas premium y asesoría personalizada en estilo.
            </p>

            <Link
              to="/servicios"
              className="flex items-center gap-2 text-blue-600 font-medium group-hover:translate-x-1 transition"
            >
              Ver más
              <FaArrowRight size={12} />
            </Link>
          </div>

        </div>

        {/* Botón general */}
        <div className="text-center mt-14">
          <Link
            to="/servicios"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md"
          >
            Ver todos los servicios
            <FaArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
