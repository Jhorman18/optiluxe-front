import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import AuthPage from "../pages/auth/AuthPage";
import ProtectedRoute from "./ProtectedRoute";
import TestPage from "../pages/TestPage";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import Services from "../pages/Services";
import Conocenos from "../pages/Conocenos";
import Productos from "../pages/Productos";
import ProductDetailPage from "../pages/ProductDetailPage";
import Contacto from "../pages/Contacto";
import InventarioPage from "../pages/admin/InventarioPage";
import CitasPage from "../pages/CitasPage";

import FacturaListPage from "../pages/factura/FacturaListPage";
import FacturaCreatePage from "../pages/factura/FacturaCreatePage";
import Carrito from "../pages/Carrito";
import CartPanel from "../components/cart/CartPanel.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <CartPanel />
      <Routes>


        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/servicios" element={<Services />} />
        <Route path="/citas" element={<CitasPage />} />
        <Route path="/conocenos" element={<Conocenos />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/productos/:id" element={<ProductDetailPage />} />
        <Route path="/contacto" element={<Contacto />} />


        <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR"]} />}>
          <Route path="/test" element={<TestPage />} />
          <Route path="/panel-admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="inventario" element={<InventarioPage />} />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR", "EMPLEADO", "CLIENTE"]} />
          }
        >
          <Route path="/carrito" element={<Carrito />} />
        </Route>


        <Route
          element={
            <ProtectedRoute allowedRoles={["ADMINISTRADOR", "EMPLEADO"]} />
          }
        >
          <Route path="/facturas" element={<FacturaListPage />} />
          <Route path="/facturas/crear" element={<FacturaCreatePage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}