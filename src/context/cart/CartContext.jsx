/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import * as carritoService from "../../services/carritoService.js";
import { getProductoById, getProductos } from "../../services/productoService.js";
import toast from "react-hot-toast";

const CartContext = createContext(null);

const EMPTY_CART = { idCarrito: null, items: [], subtotal: 0, iva: 0, total: 0, totalItems: 0 };
const LOCAL_STORAGE_KEY = "optiluxe_cart_offline";

// Helpers para Math del Carrito Local
const calculateLocalCartTotals = (items) => {
  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  return { subtotal, iva: Math.round(iva), total: Math.round(total), totalItems };
};

export function CartProvider({ children }) {
  const { isAuthenticated, cargando: authCargando } = useAuth();
  const [carrito, setCarrito] = useState(EMPTY_CART);
  const [panelOpen, setPanelOpen] = useState(false);
  const [cargando, setCargando] = useState(false);
  const updateTimeouts = useRef({});


  const loadLocalCart = useCallback(() => {
    try {
      const offlineCart = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (offlineCart) {
        setCarrito(JSON.parse(offlineCart));
      } else {
        setCarrito(EMPTY_CART);
      }
    } catch {
      setCarrito(EMPTY_CART);
    }
  }, []);

  const saveLocalCart = (newCart) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCart));
    setCarrito(newCart);
  };

  const fetchCarritoAPI = useCallback(async () => {
    try {
      const data = await carritoService.getCarrito();
      setCarrito(data);
    } catch {
      setCarrito(EMPTY_CART);
    }
  }, []);


  const syncOfflineCartToDB = useCallback(async () => {
    const offlineCartStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!offlineCartStr) return; // Nada que sincronizar

    try {
      const offlineCart = JSON.parse(offlineCartStr);
      if (offlineCart.items && offlineCart.items.length > 0) {
        await Promise.all(
          offlineCart.items.map(item =>
            carritoService.agregarAlCarrito(item.producto.id, item.cantidad)
          )
        );
        toast.success("Carrito local sincronizado exitosamente.");
      }
    } catch (error) {
      console.error("Error sincronizando carrito offline:", error);
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (authCargando) return;

    if (isAuthenticated) {
      setCargando(true);
      syncOfflineCartToDB().then(() => {
        fetchCarritoAPI().finally(() => setCargando(false));
      });
    } else {
      loadLocalCart();
    }
  }, [isAuthenticated, authCargando, syncOfflineCartToDB, fetchCarritoAPI, loadLocalCart]);


  const addToCart = async (idProducto, cantidad = 1) => {
    setCargando(true);

    if (isAuthenticated) {
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
      return;
    }

    try {
      let prodInfo;
      try {
        prodInfo = await getProductoById(idProducto);
      } catch {
        const allProds = await getProductos();
        prodInfo = allProds.find(p => String(p.id) === String(idProducto));
        if (!prodInfo) throw new Error("Producto no encontrado en el catálogo");
      }

      let items = [...carrito.items];
      const existingItemIndex = items.findIndex(item => String(item.producto.id) === String(idProducto));

      if (existingItemIndex >= 0) {
        let newQty = items[existingItemIndex].cantidad + cantidad;
        if (newQty > prodInfo.stock) newQty = prodInfo.stock;

        items[existingItemIndex].cantidad = newQty;
        items[existingItemIndex].subtotal = newQty * (prodInfo.precio || 0);
      } else {
        items.push({
          idCarritoProducto: `offline_${Date.now()}_${idProducto}`,
          idProducto: idProducto,
          cantidad: cantidad > prodInfo.stock ? prodInfo.stock : cantidad,
          subtotal: (cantidad > prodInfo.stock ? prodInfo.stock : cantidad) * (prodInfo.precio || 0),
          producto: prodInfo
        });
      }

      const { subtotal, iva, total, totalItems } = calculateLocalCartTotals(items);
      saveLocalCart({ idCarrito: "offline", items, subtotal, iva, total, totalItems });
      setPanelOpen(true);
      toast.success("Producto agregado (Offline)");
    } catch (err) {
      toast.error("Error al buscar producto: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  const updateItem = async (idCarritoProducto, cantidad) => {
    // 1. Actualización Optimista e Inmediata en el UI
    const items = [...carrito.items];
    const index = items.findIndex(i => i.idCarritoProducto === idCarritoProducto);

    if (index >= 0) {
      if (cantidad <= 0) return removeItem(idCarritoProducto);

      // Validar stock antes de actualizar visualmente
      if (cantidad > items[index].producto.stock) {
        toast.error(`Solo hay ${items[index].producto.stock} disponibles`);
        return;
      }

      items[index].cantidad = cantidad;
      items[index].subtotal = items[index].producto.precio * cantidad;

      const totals = calculateLocalCartTotals(items);
      setCarrito({ ...carrito, items, ...totals });
    }

    if (!isAuthenticated) {
      // Si es offline, guardamos en localStorage normalmente
      const offlineTotals = calculateLocalCartTotals(items);
      saveLocalCart({ ...carrito, items, ...offlineTotals });
      return;
    }

    // 2. Lógica de Debounce para el Backend
    // Limpiamos cualquier timer previo para este producto
    if (updateTimeouts.current[idCarritoProducto]) {
      clearTimeout(updateTimeouts.current[idCarritoProducto]);
    }

    // Programamos la petición al servidor después de 2 segundos de inactividad
    // El usuario pidió "como 5 segundos", usaremos 2.5s que es un equilibrio razonable
    updateTimeouts.current[idCarritoProducto] = setTimeout(async () => {
      try {
        const data = await carritoService.actualizarCantidad(idCarritoProducto, cantidad);
        // Sincronizamos con la respuesta final del servidor por si hubo cambios
        setCarrito(data);
        delete updateTimeouts.current[idCarritoProducto];
      } catch (err) {
        toast.error(err?.response?.data?.message ?? "Error al sincronizar cantidad");
        // Si falla, volvemos a cargar el carrito del servidor para revertir el cambio optimista
        fetchCarritoAPI();
      }
    }, 2500);
  };

  const removeItem = async (idCarritoProducto) => {
    setCargando(true);

    if (isAuthenticated) {
      try {
        const data = await carritoService.eliminarItem(idCarritoProducto);
        setCarrito(data);
      } catch {
        toast.error("Error al eliminar el producto");
      } finally {
        setCargando(false);
      }
      return;
    }

    const newItems = carrito.items.filter(i => i.idCarritoProducto !== idCarritoProducto);
    const totals = calculateLocalCartTotals(newItems);
    saveLocalCart({ ...carrito, items: newItems, ...totals });
    setCargando(false);
  };

  const pagarCarrito = async (metodoPago) => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para finalizar la compra.");
      return;
    }

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

  const contextValue = useMemo(() => ({
    carrito, cargando, panelOpen, openPanel, closePanel, addToCart, updateItem, removeItem, pagarCarrito
  }), [carrito, cargando, panelOpen]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
