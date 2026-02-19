import CtaSection from "../components/home/CTASection";
import HeaderHome from "../components/home/HeaderHome";
import HeroSection from "../components/home/HeroSection";
import ServicesPreviewSection from "../components/home/ServicesPreviewSection";
import WhyChooseUsSection from "../components/home/WhyChooseUsSection";
import Footer from "../components/layout/Footer";

export default function HomePage() {
    return (
        <div>
            <HeaderHome />
            <HeroSection />
            <ServicesPreviewSection/>
            <WhyChooseUsSection/>
            <CtaSection />
            <Footer />
        </div>
    );
}
