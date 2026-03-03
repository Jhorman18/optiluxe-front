import HeaderHome from "../components/home/HeaderHome";
import Footer from "../components/layout/Footer";
import ContactoHero from "../components/contacto/ContactoHero";
import ContactoFormSection from "../components/contacto/ContactoFormSection";
import ContactoMapa from "../components/contacto/ContactoMapa";

export default function Contacto() {
  return (
    <>
      <HeaderHome />
      <ContactoHero />
      <ContactoFormSection />
      <ContactoMapa />
      <Footer />
    </>
  );
}
