import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  loginService,
  meService,
  registerService,
} from "../../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // 🔹 Recuperar sesión al iniciar app
  useEffect(() => {
    let cancelado = false;

    async function init() {
      try {
        const res = await meService();
        if (!cancelado) setUsuario(res.data.usuario);
      } catch (e) {
        if (!cancelado) setUsuario(null);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    init();

    return () => {
      cancelado = true;
    };
  }, []);

  // 🔹 LOGIN
  const login = async ({ correo, password }) => {
    const res = await loginService({ correo, password });
    setUsuario(res.data.usuario);
    return res.data.usuario;
  };

  // 🔹 REGISTER
  const register = async (formData) => {
    // 🔥 Mapeamos datos del formulario al modelo real del backend
    const payload = {
      usuNombre: formData.nombre,
      usuApellido: formData.apellido,
      usuDocumento: formData.documento,
      usuTelefono: formData.telefono,
      usuCorreo: formData.correo,
      usuPassword: formData.password,
      usuDireccion: formData.direccion,
      usuEstado: "ACTIVO",

      // 👇 Siempre será CLIENTE si no viene definido
      rol: formData.rol ?? "CLIENTE",
    };

    const res = await registerService(payload);

    //  Si tu backend devuelve usuario autenticado automáticamente:
    // setUsuario(res.data.usuario);

    return res.data;
  };

  const value = useMemo(
    () => ({
      usuario,
      cargando,
      login,
      register,
      setUsuario,
      isAuthenticated: !!usuario,
      rol: usuario?.rol?.rolNombre ?? null, // útil para proteger rutas
    }),
    [usuario, cargando]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider />");
  return ctx;
}