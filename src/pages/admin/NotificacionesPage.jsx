import { useState } from "react";
import { FaBell, FaPlus } from "react-icons/fa";
import FormNotificacion from "../../components/admin/FormNotificacion";
import HistorialNotificaciones from "../../components/admin/HistorialNotificaciones";

export default function NotificacionesPage() {
    const [showForm, setShowForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleNotificacionCreada = () => {
        setShowForm(false);
        setRefreshKey(k => k + 1);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                            <FaBell className="text-white text-xl" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notificaciones</h1>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition cursor-pointer ${
                            showForm
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                        }`}
                    >
                        {showForm ? "Ver Historial" : <><FaPlus /> Nueva Notificación</>}
                    </button>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-2">Gestiona la comunicación, promociones y recordatorios con tus pacientes desde un solo lugar.</p>
            </header>

            {showForm ? (
                <div className="animate-in fade-in duration-500 max-w-3xl">
                    <FormNotificacion onSuccess={handleNotificacionCreada} />
                </div>
            ) : (
                <HistorialNotificaciones refreshKey={refreshKey} />
            )}
        </div>
    );
}
