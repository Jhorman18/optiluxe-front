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

// ==================== PREGUNTAS ADMIN ====================

/**
 * Lista TODAS las preguntas (activas e inactivas) — Admin
 */
export const getPreguntasAdmin = async () => {
  const response = await api.get("/encuesta/preguntas/admin");
  return response.data;
};

/**
 * Crea una nueva pregunta — Admin
 */
export const crearPregunta = async (data) => {
  const response = await api.post("/encuesta/preguntas", data);
  return response.data;
};

/**
 * Actualiza una pregunta existente — Admin
 */
export const actualizarPregunta = async (id, data) => {
  const response = await api.put(`/encuesta/preguntas/${id}`, data);
  return response.data;
};

/**
 * Alterna el estado activo/inactivo de una pregunta — Admin
 */
export const togglePregunta = async (id) => {
  const response = await api.patch(`/encuesta/preguntas/${id}/toggle`);
  return response.data;
};
