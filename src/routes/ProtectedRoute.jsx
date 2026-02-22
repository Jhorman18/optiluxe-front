import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/auth/AuthContext.jsx";

export default function ProtectedRoute({
  redirectTo = "/login",
  allowedRoles,
  unauthorizedTo = "/",
}) {
  const { usuario, cargando } = useAuth();

  if (cargando) return null;
  if (!usuario) return <Navigate to={redirectTo} replace />;

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const rolUsuario = usuario?.rol;
    const permitido = allowedRoles.includes(rolUsuario);

    if (!permitido) return <Navigate to={unauthorizedTo} replace />;
  }

  return <Outlet />;
}