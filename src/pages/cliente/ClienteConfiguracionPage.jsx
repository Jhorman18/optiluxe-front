import HeaderHome from "../../components/home/HeaderHome";
import Footer from "../../components/layout/Footer";
import ConfiguracionPage from "../admin/ConfiguracionPage";

export default function ClienteConfiguracionPage({ isView }) {
    return (
        <div className={isView ? "flex-1 w-full flex flex-col bg-slate-50" : "min-h-screen bg-slate-50 flex flex-col"}>
            {!isView && <HeaderHome />}
            <main className={isView ? "flex-1 w-full py-6 px-4" : "flex-1 w-full py-12 px-4"}>
                <div className="max-w-3xl mx-auto">
                    <ConfiguracionPage />
                </div>
            </main>
            {!isView && <Footer />}
        </div>
    );
}
