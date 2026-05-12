import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { crearSoportePago } from "../../services/soportePagoService";
import { getProductos } from "../../services/productoService";
import { getUsuarios } from "../../services/usuarioService";
import { FaPlus, FaTrash, FaUser, FaBox, FaCalculator } from "react-icons/fa";

function FacturaForm() {
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  const [formData, setFormData] = useState({
    fkIdUsuario: "",
    facConcepto: "Venta de productos",
    facCondicionesPago: "Contado",
    facSubtotal: 0,
    facIva: 0,
    facTotal: 0,
    items: [{ idProducto: "", cantidad: 1, precio: 0 }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, prodsData] = await Promise.all([
          getUsuarios({ rol: "CLIENTE" }),
          getProductos({ admin: true })
        ]);
        setUsuarios(usersData || []);
        setProductos(prodsData || []);
      } catch (error) {
        toast.error("Error al cargar datos iniciales");
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchData();
  }, []);

  // Recalcular totales cada vez que cambien los items
  useEffect(() => {
    const subtotal = formData.items.reduce((acc, item) => {
      const precio = parseFloat(item.precio) || 0;
      return acc + (precio * parseInt(item.cantidad || 0));
    }, 0);

    const total = subtotal;

    setFormData(prev => ({
      ...prev,
      facSubtotal: subtotal.toFixed(2),
      facIva: 0,
      facTotal: total.toFixed(2)
    }));
  }, [formData.items]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { idProducto: "", cantidad: 1, precio: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      toast.error("El soporte de pago debe tener al menos un producto");
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Si cambia el producto, actualizamos el precio automáticamente
    if (field === "idProducto") {
      const selectedProd = productos.find(p => p.id === parseInt(value));
      if (selectedProd) {
        newItems[index].precio = selectedProd.precio;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fkIdUsuario) {
      return toast.error("Debe seleccionar un cliente");
    }

    const hasInvalidItems = formData.items.some(item => !item.idProducto || item.cantidad <= 0);
    if (hasInvalidItems) {
      return toast.error("Por favor complete todos los campos de los productos");
    }

    try {
      await crearSoportePago(formData);
      toast.success("Soporte de pago creado correctamente");
      setFormData({
        fkIdUsuario: "",
        facConcepto: "Venta de productos",
        facCondicionesPago: "Contado",
        facSubtotal: 0,
        facIva: 0,
        facTotal: 0,
        items: [{ idProducto: "", cantidad: 1, precio: 0 }]
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al crear soporte de pago");
    }
  };

  if (loadingInitial) return <div className="text-center py-10 text-gray-500">Cargando datos...</div>;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl border-b pb-4">
        <FaPlus className="text-sm" /> Registrar Nuevo Soporte de Pago
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selección de Cliente */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            <FaUser className="text-indigo-400" /> Cliente
          </label>
          <select
            name="fkIdUsuario"
            value={formData.fkIdUsuario}
            onChange={handleChange}
            required
            className="w-full border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="">Seleccione un cliente...</option>
            {usuarios.map(u => (
              <option key={u.idUsuario} value={u.idUsuario}>
                {u.usuNombre} {u.usuApellido} ({u.usuDocumento})
              </option>
            ))}
          </select>
        </div>

        {/* Concepto */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Concepto</label>
          <input
            type="text"
            name="facConcepto"
            value={formData.facConcepto}
            onChange={handleChange}
            required
            placeholder="Ej: Venta de monturas y lentes"
            className="w-full border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Sección de Productos */}
      <div className="space-y-3">
        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <FaBox className="text-indigo-400" /> Productos / Items
          </h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md hover:bg-indigo-600 hover:text-white transition-all text-sm font-medium"
          >
            <FaPlus /> Añadir Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-center w-24">Cant.</th>
                <th className="p-2 text-right w-32">Precio Un.</th>
                <th className="p-2 text-right w-32">Subtotal</th>
                <th className="p-2 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {formData.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-2">
                    <select
                      value={item.idProducto}
                      onChange={(e) => handleItemChange(index, "idProducto", e.target.value)}
                      required
                      className="w-full border-gray-200 rounded-md text-sm"
                    >
                      <option value="">Seleccione...</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                          {p.nombre} ({p.stock} disp.)
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, "cantidad", e.target.value)}
                      className="w-full border-gray-200 rounded-md text-center text-sm"
                    />
                  </td>
                  <td className="p-2 text-right text-sm text-gray-500">
                    ${parseFloat(item.precio || 0).toLocaleString()}
                  </td>
                  <td className="p-2 text-right font-semibold text-indigo-600">
                    ${(parseFloat(item.precio || 0) * parseInt(item.cantidad || 0)).toLocaleString()}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de Totales */}
      <div className="flex flex-col items-end gap-2 border-t pt-4">
        <div className="flex justify-between w-full md:w-64 text-sm text-gray-600">
          <span>Subtotal:</span>
          <span>${parseFloat(formData.facSubtotal).toLocaleString()}</span>
        </div>

        <div className="flex justify-between w-full md:w-64 text-xl font-bold text-indigo-700 pt-1">
          <span className="flex items-center gap-1"><FaCalculator className="text-sm opacity-50" /> Total:</span>
          <span>${parseFloat(formData.facTotal).toLocaleString()}</span>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
      >
        Registrar Soporte de Pago
      </button>
    </form>
  );
}

export default FacturaForm;