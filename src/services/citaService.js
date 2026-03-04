import { api } from "./api";

export const getProximasCitas = () =>
    api.get("/cita/proximas").then(res => res.data);

export const getEstadisticasCitas = () =>
    api.get("/cita/estadisticas").then(res => res.data);
