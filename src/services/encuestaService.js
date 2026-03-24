import { api } from "./api";

/**
 * Obtiene todas las encuestas (Admin)
 */
export const getEncuestas = async (params = {}) => {
  const response = await api.get("/encuesta", { params });
  return response.data;
};

/**
 * Obtiene el detalle de una encuesta por ID (Admin)
 */
export const getEncuestaById = async (id) => {
  const response = await api.get(`/encuesta/${id}`);
  return response.data;
};

/**
 * Elimina una encuesta (Admin)
 */
export const deleteEncuesta = async (id) => {
  const response = await api.delete(`/encuesta/${id}`);
  return response.data;
};

/**
 * Obtiene el catálogo de preguntas para el cliente
 */
export const getPreguntas = async (categoria) => {
  const params = categoria ? { categoria } : {};
  const response = await api.get("/encuesta/preguntas", { params });
  return response.data;
};

/**
 * Registra una nueva encuesta (Cliente)
 */
export const enviarEncuesta = async (data) => {
  const response = await api.post("/encuesta", data);
  return response.data;
};
