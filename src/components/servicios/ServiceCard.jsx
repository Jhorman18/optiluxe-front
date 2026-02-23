import { FaCheckCircle, FaClock } from "react-icons/fa";

const ServiceCard = ({ service, onBook }) => {
  const Icon = service.icon;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="relative">
        {/* Icon top right */}
        <div className="absolute right-0 top-0 rounded-full bg-slate-100 p-2">
          <Icon className="text-slate-600 text-sm" />
        </div>

        {/* Circle image placeholder */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <Icon className="text-blue-600 text-2xl" />
        </div>

        <h3 className="text-center text-lg font-semibold text-slate-900">
          {service.title}
        </h3>

        <p className="mt-1 text-center text-sm text-slate-500">
          {service.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1"><FaClock className="text-slate-500" /> {service.duration}</span>
        <span className="font-medium text-blue-700">{service.price}</span>
      </div>

      {/* Features */}
      <ul className="mt-5 space-y-2">
        {service.features.map((f, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
            <FaCheckCircle className="mt-0.5 text-amber-500 text-xs" />
            {f}
          </li>
        ))}
      </ul>

      {/* Button */}
      <button
        onClick={onBook}
        className="cursor-pointer mt-6 w-full rounded-lg bg-[#183A8B] py-2.5 text-sm font-medium text-white transition hover:bg-[#142f6d]"
      >
        Agendar Cita →
      </button>
    </article>
  );
};

export default ServiceCard;