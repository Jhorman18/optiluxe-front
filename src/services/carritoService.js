import { api } from "./api";

export const getCarrito = () => api.get("/carrito").then((r) => r.data);

export const agregarAlCarrito = (idProducto, cantidad = 1) =>
  api.post("/carrito/agregar", { idProducto, cantidad }).then((r) => r.data);

export const actualizarCantidad = (idCarritoProducto, cantidad) =>
  api.put(`/carrito/item/${idCarritoProducto}`, { cantidad }).then((r) => r.data);

export const eliminarItem = (idCarritoProducto) =>
  api.delete(`/carrito/item/${idCarritoProducto}`).then((r) => r.data);
