export default function ProductsHero() {
  return (
    <section className="bg-slate-50 py-14 text-center">
      <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full">
        Tienda OptiLuxe
      </span>

      <h1 className="text-3xl md:text-4xl font-bold mt-4 text-slate-900">
        Productos <span className="text-blue-600">Premium</span>
      </h1>

      <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
        Explora nuestra selección de monturas de diseño, lentes de contacto y accesorios.
      </p>
    </section>
  );
}