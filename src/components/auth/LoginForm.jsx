import { useState } from "react";
import InputField from "./InputField";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("login", { email, password });
    };

    return (
        <form onSubmit={handleSubmit}>
            <InputField
                label="Correo Electrónico"
                type="email"
                placeholder="email@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <InputField
                label="Contraseña"
                type="password"
                placeholder="************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <div className="text-right mb-4">
                <span className="text-sm text-blue-600 cursor-pointer">
                    ¿Olvidaste tu contraseña?
                </span>
            </div>

            <button className="w-full bg-blue-700 text-white py-2 rounded-lg">
                Iniciar Sesión
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
                ¿Necesitas ayuda? <a href="/help" className="text-blue-600 hover:underline">Contacta con soporte</a>
            </p>
        </form>
    );
}