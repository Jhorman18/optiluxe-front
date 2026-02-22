import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/auth/AuthContext.jsx";

export default function ProtectedRoute({ redirectTo = "/login" }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return null;
  if (!usuario) return <Navigate to={redirectTo} replace />;

  return <Outlet />;
}