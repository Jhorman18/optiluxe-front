import { api } from "./api";

export const getProductos = async ({ categoria, busqueda } = {}) => {
  const params = {};
  if (categoria) params.categoria = categoria;
  if (busqueda) params.busqueda = busqueda;

  const response = await api.get("/producto", { params });
  return response.data.productos;
};
