import { services } from "../../config/servicesData";
import ServiceCard from "./ServiceCard";
import { useNavigate } from "react-router-dom";

const ServicesGrid = () => {
  const navigate = useNavigate();

  const handleBook = () => {
    navigate("/login");
  };

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-6 pt-12">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((s, idx) => (
            <ServiceCard key={idx} service={s} onBook={handleBook} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;