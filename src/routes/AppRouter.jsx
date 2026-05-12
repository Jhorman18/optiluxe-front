import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/public/HomePage";
import AuthPage from "../pages/auth/AuthPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import ProtectedRoute from "./ProtectedRoute";
import TestPage from "../pages/TestPage";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import Services from "../pages/public/Services";
import Conocenos from "../pages/public/Conocenos";
import Productos from "../pages/public/Productos";
import ProductDetailPage from "../pages/public/ProductDetailPage";
import Contacto from "../pages/public/Contacto";
import InventarioPage from "../pages/admin/InventarioPage";
import NotificacionesPage from "../pages/admin/NotificacionesPage";
import UsuariosPage from "../pages/admin/UsuariosPage";
import AdminCitasPage from "../pages/admin/AdminCitasPage";
import HistorialClinicoPage from "../pages/admin/HistorialClinicoPage";
import SoportesPagoPage from "../pages/admin/SoportesPagoPage";
import EncuestasPage from "../pages/admin/EncuestasPage";
import MensajesContactoPage from "../pages/admin/MensajesContactoPage";
import ReportesPage from "../pages/admin/ReportesPage";
import ConfiguracionPage from "../pages/admin/ConfiguracionPage";
import CitasPage from "../pages/public/CitasPage";
import Carrito from "../pages/cliente/Carrito";
import HistoriaClinicaPage from "../pages/cliente/HistoriaClinicaPage";
import PedidosPage from "../pages/cliente/PedidosPage";
import CartPanel from "../components/cart/CartPanel.jsx";
import ScrollToTop from "../components/layout/ScrollToTop.jsx";
import ClienteConfiguracionPage from "../pages/cliente/ClienteConfiguracionPage.jsx";
import MisNotificacionesPage from "../pages/cliente/MisNotificacionesPage.jsx";
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
        <Route path="/citas" element={<CitasPage />} />
        <Route path="/conocenos" element={<Conocenos />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/productos/:id" element={<ProductDetailPage />} />
        <Route path="/contacto" element={<Contacto />} />

        <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR", "EMPLEADO"]} />}>
          <Route path="/test" element={<TestPage />} />
          <Route path="/panel-admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="citas" element={<AdminCitasPage />} />
            <Route path="historial" element={<HistorialClinicoPage />} />
            <Route path="notificaciones" element={<NotificacionesPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="soportes-pago" element={<SoportesPagoPage />} />
            <Route path="encuestas" element={<EncuestasPage />} />
            <Route path="mensajes" element={<MensajesContactoPage />} />
            <Route path="reportes" element={<ReportesPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR", "EMPLEADO", "CLIENTE"]} />
          }
        >
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/historia" element={<HistoriaClinicaPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route path="/configuracion" element={<ClienteConfiguracionPage />} />
          <Route path="/mis-notificaciones" element={<MisNotificacionesPage />} />
        </Route>

        <Route path="/403" element={<Error403Page />} />
        <Route path="/500" element={<Error500Page />} />
        <Route path="*" element={<Error404Page />} />

      </Routes>
    </BrowserRouter>
  );
}
