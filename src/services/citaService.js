import { api } from "./api";

export const getProximasCitas = () =>
    api.get("/cita/proximas").then(res => res.data);

export const getEstadisticasCitas = () =>
    api.get("/cita/estadisticas").then(res => res.data);

export const registrarCita = async (citaData) => {
  try {
    const response = await api.post("/cita", citaData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
