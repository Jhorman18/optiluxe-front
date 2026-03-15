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

// ─── Admin: gestión completa de citas ────────────────────────────────────────

export const getAllCitasAdmin = (filtros = {}) => {
  const params = {};
  if (filtros.estado) params.estado = filtros.estado;
  if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
  if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
  if (filtros.busqueda) params.busqueda = filtros.busqueda;
  return api.get("/cita/admin/todas", { params }).then(res => res.data);
};

export const actualizarEstadoCita = (id, estado) =>
  api.patch(`/cita/${id}/estado`, { estado }).then(res => res.data);

export const reprogramarCita = (id, fecha) =>
  api.patch(`/cita/${id}/reprogramar`, { fecha }).then(res => res.data);

export const crearCitaAdmin = (data) =>
  api.post("/cita/admin", data).then(res => res.data);

export const registrarPagoCita = (id, data) =>
  api.post(`/cita/${id}/pago`, data).then(res => res.data);

