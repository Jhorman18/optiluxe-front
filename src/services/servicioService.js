import { api } from "./api";

export const getServicios = () => 
    api.get("/servicio").then(res => res.data);

export const createServicio = (data) => 
    api.post("/servicio", data).then(res => res.data);

export const updateServicio = (id, data) => 
    api.put(`/servicio/${id}`, data).then(res => res.data);
