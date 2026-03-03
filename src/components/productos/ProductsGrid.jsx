import { useEffect, useState } from "react";
import { getProductos } from "../../services/productoService";
import ProductCard from "./ProductCard";

export default function ProductsGrid() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const data = await getProductos();
        if (!cancelado) setProductos(data);
      } catch (e) {
        if (!cancelado) setError("No fue posible cargar los productos.");
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();
    return () => { cancelado = true; };
  }, []);

  if (cargando) {
    return (
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="bg-gray-200 rounded-lg h-40 w-full mb-4" />
              <div className="bg-gray-200 rounded h-3 w-1/3 mb-2" />
              <div className="bg-gray-200 rounded h-4 w-2/3 mb-3" />
              <div className="bg-gray-200 rounded h-6 w-1/4 mb-4" />
              <div className="bg-gray-200 rounded-lg h-9 w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white text-center">
        <p className="text-gray-500 text-sm">{error}</p>
      </section>
    );
  }

  if (productos.length === 0) {
    return (
      <section className="py-16 bg-white text-center">
        <p className="text-gray-500 text-sm">No hay productos disponibles.</p>
      </section>
    );
  }

  return (
    <section className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
        {productos.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}