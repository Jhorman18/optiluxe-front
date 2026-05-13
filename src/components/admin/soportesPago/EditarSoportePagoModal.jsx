import { useState, useEffect } from "react";
import { FaEdit, FaTimes, FaSpinner, FaSave, FaTrash, FaBoxOpen, FaStethoscope } from "react-icons/fa";
import CustomSelect from "../../ui/CustomSelect";

const METODOS_PAGO = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "PSE",      label: "PSE / Transferencia" },
  { value: "TARJETA",  label: "Tarjeta de Crédito/Débito" },
];

export default function EditarSoportePagoModal({ abierto, soporte, loading = false, guardando, onClose, onSubmit }) {
  const [sopCondiciones, setSopCondiciones] = useState("");
  const [items, setItems]     = useState([]); // { idCarritoProducto, idProducto, nombre, precio, cantidad, cantidadOriginal, stock }
  const [servicios, setServicios] = useState([]); // { idCarritoServicio, nombre, precio, fecha, hora }
  const [removedProductos, setRemovedProductos] = useState(new Set());
  const [removedServicios,  setRemovedServicios]  = useState(new Set());

  useEffect(() => {
    if (!soporte) return;
    setSopCondiciones(soporte.sopCondiciones || "EFECTIVO");
    setRemovedProductos(new Set());
    setRemovedServicios(new Set());

    const cps = soporte.carrito?.carrito_producto || [];
    setItems(cps.map(cp => ({
      idCarritoProducto: cp.idCarritoProducto,
      idProducto: cp.fkIdProducto ?? cp.producto?.idProducto,
      nombre: cp.producto?.proNombre || "Producto",
      precio: Number(cp.producto?.proPrecio || 0),
      cantidad: cp.cantidad,
      cantidadOriginal: cp.cantidad,
      stock: cp.producto?.proStock ?? 999,
    })));

    const css = soporte.carrito?.carrito_servicio || [];
    setServicios(css.map(cs => ({
      idCarritoServicio: cs.idCarritoServicio,
      nombre: cs.csNombre,
      precio: Number(cs.csPrecio),
      fecha: cs.csFecha,
      hora: cs.csHora,
    })));
  }, [soporte]);

  if (!abierto || !soporte) return null;

  const itemsActivos    = items.filter(i => !removedProductos.has(i.idCarritoProducto));
  const serviciosActivos = servicios.filter(s => !removedServicios.has(s.idCarritoServicio));

  const total = itemsActivos.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
              + serviciosActivos.reduce((acc, s) => acc + s.precio, 0);

  const handleCantidad = (idCarritoProducto, val) => {
    setItems(prev => prev.map(i =>
      i.idCarritoProducto === idCarritoProducto
        ? { ...i, cantidad: Math.max(1, Math.min(parseInt(val) || 1, i.stock + i.cantidadOriginal)) }
        : i
    ));
  };

  const handleRemoveProducto = (id) =>
    setRemovedProductos(prev => new Set(prev).add(id));

  const handleRemoveServicio = (id) =>
    setRemovedServicios(prev => new Set(prev).add(id));

  const sinCarrito = !soporte.carrito || (items.length === 0 && servicios.length === 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const itemsActualizados = items
      .filter(i => !removedProductos.has(i.idCarritoProducto) && i.cantidad !== i.cantidadOriginal)
      .map(i => ({ idCarritoProducto: i.idCarritoProducto, cantidad: i.cantidad }));

    onSubmit(soporte.idSoporte, {
      sopCondiciones,
      removedProductos: [...removedProductos],
      removedServicios:  [...removedServicios],
      itemsActualizados,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-blue-600 px-7 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/10 rounded-xl"><FaEdit /></div>
            <div>
              <p className="font-black text-base tracking-tight">Editar Soporte de Pago</p>
              <p className="text-blue-200 text-[11px] font-mono">{soporte.sopNumero}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer text-white">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-7 space-y-5">

          {/* Skeleton de carga */}
          {loading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-40 bg-slate-200 rounded" />
                    <div className="h-2 w-20 bg-slate-100 rounded" />
                  </div>
                  <div className="h-7 w-12 bg-slate-200 rounded-xl" />
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                  <div className="h-7 w-7 bg-slate-100 rounded-xl" />
                </div>
              ))}
              <div className="h-12 bg-blue-100 rounded-2xl" />
              <div className="h-11 bg-slate-100 rounded-2xl" />
            </div>
          )}

          {/* Productos */}
          {!loading && items.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <FaBoxOpen className="text-blue-500" /> Productos
              </p>
              <div className="space-y-2">
                {items.map(item => {
                  const removed = removedProductos.has(item.idCarritoProducto);
                  return (
                    <div key={item.idCarritoProducto}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition ${removed ? "bg-red-50 border-red-100 opacity-50" : "bg-slate-50 border-slate-100"}`}>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${removed ? "line-through text-slate-400" : "text-slate-800"}`}>{item.nombre}</p>
                        <p className="text-[10px] text-slate-400 font-bold">${item.precio.toLocaleString()} c/u</p>
                      </div>
                      {!removed ? (
                        <>
                          <input
                            type="number" min={1} max={item.stock + item.cantidadOriginal}
                            value={item.cantidad}
                            onChange={e => handleCantidad(item.idCarritoProducto, e.target.value)}
                            className="w-14 text-center px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <p className="text-sm font-black text-blue-700 w-20 text-right shrink-0">
                            ${(item.precio * item.cantidad).toLocaleString()}
                          </p>
                          <button type="button" onClick={() => handleRemoveProducto(item.idCarritoProducto)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer shrink-0">
                            <FaTrash className="text-xs" />
                          </button>
                        </>
                      ) : (
                        <button type="button"
                          onClick={() => setRemovedProductos(prev => { const s = new Set(prev); s.delete(item.idCarritoProducto); return s; })}
                          className="text-[10px] font-black text-blue-500 hover:text-blue-700 cursor-pointer shrink-0">
                          Restaurar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Servicios */}
          {!loading && servicios.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <FaStethoscope className="text-blue-500" /> Servicios
              </p>
              <div className="space-y-2">
                {servicios.map(serv => {
                  const removed = removedServicios.has(serv.idCarritoServicio);
                  return (
                    <div key={serv.idCarritoServicio}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition ${removed ? "bg-red-50 border-red-100 opacity-50" : "bg-slate-50 border-slate-100"}`}>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${removed ? "line-through text-slate-400" : "text-slate-800"}`}>{serv.nombre}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{serv.fecha} {serv.hora}</p>
                      </div>
                      <p className="text-sm font-black text-blue-700 w-20 text-right shrink-0">
                        {serv.precio > 0 ? `$${serv.precio.toLocaleString()}` : "Gratuito"}
                      </p>
                      {!removed ? (
                        <button type="button" onClick={() => handleRemoveServicio(serv.idCarritoServicio)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer shrink-0">
                          <FaTrash className="text-xs" />
                        </button>
                      ) : (
                        <button type="button"
                          onClick={() => setRemovedServicios(prev => { const s = new Set(prev); s.delete(serv.idCarritoServicio); return s; })}
                          className="text-[10px] font-black text-blue-500 hover:text-blue-700 cursor-pointer shrink-0">
                          Restaurar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && sinCarrito && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 font-medium">
              Este soporte no tiene ítems detallados. Solo puedes editar el método de pago.
            </div>
          )}

          {/* Total calculado */}
          {!loading && !sinCarrito && (
            <div className="flex justify-between items-center bg-blue-600 rounded-2xl px-5 py-4">
              <p className="text-blue-200 font-black text-[10px] uppercase tracking-widest">Total Recalculado</p>
              <p className="text-white font-black text-2xl">${Math.round(total).toLocaleString("es-CO")}</p>
            </div>
          )}

          {/* Método de pago */}
          {!loading && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Método de Pago</label>
              <CustomSelect
                value={sopCondiciones}
                onChange={setSopCondiciones}
                options={METODOS_PAGO}
              />
            </div>
          )}

          {/* Botones — siempre visibles */}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition cursor-pointer text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={guardando || loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm">
              {guardando ? <FaSpinner className="animate-spin" /> : loading ? <><FaSpinner className="animate-spin" /> Cargando...</> : <><FaSave /> Guardar Cambios</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
