import { api } from "./api";

export const getTodasSoportesPagoAdmin = async (params) => {
  const response = await api.get("/soporte-pago", { params });
  return response.data;
};

export const getSoportePagoPorId = async (id) => {
  const response = await api.get(`/soporte-pago/${id}`);
  return response.data;
};

export const crearSoportePago = async (data) => {
  const response = await api.post("/soporte-pago", data);
  return response.data;
};

export const actualizarSoportePago = async (id, data) => {
  const response = await api.put(`/soporte-pago/${id}`, data);
  return response.data;
};

export const anularSoportePago = async (id, motivo) => {
  const response = await api.patch(`/soporte-pago/${id}/anular`, { motivo });
  return response.data;
};

export const getMisSoportesPago = () =>
  api.get("/soporte-pago/mis").then(res => res.data);

export const getEstadisticasVentas = () =>
  api.get("/soporte-pago/estadisticas").then(res => res.data);
