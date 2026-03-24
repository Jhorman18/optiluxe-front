import { api } from "./api";

export const getTodasFacturasAdmin = async (params) => {
  const response = await api.get("/factura", { params });
  return response.data;
};

export const getFacturaPorId = async (id) => {
  const response = await api.get(`/factura/${id}`);
  return response.data;
};

export const crearFactura = async (data) => {
  const response = await api.post("/factura", data);
  return response.data;
};

export const actualizarFactura = async (id, data) => {
  const response = await api.put(`/factura/${id}`, data);
  return response.data;
};

export const anularFactura = async (id, motivo) => {
  const response = await api.patch(`/factura/${id}/anular`, { motivo });
  return response.data;
};

export const getEstadisticasVentas = () =>
  api.get("/factura/estadisticas").then(res => res.data);
