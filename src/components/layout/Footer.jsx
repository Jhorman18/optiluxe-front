import {
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaEye,
} from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
            {/* Footer Principal */}
            <div className="bg-blue-800/40">
                <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">

                    {/* Columna 1 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <FaEye className="text-white" />
                            <div>
                                <h3 className="font-bold text-lg">OptiLuxe</h3>
                                <span className="text-sm text-blue-200">
                                    Visión Clara
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-blue-200">
                            Centro de cuidado visual de confianza en Bogotá,
                            Colombia. Comprometidos con la salud visual.
                        </p>
                    </div>

                    {/* Columna 2 */}
                    <div>
                        <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
                        <ul className="space-y-2 text-sm text-blue-200">
                            <li className="hover:text-white cursor-pointer">Inicio</li>
                            <li className="hover:text-white cursor-pointer">Servicios</li>
                            <li className="hover:text-white cursor-pointer">Conócenos</li>
                            <li className="hover:text-white cursor-pointer">Productos</li>
                        </ul>
                    </div>

                    {/* Columna 3 */}
                    <div>
                        <h4 className="font-semibold mb-4">Servicios</h4>
                        <ul className="space-y-2 text-sm text-blue-200">
                            <li>Exámenes Visuales</li>
                            <li>Renovación de Fórmula</li>
                            <li>Adaptación de Lentes de Contacto</li>
                            <li>Selección de Monturas</li>
                        </ul>
                    </div>

                    {/* Columna 4 */}
                    <div>
                        <h4 className="font-semibold mb-4">Contacto</h4>
                        <ul className="space-y-3 text-sm text-blue-200">
                            <li className="flex items-center gap-2">
                                <FaMapMarkerAlt />
                                Calle 123 #45-67, Bogotá, Colombia
                            </li>
                            <li className="flex items-center gap-2">
                                <FaPhoneAlt />
                                +57 1 234 5678
                            </li>
                            <li className="flex items-center gap-2">
                                <FaEnvelope />
                                contacto@optiluxe.com
                            </li>
                        </ul>

                        {/* Redes Sociales */}
                        <div className="flex gap-4 mt-4">
                            <FaFacebookF className="hover:text-white cursor-pointer transition" />
                            <FaInstagram className="hover:text-white cursor-pointer transition" />
                            <FaTwitter className="hover:text-white cursor-pointer transition" />
                        </div>
                    </div>

                </div>

                {/* Línea divisoria */}
                <div className="border-t border-blue-400/30 mx-6"></div>

                {/* Copyright */}
                <div className="text-center py-6 text-sm text-blue-200">
                    © 2025 OptiLuxe. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
