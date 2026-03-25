import { useState, useEffect } from "react";
import { FaSearch, FaClipboardList, FaFilter, FaRedo, FaQuestionCircle } from "react-icons/fa";
import * as encuestaService from "../../../services/encuestaService";
import toast from "react-hot-toast";
import EncuestasTabla from "./EncuestasTabla";
import EncuestaDetalleModal from "./EncuestaDetalleModal";
import PreguntasModal from "./PreguntasModal";

export default function GestionEncuestas() {
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  
  const [detalleEncuesta, setDetalleEncuesta] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [modalPreguntas, setModalPreguntas] = useState(false);

  const fetchEncuestas = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchTerm && { busqueda: searchTerm }),
        ...(filtroTipo && { tipo: filtroTipo }),
      };
      const data = await encuestaService.getEncuestas(params);
      setEncuestas(data);
    } catch (error) {
      toast.error("Error al cargar las encuestas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEncuestas();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filtroTipo]);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta encuesta? Esta acción no se puede deshacer.")) {
        return;
    }

    try {
      setEliminando(true);
      await encuestaService.deleteEncuesta(id);
      setEncuestas(prev => prev.filter(e => e.idEncuesta !== id));
      toast.success("Encuesta eliminada correctamente");
      if (detalleEncuesta?.idEncuesta === id) {
        setDetalleEncuesta(null);
      }
    } catch (error) {
      toast.error("Error al eliminar la encuesta");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Encuestas de Satisfacción</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Monitorea y gestiona el feedback de tus clientes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalPreguntas(true)}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <FaQuestionCircle /> Gestionar Preguntas
          </button>
          <button
            onClick={fetchEncuestas}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition shadow-sm cursor-pointer"
            title="Refrescar datos"
          >
            <FaRedo className={loading ? "animate-spin" : ""} />
          </button>
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-blue-600">{encuestas.length}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registros</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative md:col-span-2">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o documento..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-bold text-slate-600 appearance-none"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos los Tipos</option>
            <option value="VENTA">Venta Directa</option>
            <option value="CITA">Cita Médica</option>
          </select>
        </div>
      </div>

      <EncuestasTabla
        encuestas={encuestas}
        loading={loading}
        onVerDetalle={(e) => setDetalleEncuesta(e)}
        onEliminar={handleEliminar}
      />

      <EncuestaDetalleModal
        encuestaId={detalleEncuesta?.idEncuesta}
        onClose={() => setDetalleEncuesta(null)}
        onEliminar={handleEliminar}
        eliminando={eliminando}
      />

      <PreguntasModal
        abierto={modalPreguntas}
        onClose={() => setModalPreguntas(false)}
      />
    </div>
  );
}
