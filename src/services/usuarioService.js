import { api } from "./api";

export const getEstadisticasPacientes = () =>
    api.get("/usuario/estadisticas").then(res => res.data);

export const getUsuarios = (params = {}) =>
    api.get("/usuario", { params }).then(res => res.data);

export const toggleUsuarioEstado = (id, estado) =>
    api.patch(`/usuario/${id}/estado`, { estado }).then(res => res.data);

export const editarUsuario = (id, data) =>
    api.put(`/usuario/${id}`, data).then(res => res.data);
