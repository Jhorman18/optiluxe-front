import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/public/HomePage";
import AuthPage from "../pages/auth/AuthPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import ProtectedRoute from "./ProtectedRoute";
import TestPage from "../pages/TestPage";
import AdminLayout from "../layouts/AdminLayout";
import Services from "../pages/public/Services";
import Conocenos from "../pages/public/Conocenos";
import Productos from "../pages/public/Productos";
import ProductDetailPage from "../pages/public/ProductDetailPage";
import Contacto from "../pages/public/Contacto";
import CartPanel from "../components/cart/CartPanel.jsx";
import ScrollToTop from "../components/layout/ScrollToTop.jsx";
import Error404Page from "../pages/error/Error404Page.jsx";
import Error403Page from "../pages/error/Error403Page.jsx";
import Error500Page from "../pages/error/Error500Page.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartPanel />
      <Routes>

        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/servicios" element={<Services />} />
        <Route path="/conocenos" element={<Conocenos />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/productos/:id" element={<ProductDetailPage />} />
        <Route path="/contacto" element={<Contacto />} />

        {/* Admin/Employee routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR", "EMPLEADO"]} />}>
          <Route path="/test" element={<TestPage />} />
          <Route path="/panel-admin" element={<AdminLayout />} />
        </Route>

        {/* Client Routes Redirects to Root (keeping URL as localhost:5173) */}
        <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR", "EMPLEADO", "CLIENTE"]} />}>
          <Route path="/carrito" element={<Navigate to="/" state={{ view: "carrito" }} replace />} />
          <Route path="/historia" element={<Navigate to="/" state={{ view: "historia" }} replace />} />
          <Route path="/pedidos" element={<Navigate to="/" state={{ view: "pedidos" }} replace />} />
          <Route path="/configuracion" element={<Navigate to="/" state={{ view: "configuracion" }} replace />} />
          <Route path="/mis-notificaciones" element={<Navigate to="/" state={{ view: "notificaciones" }} replace />} />
          <Route path="/citas" element={<Navigate to="/" state={{ view: "citas" }} replace />} />
        </Route>

        <Route path="/403" element={<Error403Page />} />
        <Route path="/500" element={<Error500Page />} />
        <Route path="*" element={<Error404Page />} />

      </Routes>
    </BrowserRouter>
  );
}
