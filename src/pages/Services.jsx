import ServicesHero from "../components/servicios/ServicesHero";
import ServicesGrid from "../components/servicios/ServicesGrid";
import ProcessSection from "../components/servicios/ProcessSection";
import ServicesCTA from "../components/servicios/ServicesCTA";
import HeaderHome from "../components/home/HeaderHome";
import Footer from "../components/layout/Footer";

const Services = () => {
    return (
        <>
            <HeaderHome />
            <ServicesHero />
            <ServicesGrid />
            <ProcessSection />
            <ServicesCTA />
            <Footer />
        </>
    );
};

export default Services;