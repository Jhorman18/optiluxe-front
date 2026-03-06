import { useNavigate } from "react-router-dom";

const ServicesCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl bg-gradient-to-r from-[#1D3B8B] to-[#3B82F6] px-6 py-10 text-center text-white shadow-sm sm:px-10">
          <h3 className="text-2xl font-bold">¿Listo para Agendar tu Cita?</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-white/90">
            Únete a miles de clientes satisfechos que confían en OptiLuxe para su
            cuidado visual
          </p>

          <button
            type="button"
            onClick={() => navigate("/citas")}
            className="cursor-pointer mt-6 inline-flex items-center justify-center rounded-lg bg-white/15 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-white/30 transition hover:bg-white/20"
          >
            Agendar Ahora <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesCTA;