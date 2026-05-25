import { useLocation } from "react-router-dom";
import CtaSection from "../../components/home/CTASection";
import HeaderHome from "../../components/home/HeaderHome";
import HeroSection from "../../components/home/HeroSection";
import ServicesPreviewSection from "../../components/home/ServicesPreviewSection";
import WhyChooseUsSection from "../../components/home/WhyChooseUsSection";
import Footer from "../../components/layout/Footer";

// Import client views to render inline
import Carrito from "../cliente/Carrito";
import HistoriaClinicaPage from "../cliente/HistoriaClinicaPage";
import PedidosPage from "../cliente/PedidosPage";
import ClienteConfiguracionPage from "../cliente/ClienteConfiguracionPage.jsx";
import MisNotificacionesPage from "../cliente/MisNotificacionesPage.jsx";
import CitasPage from "./CitasPage";

export default function HomePage() {
    const location = useLocation();
    const activeView = location.state?.view;

    const renderContent = () => {
        switch (activeView) {
            case "citas":
                return <CitasPage isView={true} />;
            case "historia":
                return <HistoriaClinicaPage isView={true} />;
            case "notificaciones":
                return <MisNotificacionesPage isView={true} />;
            case "pedidos":
                return <PedidosPage isView={true} />;
            case "configuracion":
                return <ClienteConfiguracionPage isView={true} />;
            case "carrito":
                return <Carrito isView={true} />;
            default:
                return (
                    <>
                        <HeroSection />
                        <ServicesPreviewSection />
                        <WhyChooseUsSection />
                        <CtaSection />
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen flex flex-col w-full">
            <HeaderHome />
            <div className="flex-1 w-full flex flex-col">
                {renderContent()}
            </div>
            <Footer currentPage={activeView ? undefined : "inicio"} />
        </div>
    );
}
