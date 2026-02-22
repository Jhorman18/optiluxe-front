import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import InputField from "./InputField";
import { useAuth } from "../../context/auth/AuthContext.jsx";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { correo: "", password: "" },
  });

  const onSubmit = async (values) => {
    setError("");

    try {
      const loginPromise = login(values); // hace request al backend y guarda usuario en contexto

      await toast.promise(loginPromise, {
        loading: "Iniciando sesión...",
        success: "¡Sesión iniciada!",
        error: (err) =>
          err?.response?.data?.message ??
          err?.message ??
          "No fue posible iniciar sesión",
      });

      navigate("/test", { replace: true });
    } catch (err) {
      // opcional: también mostrar el error debajo del formulario
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "No fue posible iniciar sesión"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputField
        label="Correo Electrónico"
        type="email"
        placeholder="email@email.com"
        error={errors.correo?.message}
        {...register("correo", {
          required: "El correo es obligatorio",
        })}
      />

      <InputField
        label="Contraseña"
        type="password"
        placeholder="************"
        error={errors.password?.message}
        {...register("password", {
          required: "La contraseña es obligatoria",
        })}
      />

      <div className="text-right mb-4">
        <span className="text-sm text-blue-600 cursor-pointer">
          ¿Olvidaste tu contraseña?
        </span>
      </div>

      {error && <p className="text-center text-sm text-red-600 mb-3">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full bg-blue-700 text-white py-2 rounded-lg disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        ¿Necesitas ayuda?{" "}
        <a href="/help" className="text-blue-600 hover:underline">
          Contacta con soporte
        </a>
      </p>
    </form>
  );
}