import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const C = {
    navy:    [15,  23,  42],
    blue:    [37,  99,  235],
    slate50: [248, 250, 252],
    slate100:[241, 245, 249],
    slate200:[226, 232, 240],
    slate400:[148, 163, 184],
    slate500:[100, 116, 139],
    slate700:[51,  65,  85],
    white:   [255, 255, 255],
};

// Dibujado PRIMERO para que quede detrás de todo el contenido
const drawWatermark = (doc, W, H) => {
    doc.setFontSize(62);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.slate100);
    doc.text("OPTILUXE", W / 2, H / 2, { align: "center", angle: 45 });
};

const drawPageHeader = (doc, W, M) => {
    // Banda oscura
    doc.setFillColor(...C.navy);
    doc.rect(0, 0, W, 42, "F");

    // Franja azul de acento
    doc.setFillColor(...C.blue);
    doc.rect(0, 42, W, 3, "F");

    // ── Logo: círculo azul + FaEye (forma almendra con bezier) ──────────
    const lx = M + 9, ly = 21;

    // Círculo azul de fondo (badge)
    doc.setFillColor(...C.blue);
    doc.circle(lx, ly, 8, "F");

    // Forma almendra del ojo con curvas bezier (igual que FaEye)
    // Arranca en punta izquierda → curva superior → punta derecha → curva inferior
    doc.setFillColor(...C.white);
    doc.lines(
        [
            [3, -3.5, 6, -3.5, 9, 0],   // arco superior
            [-3, 3.5, -6, 3.5, -9, 0],  // arco inferior
        ],
        lx - 4.5, ly,
        [1, 1],
        "F",
        true
    );

    // Pupila
    doc.setFillColor(8, 20, 70);
    doc.circle(lx, ly, 1.7, "F");

    // Punto de brillo
    doc.setFillColor(...C.white);
    doc.circle(lx - 0.6, ly - 0.6, 0.6, "F");

    // ── Texto de empresa ─────────────────────────────────────────────────
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.white);
    doc.text("OptiLuxe", M + 22, 20);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.slate400);
    doc.text("Sistema de Gestión Óptica", M + 22, 28);

    doc.setDrawColor(...C.slate500);
    doc.setLineWidth(0.2);
    doc.line(M + 22, 31, M + 75, 31);

    doc.setFontSize(6.5);
    doc.setTextColor(...C.slate400);
    doc.text("contacto@optiluxe.com", M + 22, 37);
};

/**
 * Genera y descarga un reporte en PDF con diseño corporativo.
 *
 * @param {string}   titulo        - Título del reporte
 * @param {string[]} columnas      - Cabeceras de la tabla
 * @param {Array[]}  filas         - Filas de datos
 * @param {string}   nombreArchivo - Nombre del archivo .pdf
 * @param {object}   opciones
 * @param {string}   opciones.periodo  - Rango de fechas (ej: "01/01/2025 — 31/01/2025")
 * @param {Array}    opciones.resumen  - [{label, valor}, ...] para el bloque de KPIs
 */
export const generatePDF = (titulo, columnas, filas, nombreArchivo = "reporte.pdf", opciones = {}) => {
    try {
        const { periodo, resumen } = opciones;
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();
        const M = 15;

        // ── PÁGINA 1: marca de agua primero (queda detrás de todo) ───────────
        drawWatermark(doc, W, H);

        // ── CABECERA ─────────────────────────────────────────────────────────
        // La banda navy pinta encima de la marca de agua en la zona del header
        drawPageHeader(doc, W, M);

        // Fecha y referencia (dentro del header, esquina derecha)
        const fechaStr = new Date().toLocaleString("es-CO", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
        doc.setFontSize(7.5);
        doc.setTextColor(...C.slate400);
        doc.text(`Generado: ${fechaStr}`, W - M, 20, { align: "right" });
        doc.setFontSize(6.5);
        doc.text(`REF-${Date.now().toString().slice(-8)}`, W - M, 28, { align: "right" });

        // ── TÍTULO DEL REPORTE ───────────────────────────────────────────────
        let y = 57;

        doc.setFillColor(...C.blue);
        doc.rect(M, y - 6, 4, 14, "F");

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C.navy);
        doc.text(titulo.toUpperCase(), M + 9, y + 2);

        if (periodo) {
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...C.slate500);
            doc.text(`Período: ${periodo}`, M + 9, y + 11);
            y += 9;
        }

        y += 16;

        // Línea divisoria
        doc.setDrawColor(...C.slate200);
        doc.setLineWidth(0.4);
        doc.line(M, y, W - M, y);
        y += 9;

        // ── BLOQUE DE KPIs ───────────────────────────────────────────────────
        if (resumen && resumen.length > 0) {
            const boxH = 28;
            doc.setFillColor(...C.slate50);
            doc.setDrawColor(...C.slate200);
            doc.setLineWidth(0.3);
            doc.roundedRect(M, y, W - M * 2, boxH, 2, 2, "FD");

            doc.setFontSize(6);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...C.slate500);
            doc.text("RESUMEN DEL PERÍODO", M + 5, y + 7);

            const iW = (W - M * 2 - 10) / resumen.length;
            resumen.forEach((item, i) => {
                const ix = M + 5 + i * iW;
                if (i > 0) {
                    doc.setDrawColor(...C.slate200);
                    doc.setLineWidth(0.3);
                    doc.line(ix - 2, y + 11, ix - 2, y + boxH - 4);
                }
                doc.setFontSize(7);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(...C.slate500);
                doc.text(String(item.label), ix, y + 17);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...C.navy);
                doc.text(String(item.valor), ix, y + 25);
            });

            y += boxH + 8;
        }

        // ── TABLA ────────────────────────────────────────────────────────────
        autoTable(doc, {
            startY: y,
            head: [columnas],
            body: filas,
            theme: "plain",
            margin: { left: M, right: M, top: 50, bottom: 20 },
            headStyles: {
                fillColor: C.navy,
                textColor: C.white,
                fontStyle: "bold",
                fontSize: 8,
                cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
            },
            bodyStyles: {
                fontSize: 8,
                textColor: C.slate700,
                cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
            },
            alternateRowStyles: { fillColor: C.slate50 },
            tableLineColor: C.slate200,
            tableLineWidth: 0.3,
            willDrawPage: (data) => {
                // En páginas 2+ dibujamos watermark primero, luego header encima
                if (data.pageNumber > 1) {
                    drawWatermark(doc, W, H);
                    drawPageHeader(doc, W, M);
                }
            },
            didDrawPage: (data) => {
                // Pie de página (se dibuja al final, queda encima de todo)
                doc.setFillColor(...C.navy);
                doc.rect(0, H - 14, W, 14, "F");

                doc.setFontSize(6.5);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(...C.slate400);
                doc.text("OptiLuxe — Sistema de Gestión Óptica", M, H - 5);
                doc.text(`Página ${data.pageNumber}`, W / 2, H - 5, { align: "center" });
                doc.text("DOCUMENTO CONFIDENCIAL", W - M, H - 5, { align: "right" });
            },
        });

        doc.save(nombreArchivo);
    } catch (error) {
        console.error("Error al generar PDF:", error);
        alert("Hubo un error al generar el PDF.");
    }
};

/**
 * Genera y descarga un reporte en CSV.
 */
export const generateCSV = (data, nombreArchivo = "reporte.csv") => {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];

    for (const row of data) {
        const values = headers.map(header => {
            const escaped = ("" + row[header]).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
    }

    const blob = new Blob(["﻿" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", nombreArchivo);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
