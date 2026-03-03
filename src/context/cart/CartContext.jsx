import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import * as carritoService from "../../services/carritoService.js";
import toast from "react-hot-toast";

const CartContext = createContext(null);

const EMPTY_CART = { idCarrito: null, items: [], subtotal: 0, iva: 0, total: 0, totalItems: 0 };

export function CartProvider({ children }) {
  const { isAuthenticated, cargando: authCargando } = useAuth();
  const [carrito, setCarrito] = useState(EMPTY_CART);
  const [panelOpen, setPanelOpen] = useState(false);
  const [cargando, setCargando] = useState(false);

  const fetchCarrito = useCallback(async () => {
    try {
      const data = await carritoService.getCarrito();
      setCarrito(data);
    } catch {
      setCarrito(EMPTY_CART);
    }
  }, []);

  useEffect(() => {
    if (!authCargando && isAuthenticated) {
      fetchCarrito();
    } else if (!isAuthenticated) {
      setCarrito(EMPTY_CART);
    }
  }, [isAuthenticated, authCargando, fetchCarrito]);

  const addToCart = async (idProducto, cantidad = 1) => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agregar productos");
      return;
    }
    setCargando(true);
    try {
      const data = await carritoService.agregarAlCarrito(idProducto, cantidad);
      setCarrito(data);
      setPanelOpen(true);
      toast.success("Producto agregado al carrito");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Error al agregar al carrito");
    } finally {
      setCargando(false);
    }
  };

  const updateItem = async (idCarritoProducto, cantidad) => {
    setCargando(true);
    try {
      const data = await carritoService.actualizarCantidad(idCarritoProducto, cantidad);
      setCarrito(data);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Error al actualizar cantidad");
    } finally {
      setCargando(false);
    }
  };

  const removeItem = async (idCarritoProducto) => {
    setCargando(true);
    try {
      const data = await carritoService.eliminarItem(idCarritoProducto);
      setCarrito(data);
    } catch {
      toast.error("Error al eliminar el producto");
    } finally {
      setCargando(false);
    }
  };

  const pagarCarrito = async (metodoPago) => {
    setCargando(true);
    try {
      const resultado = await carritoService.pagar(metodoPago);
      setCarrito(EMPTY_CART);
      return resultado;
    } finally {
      setCargando(false);
    }
  };

  const openPanel = () => setPanelOpen(true);
  const closePanel = () => setPanelOpen(false);

  return (
    <CartContext.Provider
      value={{ carrito, cargando, panelOpen, openPanel, closePanel, addToCart, updateItem, removeItem, pagarCarrito }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
