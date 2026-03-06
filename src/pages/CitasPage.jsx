import HeaderHome from "../components/home/HeaderHome";
import Footer from "../components/layout/Footer";
import AgendarCita from "../components/servicios/AgendarCita";

const CitasPage = () => {
  return (
    <>
      <HeaderHome />
      <main className="bg-slate-50 min-h-screen">
        <AgendarCita />
      </main>
      <Footer />
    </>
  );
};

export default CitasPage;
