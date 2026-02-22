import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginService, meService } from "../../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al arrancar la app: intenta recuperar sesión por cookie (/auth/me)
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

  const value = useMemo(
    () => ({ usuario, cargando, login, setUsuario }),
    [usuario, cargando]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider />");
  return ctx;
}