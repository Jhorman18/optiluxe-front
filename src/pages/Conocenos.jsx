import AboutHero from "../components/conocenos/AboutHero";
import AboutStory from "../components/conocenos/AboutStory";
import ValuesSection from "../components/conocenos/ValuesSection";
import WhyUsSection from "../components/conocenos/WhyUsSection";
import VisitSection from "../components/conocenos/VisitSection";
import HeaderHome from "../components/home/HeaderHome";
import Footer from "../components/layout/Footer";

export default function Conocenos() {
  return (
    <>
            <HeaderHome />
      <AboutHero />
      <AboutStory />
      <ValuesSection />
      <WhyUsSection />
      <VisitSection />
      <Footer />
    </>
  );
}