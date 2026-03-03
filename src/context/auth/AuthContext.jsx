import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  loginService,
  logoutService,
  meService,
  registerService,
} from "../../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);


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


  const login = async ({ correo, password }) => {
    const res = await loginService({ correo, password });
    setUsuario(res.data.usuario);
    return res.data.usuario;
  };

  const register = async (formData) => {

    const payload = {
      usuNombre: formData.nombre,
      usuApellido: formData.apellido,
      usuDocumento: formData.documento,
      usuTelefono: formData.telefono,
      usuCorreo: formData.correo,
      usuPassword: formData.password,
      usuDireccion: formData.direccion,
      usuEstado: "ACTIVO",


      rol: formData.rol ?? "CLIENTE",
    };

    const res = await registerService(payload);



    return res.data;
  };

  const logout = async () => {
    try {
      await logoutService();
    } finally {
      setUsuario(null);
    }
  };

  const value = useMemo(
    () => ({
      usuario,
      cargando,
      login,
      logout,
      register,
      setUsuario,
      isAuthenticated: !!usuario,
      // El backend devuelve rol como string ("CLIENTE") o como objeto {rolNombre}
      rol: usuario?.rol?.rolNombre ?? usuario?.rol ?? null,
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