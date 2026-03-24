import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  FaEye,
  FaEdit,
  FaBan,
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
} from "react-icons/fa";
import DataTable from "../../ui/DataTable";

const columnHelper = createColumnHelper();

const ESTADO_COLORS = {
  PAGADA: "bg-green-100 text-green-700",
  PENDIENTE: "bg-amber-100 text-amber-700",
  ANULADA: "bg-red-100 text-red-700",
};

export default function FacturasTabla({
  facturas,
  loading,
  onVerDetalle,
  onEditar,
  onAnular,
}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("facNumero", {
        header: "N° Factura",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FaFileInvoiceDollar />
            </div>
            <span className="font-bold text-slate-900">{getValue()}</span>
          </div>
        ),
        meta: { skeletonClass: "h-6 w-32" },
      }),
      columnHelper.accessor((row) => row.cliente?.nombreCompleto || "Consumidor Final", {
        id: "cliente",
        header: "Cliente / Documento",
        cell: ({ row: { original: f }, getValue }) => (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">
                <FaUser />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-slate-900 font-extrabold uppercase tracking-tight">
                    {getValue()}
                </span>
                <span className="text-[9px] text-slate-400 font-bold tracking-widest">
                    ID: {f.cliente?.documento || "N/A"}
                </span>
            </div>
          </div>
        ),
        meta: { skeletonClass: "h-6 w-40" },
      }),
      columnHelper.accessor("facFecha", {
        header: "Fecha Emisión",
        cell: ({ getValue }) => (
          <div className="flex flex-col">
            <span className="text-sm text-slate-600 font-medium">
                {new Date(getValue()).toLocaleDateString()}
            </span>
            <span className="text-[10px] text-slate-300 font-mono">
                {new Date(getValue()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ),
        meta: { skeletonClass: "h-6 w-24" },
      }),
      columnHelper.accessor("facTotal", {
        header: "Monto Total",
        cell: ({ getValue }) => (
          <span className="font-black text-blue-600">
            ${Math.round(getValue()).toLocaleString()}
          </span>
        ),
        meta: { skeletonClass: "h-6 w-24" },
      }),
      columnHelper.accessor("facEstado", {
        header: "Estado",
        cell: ({ getValue }) => {
          const estado = getValue() || "PAGADA";
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                ESTADO_COLORS[estado] || "bg-slate-100 text-slate-600"
              }`}
            >
              {estado === "ANULADA" ? <FaTimesCircle className="text-xs" /> : <FaCheckCircle className="text-xs" />}
              {estado}
            </span>
          );
        },
        meta: { skeletonClass: "h-6 w-20" },
      }),
      columnHelper.display({
        id: "_acciones",
        header: "Acciones",
        cell: ({ row: { original: f } }) => (
          <div className="flex justify-end gap-1">
            <button
              onClick={() => onVerDetalle(f)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer group shadow-sm hover:shadow-md bg-white border border-slate-100"
              title="Ver detalle completo"
            >
              <FaEye className="text-base group-hover:scale-110 transition-transform" />
            </button>
            {f.facEstado !== "ANULADA" && (
              <>
                <button
                  onClick={() => onEditar(f)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer group shadow-sm hover:shadow-md bg-white border border-slate-100"
                  title="Editar factura"
                >
                  <FaEdit className="text-base group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => onAnular(f)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer group shadow-sm hover:shadow-md bg-white border border-slate-100"
                  title="Anular factura"
                >
                  <FaBan className="text-base group-hover:rotate-12 transition-transform" />
                </button>
              </>
            )}
          </div>
        ),
        meta: {
          headerClassName: "text-right",
          skeletonClass: "h-6 w-24 float-right",
        },
      }),
    ],
    [onVerDetalle, onEditar, onAnular]
  );

  return (
    <DataTable
      columns={columns}
      data={facturas}
      loading={loading}
      emptyMessage="No se han registrado facturas aún."
      pageSize={10}
    />
  );
}
