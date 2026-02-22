import { useState } from "react";
import InputField from "./InputField";

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("register", form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputField
        label="Nombre Completo"
        value={form.name}
        onChange={handleChange("name")}
      />

      <InputField
        label="Correo Electrónico"
        type="email"
        value={form.email}
        onChange={handleChange("email")}
      />

      <InputField
        label="Contraseña"
        type="password"
        value={form.password}
        onChange={handleChange("password")}
      />

      <InputField
        label="Confirmar Contraseña"
        type="password"
        value={form.confirmPassword}
        onChange={handleChange("confirmPassword")}
      />

      <p className="text-xs text-gray-500 mb-4">
        Al registrarte, aceptas nuestros Términos y Condiciones
      </p>

      <button className="w-full bg-blue-700 text-white py-2 rounded-lg">
        Crear Cuenta
      </button>
    </form>
  );
}