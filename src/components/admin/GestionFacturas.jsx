import { useState, useEffect } from "react";
import { FaSearch, FaFileInvoiceDollar, FaPlus, FaCalendarAlt } from "react-icons/fa";
import * as facturaService from "../../services/facturaService";
import toast from "react-hot-toast";
import FacturasTabla from "./facturas/FacturasTabla";
import FacturaDetalleModal from "./facturas/FacturaDetalleModal";
import CrearFacturaModal from "./facturas/CrearFacturaModal";
import EditarFacturaModal from "./facturas/EditarFacturaModal";
import AnularFacturaModal from "./facturas/AnularFacturaModal";

import { useAuth } from "../../context/auth/AuthContext";

export default function GestionFacturas() {
  const { rol } = useAuth();
  const esEmpleado = rol === "EMPLEADO";

  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [detalleFactura, setDetalleFactura] = useState(null);
  const [editando, setEditando] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [anulando, setAnulando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const fetchFacturas = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchTerm && { busqueda: searchTerm }),
        ...(fechaInicio && { fechaInicio }),
        ...(fechaFin && { fechaFin }),
      };
      const data = await facturaService.getTodasFacturasAdmin(params);
      setFacturas(data);
    } catch (error) {
      toast.error("Error al cargar las facturas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFacturas();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fechaInicio, fechaFin]);

  const handleCrear = async (payload, resetForm) => {
    try {
      setGuardando(true);
      const nueva = await facturaService.crearFactura(payload);
      setFacturas((prev) => [nueva, ...prev]);
      toast.success("Factura creada correctamente");
      setModalCrear(false);
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error al crear la factura");
    } finally {
      setGuardando(false);
    }
  };

  const handleActualizar = async (id, payload) => {
    try {
      setGuardando(true);
      const actualizada = await facturaService.actualizarFactura(id, payload);
      setFacturas((prev) => prev.map((f) => f.idFactura === id ? actualizada : f));
      toast.success("Factura actualizada correctamente");
      setEditando(null);
    } catch (error) {
      toast.error("Error al actualizar la factura");
    } finally {
      setGuardando(false);
    }
  };

  const handleAnular = async (id, motivo) => {
    try {
      setGuardando(true);
      const anulada = await facturaService.anularFactura(id, motivo);
      setFacturas((prev) => prev.map((f) => f.idFactura === id ? anulada : f));
      toast.success("Factura anulada correctamente");
      setAnulando(null);
    } catch (error) {
      toast.error("Error al anular la factura");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
              <FaFileInvoiceDollar className="text-white text-xl" />
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Gestionar Facturas</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setModalCrear(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 cursor-pointer text-sm"
            >
              <FaPlus /> Nueva Factura
            </button>
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
              <p className="text-2xl font-extrabold text-blue-600">{facturas.length}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</p>
            </div>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500 mt-2">Administra el registro contable y de ventas de la óptica desde un solo panel.</p>
      </header>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="relative md:col-span-2">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por N° Factura o nombre del cliente..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="date"
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm text-slate-600"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            title="Fecha inicio"
          />
        </div>
        <div className="relative">
          <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="date"
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm text-slate-600"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            title="Fecha fin"
          />
        </div>
      </div>

      <FacturasTabla
        facturas={facturas}
        loading={loading}
        onVerDetalle={(f) => setDetalleFactura(f)}
        onEditar={(f) => setEditando(f)}
        onAnular={(f) => setAnulando(f)}
        esEmpleado={esEmpleado}
      />

      <FacturaDetalleModal
        factura={detalleFactura}
        onClose={() => setDetalleFactura(null)}
      />

      <CrearFacturaModal
        abierto={modalCrear}
        guardando={guardando}
        onClose={() => setModalCrear(false)}
        onSubmit={handleCrear}
      />

      <EditarFacturaModal
        abierto={!!editando}
        factura={editando}
        guardando={guardando}
        onClose={() => setEditando(null)}
        onSubmit={handleActualizar}
      />

      <AnularFacturaModal
        abierto={!!anulando}
        factura={anulando}
        guardando={guardando}
        onAnular={handleAnular}
        onClose={() => setAnulando(null)}
      />
    </div>
  );
}
