import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api } from "../../services/api";
import toast from "react-hot-toast";
import { FiLock, FiCheckCircle } from "react-icons/fi";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const nuevaPassword = watch("nuevaPassword", "");

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Token de recuperación no válido o ausente.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", {
        token,
        nuevaPassword: data.nuevaPassword,
      });
      setSuccess(true);
      toast.success("Contraseña actualizada con éxito.");

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Ocurrió un error al restablecer la contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Enlace Inválido</h2>
          <p className="text-gray-600 mb-6">
            El enlace para restablecer la contraseña no es válido o está incompleto.
          </p>
          <Link
            to="/forgot-password"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Solicitar un nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Nueva Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu nueva contraseña para acceder a tu cuenta.
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
            <FiCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">
              ¡Contraseña cambiada!
            </h3>
            <p className="text-sm text-green-700 mb-6">
              Tu contraseña ha sido actualizada exitosamente. Serás redirigido
              al inicio de sesión en unos segundos...
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="nuevaPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nueva contraseña
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nuevaPassword"
                    type="password"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                    placeholder="••••••••"
                    {...register("nuevaPassword", {
                      required: "La contraseña es obligatoria",
                      minLength: {
                        value: 6,
                        message: "La contraseña debe tener al menos 6 caracteres",
                      },
                    })}
                  />
                </div>
                {errors.nuevaPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.nuevaPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmarPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmar nueva contraseña
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmarPassword"
                    type="password"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                    placeholder="••••••••"
                    {...register("confirmarPassword", {
                      required: "Por favor confirma tu contraseña",
                      validate: (value) =>
                        value === nuevaPassword || "Las contraseñas no coinciden",
                    })}
                  />
                </div>
                {errors.confirmarPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.confirmarPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Guardando..." : "Restablecer contraseña"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
