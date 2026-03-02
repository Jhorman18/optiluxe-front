import { useState } from "react";
import { toast } from "react-hot-toast";
import { crearFactura } from "../../services/facturaService";

function FacturaForm() {
  const [formData, setFormData] = useState({
    facNumero: "",
    facFecha: "",
    facConcepto: "",
    facCondicionesPago: "",
    facSubtotal: "",
    facIva: "",
    facTotal: "",
    fkIdCarrito: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calcularTotal = () => {
    const subtotal = parseFloat(formData.facSubtotal) || 0;
    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    setFormData({
      ...formData,
      facIva: iva.toFixed(2),
      facTotal: total.toFixed(2),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await crearFactura(formData);
      toast.success("Factura creada correctamente");

      setFormData({
        facNumero: "",
        facFecha: "",
        facConcepto: "",
        facCondicionesPago: "",
        facSubtotal: "",
        facIva: "",
        facTotal: "",
        fkIdCarrito: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al crear factura"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      <input
        type="text"
        name="facNumero"
        placeholder="Número de factura"
        value={formData.facNumero}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />

      <input
        type="date"
        name="facFecha"
        value={formData.facFecha}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="facConcepto"
        placeholder="Concepto"
        value={formData.facConcepto}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="facCondicionesPago"
        placeholder="Condiciones de pago"
        value={formData.facCondicionesPago}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />

      <input
        type="number"
        name="facSubtotal"
        placeholder="Subtotal"
        value={formData.facSubtotal}
        onChange={handleChange}
        onBlur={calcularTotal}
        required
        className="w-full border p-2 rounded"
      />

      <input
        type="number"
        name="facIva"
        placeholder="IVA"
        value={formData.facIva}
        readOnly
        className="w-full border p-2 rounded bg-gray-100"
      />

      <input
        type="number"
        name="facTotal"
        placeholder="Total"
        value={formData.facTotal}
        readOnly
        className="w-full border p-2 rounded bg-gray-100"
      />

      <input
        type="number"
        name="fkIdCarrito"
        placeholder="ID Carrito"
        value={formData.fkIdCarrito}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Registrar Factura
      </button>
    </form>
  );
}

export default FacturaForm;