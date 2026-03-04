import { api } from "./api";

export const getProductos = async ({ categoria, busqueda } = {}) => {
  const params = {};
  if (categoria) params.categoria = categoria;
  if (busqueda) params.busqueda = busqueda;

  const response = await api.get("/producto", { params });
  return response.data.productos;
};

export const getProductoById = async (id) => {
  try {
    const response = await api.get(`/producto/${id}`);
    return response.data.producto || response.data;
  } catch (error) {
    console.error("Error al obtener detalle de producto", error);
    throw error;
  }
};
