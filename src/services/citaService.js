import { api } from "./api";

export const getProximasCitas = () =>
    api.get("/cita/proximas").then(res => res.data);

export const getEstadisticasCitas = () =>
    api.get("/cita/estadisticas").then(res => res.data);

// Retorna [{ inicio: "HH:MM", fin: "HH:MM" }] de las citas del día indicado
export const getHorariosOcupados = (fecha) =>
  api.get("/cita/horarios-ocupados", { params: { fecha } }).then(res => res.data);


export const getMisCitas = () =>
  api.get('/cita/mis-citas').then(res => res.data);

export const getTieneCitaActiva = () =>
  api.get('/cita/tiene-activa').then(res => res.data);

export const registrarCita = async (citaData) => {
  try {
    const response = await api.post("/cita", citaData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
