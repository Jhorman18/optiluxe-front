import { useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";
import AuthLayout from "../../components/layout/AuthLayout";

export default function AuthPage() {
    const [mode, setMode] = useState("login");

    return (
        <AuthLayout>
            <AuthCard>
                <h2 className="text-xl font-semibold text-center mb-2">
                    Bienvenido
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Inicia sesión o crea una cuenta para continuar
                </p>

                {/* Tabs */}
                <div className="flex bg-gray-100 rounded-lg mb-6">
                    <button
                        onClick={() => setMode("login")}
                        className={`cursor-pointer flex-1 py-2 text-sm rounded-lg transition ${mode === "login"
                                ? "bg-white shadow font-medium"
                                : "text-gray-500"
                            }`}
                    >
                        Iniciar Sesión
                    </button>

                    <button
                        onClick={() => setMode("register")}
                        className={`cursor-pointer flex-1 py-2 text-sm rounded-lg transition ${mode === "register"
                                ? "bg-white shadow font-medium"
                                : "text-gray-500"
                            }`}
                    >
                        Registrarse
                    </button>
                </div>

                <div className="relative min-h-[320px]">
                    {/* Login */}
                    <div
                        className={`transition-all duration-300 ease-in-out ${mode === "login"
                                ? "opacity-100 translate-x-0 relative"
                                : "opacity-0 -translate-x-4 absolute inset-0 pointer-events-none"
                            }`}
                    >
                        <LoginForm />
                    </div>

                    {/* Register */}
                    <div
                        className={`transition-all duration-300 ease-in-out ${mode === "register"
                                ? "opacity-100 translate-x-0 relative"
                                : "opacity-0 translate-x-4 absolute inset-0 pointer-events-none"
                            }`}
                    >
                        <RegisterForm />
                    </div>
                </div>
            </AuthCard>
        </AuthLayout>
    );
}