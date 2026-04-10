import { api } from "./api";

/**
 * Envía un mensaje de contacto al backend
 * @param {Object} data - Datos del formulario (nombre, correo, telefono, mensaje)
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const enviarMensaje = async (data) => {
  const response = await api.post("/contacto", data);
  return response.data;
};

/**
 * Obtiene todos los mensajes de contacto (Solo Admin)
 * @returns {Promise<Array>} Lista de mensajes
 */
export const obtenerMensajes = async () => {
  const response = await api.get("/contacto");
  return response.data;
};

/**
 * Actualiza el estado de un mensaje de contacto (Solo Admin)
 * @param {number} id - ID del contacto
 * @param {string} estado - Nuevo estado
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const actualizarEstadoMensaje = async (id, estado) => {
  const response = await api.patch(`/contacto/${id}/estado`, { estado });
  return response.data;
};

/**
 * Responde a un mensaje de contacto (Solo Admin)
 * @param {number} id - ID del contacto
 * @param {string} respuesta - Texto de la respuesta
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const responderMensaje = async (id, respuesta) => {
  const response = await api.post(`/contacto/${id}/responder`, { respuesta });
  return response.data;
};
