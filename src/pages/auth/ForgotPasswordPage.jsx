import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api } from "../../services/api";
import toast from "react-hot-toast";
import { FiMail, FiArrowLeft } from "react-icons/fi";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.post("/auth/forgot-password", data);
      setSuccess(true);
      toast.success("Si el correo existe, te hemos enviado un enlace.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Ocurrió un error al enviar el correo"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
            <FiMail className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Correo enviado
            </h3>
            <p className="text-sm text-green-700 mb-6">
              Revisa tu bandeja de entrada. Si no lo encuentras, revisa la
              carpeta de spam.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <FiArrowLeft className="mr-2" />
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="correo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correo electrónico
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="correo"
                    type="email"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                    placeholder="correo@ejemplo.com"
                    {...register("correo", {
                      required: "El correo es obligatorio",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Correo inválido",
                      },
                    })}
                  />
                </div>
                {errors.correo && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.correo.message}
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
                {loading ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>
            </div>

            <div className="text-center mt-4">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
