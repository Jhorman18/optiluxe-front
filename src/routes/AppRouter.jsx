import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import AuthPage from "../pages/auth/AuthPage";
import ProtectedRoute from "./ProtectedRoute";
import TestPage from "../pages/TestPage";
import Services from "../pages/Services";
import Conocenos from "../pages/Conocenos";
import Productos from "../pages/Productos";
import Contacto from "../pages/Contacto";

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
        <Route path="/conocenos" element={<Conocenos />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/contacto" element={<Contacto />} />

        
        <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR"]} />}>
          <Route path="/test" element={<TestPage />} />
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