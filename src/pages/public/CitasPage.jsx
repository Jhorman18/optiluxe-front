import { useState } from "react";
import HeaderHome from "../../components/home/HeaderHome";
import Footer from "../../components/layout/Footer";
import AgendarCita from "../../components/servicios/AgendarCita";
import MisCitas from "../../components/servicios/MisCitas";

const CitasPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <>
      <HeaderHome />

      <main className="bg-slate-50 min-h-screen">
        <div className="bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-900">Citas</h1>
            <p className="mt-1 text-slate-500 text-sm">
              Gestiona tus citas y programa nuevas consultas con nuestros especialistas.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-2">
              <MisCitas refreshKey={refreshKey} onRefresh={triggerRefresh} />
            </div>
            <div className="lg:col-span-3">
              <AgendarCita refreshKey={refreshKey} onCitaAgendada={triggerRefresh} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CitasPage;
