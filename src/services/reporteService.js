import { api } from "./api";

/**
 * Obtiene el reporte de ventas por rango de fechas
 */
export const getReporteVentas = async (fechaInicio, fechaFin) => {
    const params = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    
    const res = await api.get("/reporte/ventas", { params });
    return res.data;
};

/**
 * Obtiene el reporte de inventario actual
 */
export const getReporteInventario = async () => {
    const res = await api.get("/reporte/inventario");
    return res.data;
};

/**
 * Obtiene el reporte de citas por rango de fechas
 */
export const getReporteCitas = async (fechaInicio, fechaFin) => {
    const params = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;
    
    const res = await api.get("/reporte/citas", { params });
    return res.data;
};
