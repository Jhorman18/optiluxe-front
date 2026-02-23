import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";

export default function VisitSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-700 to-blue-500 text-white">
      <div className="max-w-5xl mx-auto px-6 text-center">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-2">Visítanos</h2>
        <p className="text-blue-100 mb-10 text-sm">
          Estaremos encantados de atenderte en nuestras instalaciones
        </p>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-8 text-left">

          {/* Card 1 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-6">

            {/* Dirección */}
            <div className="flex gap-4">
              <div className="bg-white/20 w-12 h-12 flex items-center justify-center rounded-full shrink-0">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h4 className="font-semibold">Dirección</h4>
                <p className="text-sm text-blue-100">
                  Calle 123 #45-67 <br />
                  Bogotá, Colombia
                </p>
              </div>
            </div>

            {/* Teléfono */}
            <div className="flex gap-4">
              <div className="bg-white/20 w-12 h-12 flex items-center justify-center rounded-full shrink-0">
                <FaPhone />
              </div>
              <div>
                <h4 className="font-semibold">Teléfono</h4>
                <p className="text-sm text-blue-100">
                  +57 1 234 5678 <br />
                  +57 310 123 4567
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-6">

            {/* Email */}
            <div className="flex gap-4">
              <div className="bg-white/20 w-12 h-12 flex items-center justify-center rounded-full shrink-0">
                <FaEnvelope />
              </div>
              <div>
                <h4 className="font-semibold">Email</h4>
                <p className="text-sm text-blue-100">
                  contacto@optiluxe.com <br />
                  citas@optiluxe.com
                </p>
              </div>
            </div>

            {/* Horario */}
            <div className="flex gap-4">
              <div className="bg-white/20 w-12 h-12 flex items-center justify-center rounded-full shrink-0">
                <FaClock />
              </div>
              <div>
                <h4 className="font-semibold">Horario</h4>
                <p className="text-sm text-blue-100">
                  Lun - Vie: 9:00 AM - 7:00 PM <br />
                  Sábados: 9:00 AM - 2:00 PM
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}