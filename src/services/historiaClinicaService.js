import { api } from "./api";

export const crearHistoriaClinica = async (idCita, data) => {
  const res = await api.post(`/historia-clinica/cita/${idCita}`, data);
  return res.data;
};

export const getHistorias = async (busqueda) => {
  const res = await api.get("/historia-clinica", {
    params: busqueda ? { busqueda } : {},
  });
  return res.data.historias;
};

export const getHistoriaPorCita = async (idCita) => {
  const res = await api.get(`/historia-clinica/cita/${idCita}`);
  return res.data.historia;
};
