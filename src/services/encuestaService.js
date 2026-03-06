import { api } from "./api";

/**
 * Obtiene las preguntas activas filtradas por categoría
 * @param {string} categoria - "cita" | "compra"
 */
export const obtenerPreguntas = async (categoria) => {
  try {
    const response = await api.get(`/encuesta/preguntas`, {
      params: { categoria },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Envía las respuestas de una encuesta
 * @param {Object} encuestaData
 * @param {string} encuestaData.enTipo - Tipo de encuesta
 * @param {number|null} encuestaData.fkIdCita - ID de la cita (si aplica)
 * @param {number|null} encuestaData.fkIdFactura - ID de la factura (si aplica)
 * @param {Array} encuestaData.respuestas - [{ fkIdPregunta, resValor }]
 */
export const enviarEncuesta = async (encuestaData) => {
  try {
    const response = await api.post("/encuesta", encuestaData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
