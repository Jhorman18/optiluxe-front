import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Genera y descarga un reporte en PDF
 */
export const generatePDF = (titulo, columnas, filas, nombreArchivo = "reporte.pdf") => {
    try {
        const doc = new jsPDF();
        
        // Configuración de cabecera
        doc.setFontSize(20);
        doc.setTextColor(30, 64, 175); 
        doc.text("OptiLuxe - Sistema de Gestión", 15, 20);
        
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text(titulo, 15, 30);
        
        doc.setFontSize(10);
        doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 15, 38);
        
        // Generación de tabla usando la función importada directamente
        autoTable(doc, {
            startY: 45,
            head: [columnas],
            body: filas,
            theme: "striped",
            headStyles: { fillColor: [30, 64, 175], textColor: 255 },
            alternateRowStyles: { fillColor: [243, 244, 246] },
            styles: { fontSize: 9, cellPadding: 3 }
        });
        
        doc.save(nombreArchivo);
    } catch (error) {
        console.error("Error al generar PDF:", error);
        alert("Hubo un error al generar el PDF. Asegúrate de haber instalado las librerías necesarias ejecutando: npm install jspdf jspdf-autotable");
    }
};

/**
 * Genera y descarga un reporte en CSV
 * @param {Array} data - Array de objetos
 * @param {string} nombreArchivo - Nombre del archivo final
 */
export const generateCSV = (data, nombreArchivo = "reporte.csv") => {
    if (!data || !data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Encabezados
    csvRows.push(headers.join(","));
    
    // Datos
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            // Escapar comas y comillas
            const escaped = ("" + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
    }
    
    const csvString = csvRows.join("\n");
    // Añadimos el BOM (\uFEFF) para que Excel reconozca la codificación UTF-8 correctamente
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", nombreArchivo);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
