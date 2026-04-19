import HeaderHome from "../../components/home/HeaderHome";
import Footer from "../../components/layout/Footer";
import ConfiguracionPage from "../admin/ConfiguracionPage";

export default function ClienteConfiguracionPage() {
    return (
        <>
            <HeaderHome />
            <main className="min-h-screen bg-slate-50 py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <ConfiguracionPage />
                </div>
            </main>
            <Footer />
        </>
    );
}
