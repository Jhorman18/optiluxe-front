import ProductsHero from "../components/productos/ProductsHero";
import ProductsGrid from "../components/productos/ProductsGrid";
import ProductsBenefits from "../components/productos/ProductsBenefits";
import HeaderHome from "../components/home/HeaderHome";
import Footer from "../components/layout/Footer";

export default function Productos() {
    return (
        <>
            <HeaderHome />
            <ProductsHero />
            <ProductsGrid />
            <ProductsBenefits />
            <Footer />
        </>
    );
}