import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import InputField from "./InputField";
import { useAuth } from "../../context/auth/AuthContext.jsx";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  // IMPORTANTE: renombramos para no chocar con react-hook-form

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nombre: "",
      apellido: "",
      documento: "",
      telefono: "",
      correo: "",
      password: "",
      direccion: "",
    },
  });

  const onSubmit = async (values) => {
    setError("");

    try {
      // Enviamos el rol fijo como CLIENTE
      const registerPromise = registerUser({
        ...values,
        rol: "CLIENTE",
      });

      await toast.promise(registerPromise, {
        loading: "Creando cuenta...",
        success: "¡Cuenta creada exitosamente!",
        error: (err) =>
          err?.response?.data?.message ??
          err?.message ??
          "No fue posible registrarse",
      });

      navigate("/login?mode=login", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ??
        err?.message ??
        "No fue posible registrarse"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputField
        label="Nombre"
        type="text"
        placeholder="Juan"
        error={errors.nombre?.message}
        {...register("nombre", {
          required: "El nombre es obligatorio",
        })}
      />

      <InputField
        label="Apellido"
        type="text"
        placeholder="Pérez"
        error={errors.apellido?.message}
        {...register("apellido", {
          required: "El apellido es obligatorio",
        })}
      />

      <InputField
        label="Documento"
        type="text"
        placeholder="123456789"
        error={errors.documento?.message}
        {...register("documento", {
          required: "El documento es obligatorio",
        })}
      />

      <InputField
        label="Teléfono"
        type="text"
        placeholder="3001234567"
        error={errors.telefono?.message}
        {...register("telefono", {
          required: "El teléfono es obligatorio",
        })}
      />

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
        label="Dirección"
        type="text"
        placeholder="Calle 123 #45-67"
        error={errors.direccion?.message}
        {...register("direccion", {
          required: "La dirección es obligatoria",
        })}
      />

      <InputField
        label="Contraseña"
        type="password"
        placeholder="************"
        error={errors.password?.message}
        {...register("password", {
          required: "La contraseña es obligatoria",
          minLength: {
            value: 6,
            message: "Debe tener mínimo 6 caracteres",
          },
        })}
      />

      {error && (
        <p className="text-center text-sm text-red-600 mb-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer w-full bg-blue-700 text-white py-2 rounded-lg disabled:opacity-60"
      >
        {isSubmitting ? "Registrando..." : "Crear Cuenta"}
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          Inicia sesión
        </a>
      </p>
    </form>
  );
}