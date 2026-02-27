import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import InputField from "./InputField";
import { useAuth } from "../../context/auth/AuthContext.jsx";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
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

      navigate("/login", { replace: true });
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
        required
        error={errors.nombre?.message}
        {...register("nombre", {
          required: "El nombre es obligatorio",
        })}
      />

      <InputField
        label="Apellido"
        type="text"
        placeholder="Pérez"
        required
        error={errors.apellido?.message}
        {...register("apellido", {
          required: "El apellido es obligatorio",
        })}
      />

      <InputField
        label="Documento"
        type="text"
        placeholder="123456789"
        required
        error={errors.documento?.message}
        {...register("documento", {
          required: "El documento es obligatorio",
          pattern: {
            value: /^[0-9]+$/,
            message: "El documento solo debe contener números",
          },
          minLength: {
            value: 6,
            message: "Debe tener mínimo 6 dígitos",
          },
        })}
        onInput={(e) => {
          e.target.value = e.target.value.replace(/[^0-9]/g, "");
        }}
      />

      <InputField
        label="Teléfono"
        type="text"
        placeholder="3001234567"
        required
        error={errors.telefono?.message}
        {...register("telefono", {
          required: "El teléfono es obligatorio",
          pattern: {
            value: /^[0-9]+$/,
            message: "El teléfono solo debe contener números",
          },
          minLength: {
            value: 10,
            message: "Debe tener 10 dígitos",
          },
          maxLength: {
            value: 10,
            message: "Debe tener 10 dígitos",
          },
        })}
        onInput={(e) => {
          e.target.value = e.target.value.replace(/[^0-9]/g, "");
        }}
      />

      <InputField
        label="Correo Electrónico"
        type="email"
        placeholder="usuario@dominio.com"
        required
        error={errors.correo?.message}
        {...register("correo", {
          required: "El correo es obligatorio",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message:
              "Debe ingresar un correo válido (ej: usuario@dominio.com)",
          },
        })}
      />

      <InputField
        label="Dirección"
        type="text"
        placeholder="Calle 123 #45-67"
        required
        error={errors.direccion?.message}
        {...register("direccion", {
          required: "La dirección es obligatoria",
        })}
      />

      <InputField
        label="Contraseña"
        type="password"
        placeholder="********"
        required
        error={errors.password?.message}
        {...register("password", {
          required: "La contraseña es obligatoria",
          minLength: {
            value: 8,
            message: "Debe tener mínimo 8 caracteres",
          },
          pattern: {
            value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
            message:
              "Debe contener al menos una letra y un número",
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