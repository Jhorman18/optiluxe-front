import FacturaForm from "../components/factura/FacturaForm";

function RegistrarFacturaPage() {
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Registrar Factura
      </h2>

      <FacturaForm />
    </div>
  );
}

export default RegistrarFacturaPage;