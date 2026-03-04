import { api } from "./api";

export const getProductos = async ({ categoria, busqueda, admin = false } = {}) => {
  const params = {};
  if (categoria) params.categoria = categoria;
  if (busqueda) params.busqueda = busqueda;
  if (admin) params.admin = true;

  const response = await api.get("/producto", { params });
  return response.data.productos;
};

export const getProductoById = async (id) => {
  const response = await api.get(`/producto/${id}`);
  return response.data.producto || response.data;
};

export const createProducto = async (data) => {
  const response = await api.post("/producto", data);
  return response.data;
};

export const updateProducto = async (id, data) => {
  const response = await api.put(`/producto/${id}`, data);
  return response.data;
};

export const toggleProductoEstado = async (id, estado) => {
  const response = await api.patch(`/producto/${id}/estado`, { estado });
  return response.data;
};
