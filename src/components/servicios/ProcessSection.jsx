import { processSteps } from "../../config/servicesData";

const ProcessSection = () => {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Nuestro Proceso</h2>
        <p className="mt-2 text-sm text-slate-500">
          Un proceso simple y eficiente para cuidar tu salud visual
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-4">
          {processSteps.map((s) => (
            <div key={s.n}>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {s.n}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;