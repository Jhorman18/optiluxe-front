import { api } from "./api";

export const crearFactura = async (data) => {
  const response = await api.post("/factura", data);
  return response.data;
};

export const getEstadisticasVentas = () =>
  api.get("/factura/estadisticas").then(res => res.data);
