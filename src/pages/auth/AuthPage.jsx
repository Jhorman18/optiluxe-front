import AuthCard from "../../components/auth/AuthCard";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";
import AuthLayout from "../../components/layout/AuthLayout";
import { useSearchParams } from "react-router-dom";

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // mode por URL: /login?mode=login o /login?mode=register
  const mode = searchParams.get("mode") ?? "login";

  const changeMode = (nextMode) => {
    setSearchParams({ mode: nextMode });
  };

  return (
    <AuthLayout>
      <AuthCard>
        <h2 className="text-xl font-semibold text-center mb-2">Bienvenido</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Inicia sesión o crea una cuenta para continuar
        </p>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => changeMode("login")}
            className={`cursor-pointer flex-1 py-2 text-sm rounded-lg transition ${
              mode === "login" ? "bg-white shadow font-medium" : "text-gray-500"
            }`}
          >
            Iniciar Sesión
          </button>

          <button
            type="button"
            onClick={() => changeMode("register")}
            className={`cursor-pointer flex-1 py-2 text-sm rounded-lg transition ${
              mode === "register"
                ? "bg-white shadow font-medium"
                : "text-gray-500"
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Contenido */}
        <div className="relative min-h-[320px]">
          <div className="transition-all duration-300 ease-in-out">
            {mode === "login" ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}