const ServicesHero = () => {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14 text-center">
        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          Servicios Profesionales
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Cuidado Visual <span className="text-blue-600">Integral</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 sm:text-base">
          En OptiLuxe, ofrecemos servicios completos de optometría con tecnología
          avanzada y atención personalizada. Nuestros especialistas certificados
          están comprometidos con tu salud visual.
        </p>
      </div>
    </section>
  );
};

export default ServicesHero;