import { api } from "./api";

/**
 * Registra una nueva notificación programada (Admin)
 */
export const registrarNotificacion = async (payload) => {
  try {
    const response = await api.post("/notificaciones", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Error al registrar la notificación");
  }
};

/**
 * Obtiene el historial de notificaciones (Admin)
 */
export const obtenerNotificaciones = async () => {
  try {
    const response = await api.get("/notificaciones");
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Error al obtener las notificaciones");
  }
};

/**
 * Obtiene las notificaciones del usuario autenticado (Paciente/User)
 */
export const obtenerMisNotificaciones = async () => {
  try {
    const response = await api.get("/notificaciones/mis-notificaciones");
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Error al obtener tus notificaciones");
  }
};

/**
 * Elimina una notificación programada (Admin)
 */
export const eliminarNotificacion = async (id) => {
  try {
    const response = await api.delete(`/notificaciones/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Error al eliminar la notificación");
  }
};

/**
 * Marca una notificación como leída
 */
export const marcarNotificacionLeida = async (id) => {
  try {
    const response = await api.patch(`/notificaciones/${id}/leer`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Error al marcar como leída");
  }
};
