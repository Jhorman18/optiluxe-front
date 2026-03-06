import { api } from "./api";

export const getEstadisticasPacientes = () =>
    api.get("/usuario/estadisticas").then(res => res.data);

export const getUsuarios = () =>
    api.get("/usuario").then(res => res.data);
