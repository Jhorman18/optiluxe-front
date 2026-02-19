import { FaArrowRight } from 'react-icons/fa';

export default function CtaSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl py-16 px-8 text-center text-white shadow-lg">
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para Cuidar tu Visión?
          </h2>

          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Agenda tu cita hoy mismo y recibe atención profesional
            de nuestros especialistas certificados.
          </p>

          <button className="inline-flex items-center gap-2 bg-white text-blue-600 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition shadow-md">
            Comenzar Ahora
            <FaArrowRight size={14} />
          </button>

        </div>

      </div>
    </section>
  );
}
