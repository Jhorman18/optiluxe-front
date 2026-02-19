import {
  FaCalendarAlt,
  FaGlasses,
  FaCheckCircle,
  FaStar
} from 'react-icons/fa';

import heroImage from '../../assets/ImgHeroSection.png';

export default function HeroSection() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Texto */}
        <div>
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
            <FaStar className="text-yellow-500" />
            Centro de Cuidado Visual
          </span>

          {/* Título */}
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-gray-800">
            Tu <span className="text-blue-600">Visión Clara</span> es <br />
            Nuestra Misión
          </h2>

          {/* Descripción */}
          <p className="mt-6 text-gray-600 text-lg">
            Expertos en salud visual en Bogotá. Exámenes completos, monturas
            de diseño y tecnología de punta para el cuidado de tus ojos.
          </p>

          {/* Botones */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md">
              <FaCalendarAlt />
              Agendar Cita
            </button>

            <button className="flex items-center gap-2 border border-gray-300 hover:border-blue-600 hover:text-blue-600 px-6 py-3 rounded-lg font-medium transition">
              <FaGlasses />
              Ver Productos
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-blue-600" />
              Optometristas certificados
            </span>

            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-blue-600" />
              Tecnología avanzada
            </span>
          </div>
        </div>

        {/* Imagen */}
        <div className="rounded-2xl overflow-hidden shadow-xl">
          <img
            src={heroImage}
            alt="Paciente feliz usando gafas en óptica moderna"
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </section>
  );
}
