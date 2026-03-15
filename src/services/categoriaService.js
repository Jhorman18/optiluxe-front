import { api } from "./api";

export const getCategorias = async () => {
  const res = await api.get("/categoria");
  return res.data;
};

export const getCategoriasAdmin = async () => {
  const res = await api.get("/categoria/admin");
  return res.data;
};

export const createCategoria = async (catNombre) => {
  const res = await api.post("/categoria", { catNombre });
  return res.data;
};

export const updateCategoria = async (id, data) => {
  const res = await api.patch(`/categoria/${id}`, data);
  return res.data;
};
