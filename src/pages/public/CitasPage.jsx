import { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
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
            <header>
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                        <FaCalendarAlt className="text-white text-xl" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Citas</h1>
                </div>
                <p className="mt-2 text-slate-500 text-sm font-medium">
                    Gestiona tus citas y programa nuevas consultas con nuestros especialistas desde un solo lugar.
                </p>
            </header>
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
