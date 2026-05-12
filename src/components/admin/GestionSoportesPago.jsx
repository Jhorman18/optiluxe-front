import { useState, useEffect } from "react";
import { FaSearch, FaFileInvoiceDollar, FaPlus, FaCalendarAlt } from "react-icons/fa";
import * as soportePagoService from "../../services/soportePagoService";
import toast from "react-hot-toast";
import SoportesPagoTabla from "./soportesPago/SoportesPagoTabla";
import SoportePagoDetalleModal from "./soportesPago/SoportePagoDetalleModal";
import CrearSoportePagoModal from "./soportesPago/CrearSoportePagoModal";
import EditarSoportePagoModal from "./soportesPago/EditarSoportePagoModal";
import AnularSoportePagoModal from "./soportesPago/AnularSoportePagoModal";

import { useAuth } from "../../context/auth/AuthContext";

export default function GestionSoportesPago() {
  const { rol } = useAuth();
  const esEmpleado = rol === "EMPLEADO";

  const [soportes, setSoportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [detalleSoporte, setDetalleSoporte] = useState(null);
  const [editando, setEditando] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [anulando, setAnulando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const fetchSoportes = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchTerm && { busqueda: searchTerm }),
        ...(fechaInicio && { fechaInicio }),
        ...(fechaFin && { fechaFin }),
      };
      const data = await soportePagoService.getTodasSoportesPagoAdmin(params);
      setSoportes(data);
    } catch (error) {
      toast.error("Error al cargar los soportes de pago");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSoportes();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fechaInicio, fechaFin]);

  const handleCrear = async (payload, resetForm) => {
    try {
      setGuardando(true);
      const nuevo = await soportePagoService.crearSoportePago(payload);
      setSoportes((prev) => [nuevo, ...prev]);
      toast.success("Soporte de pago creado correctamente");
      setModalCrear(false);
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error al crear el soporte de pago");
    } finally {
      setGuardando(false);
    }
  };

  const handleActualizar = async (id, payload) => {
    try {
      setGuardando(true);
      const actualizado = await soportePagoService.actualizarSoportePago(id, payload);
      setSoportes((prev) => prev.map((f) => f.idSoporte === id ? actualizado : f));
      toast.success("Soporte de pago actualizado correctamente");
      setEditando(null);
    } catch (error) {
      toast.error("Error al actualizar el soporte de pago");
    } finally {
      setGuardando(false);
    }
  };

  const handleAnular = async (id, motivo) => {
    try {
      setGuardando(true);
      const anulado = await soportePagoService.anularSoportePago(id, motivo);
      setSoportes((prev) => prev.map((f) => f.idSoporte === id ? anulado : f));
      toast.success("Soporte de pago anulado correctamente");
      setAnulando(null);
    } catch (error) {
      toast.error("Error al anular el soporte de pago");
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
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Gestionar Soportes de Pago</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setModalCrear(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 cursor-pointer text-sm"
            >
              <FaPlus /> Nuevo Soporte de Pago
            </button>
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
              <p className="text-2xl font-extrabold text-blue-600">{soportes.length}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</p>
            </div>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500 mt-2">Administra los soportes de pago y registro de ventas de la óptica desde un solo panel.</p>
      </header>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="relative md:col-span-2">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por N° Soporte o nombre del cliente..."
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

      <SoportesPagoTabla
        soportes={soportes}
        loading={loading}
        onVerDetalle={(f) => setDetalleSoporte(f)}
        onEditar={(f) => setEditando(f)}
        onAnular={(f) => setAnulando(f)}
        esEmpleado={esEmpleado}
      />

      <SoportePagoDetalleModal
        soporte={detalleSoporte}
        onClose={() => setDetalleSoporte(null)}
      />

      <CrearSoportePagoModal
        abierto={modalCrear}
        guardando={guardando}
        onClose={() => setModalCrear(false)}
        onSubmit={handleCrear}
      />

      <EditarSoportePagoModal
        abierto={!!editando}
        soporte={editando}
        guardando={guardando}
        onClose={() => setEditando(null)}
        onSubmit={handleActualizar}
      />

      <AnularSoportePagoModal
        abierto={!!anulando}
        soporte={anulando}
        guardando={guardando}
        onAnular={handleAnular}
        onClose={() => setAnulando(null)}
      />
    </div>
  );
}
