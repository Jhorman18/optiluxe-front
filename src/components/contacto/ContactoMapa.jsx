import { FaMapMarkerAlt } from "react-icons/fa";

export default function ContactoMapa() {
  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Encuéntranos</h2>
        <p className="text-sm text-gray-500 mb-10">
          Estamos ubicados en el corazón de Bogotá
        </p>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 h-72 flex flex-col items-center justify-center gap-3 shadow-sm">
          <div className="bg-blue-100 text-blue-600 rounded-full w-14 h-14 flex items-center justify-center">
            <FaMapMarkerAlt className="text-2xl" />
          </div>
          <p className="text-sm font-medium text-gray-700">Mapa de ubicación</p>
          <p className="text-xs text-gray-500">Calle 123 #45-67, Bogotá</p>
        </div>
      </div>
    </section>
  );
}
