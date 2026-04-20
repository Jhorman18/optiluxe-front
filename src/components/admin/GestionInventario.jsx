import { useState, useEffect, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
    FaPlus, FaSearch, FaFilter, FaEdit, FaToggleOn, FaToggleOff,
    FaBoxOpen, FaBox, FaImage, FaTimesCircle, FaCheckCircle,
} from "react-icons/fa";
import * as productoService from "../../services/productoService";
import { getCategoriasAdmin } from "../../services/categoriaService";
import toast from "react-hot-toast";
import DataTable from "../ui/DataTable";
import StatusBadge from "../ui/StatusBadge";
import CustomSelect from "../ui/CustomSelect";

import { useAuth } from "../../context/auth/AuthContext";

const columnHelper = createColumnHelper();

export default function GestionInventario() {
    const { rol } = useAuth();
    const esEmpleado = rol === "EMPLEADO";

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [formData, setFormData] = useState({
        nombre: "", idCategoria: "", precio: "", stock: "", descripcion: "", imagen: ""
    });
    const [duplicateConflict, setDuplicateConflict] = useState(null);
    const [isConfirmingUpsert, setIsConfirmingUpsert] = useState(false);

    useEffect(() => {
        getCategoriasAdmin()
            .then(setCategorias)
            .catch(() => toast.error("Error al cargar categorías"));
    }, []);

    const fetchProductos = async () => {
        try {
            setLoading(true);
            const data = await productoService.getProductos({
                admin: true,
                categoria: selectedCategory,
                busqueda: searchTerm,
            });
            setProductos(data);
        } catch {
            toast.error("Error al cargar inventario");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchProductos(), 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedCategory]);

    const handleOpenModal = (producto = null) => {
        setDuplicateConflict(null);
        setIsConfirmingUpsert(false);

        if (producto) {
            setEditingProduct(producto);
            setFormData({
                nombre: producto.nombre,
                idCategoria: producto.idCategoria,
                precio: producto.precio,
                stock: producto.stock,
                descripcion: producto.descripcion || "",
                imagen: producto.imagen || "",
            });
        } else {
            setEditingProduct(null);
            setFormData({
                nombre: "",
                idCategoria: categorias[0]?.idCategoria ?? "",
                precio: "",
                stock: "",
                descripcion: "",
                imagen: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await productoService.updateProducto(editingProduct.id, formData);
                toast.success("Producto actualizado correctamente");
            } else {
                await productoService.createProducto(formData);
                toast.success("Producto creado correctamente");
            }
            setIsModalOpen(false);
            fetchProductos();
        } catch (error) {
            if (error.response?.status === 409) {
                setDuplicateConflict({ existing: error.response.data.producto, newStock: formData.stock });
            } else {
                toast.error(error.response?.data?.message || "Error al guardar producto");
            }
        }
    };

    const handleUpsertConfirm = async () => {
        if (!duplicateConflict) return;
        const newStock = parseInt(duplicateConflict.existing.stock) + parseInt(duplicateConflict.newStock);
        try {
            setIsConfirmingUpsert(true);
            await productoService.updateProducto(duplicateConflict.existing.id, {
                ...formData,
                stock: newStock,
            });
            toast.success(`Stock actualizado: ${duplicateConflict.existing.stock} → ${newStock}`);
            setIsModalOpen(false);
            setDuplicateConflict(null);
            fetchProductos();
        } catch {
            toast.error("Error al actualizar stock");
        } finally {
            setIsConfirmingUpsert(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const nuevoEstado = currentStatus === "ACTIVO" ? "INACTIVO" : "ACTIVO";
        try {
            await productoService.toggleProductoEstado(id, nuevoEstado);
            toast.success(`Producto ${nuevoEstado === "ACTIVO" ? "activado" : "desactivado"}`);
            fetchProductos();
        } catch {
            toast.error("Error al cambiar estado");
        }
    };

    const columns = useMemo(() => [
        columnHelper.accessor("nombre", {
            header: "Producto",
            cell: ({ row: { original: p } }) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                        {p.imagen
                            ? <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                            : <FaBox className="text-slate-400 text-xs" />}
                    </div>
                    <span className="font-bold text-slate-900 line-clamp-1">{p.nombre}</span>
                </div>
            ),
            meta: { skeletonClass: "h-10 w-40" },
        }),
        columnHelper.accessor("id", {
            header: "ID DB",
            cell: ({ getValue }) => (
                <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                    ID: #{getValue()}
                </span>
            ),
            meta: { skeletonClass: "h-6 w-12" },
        }),
        columnHelper.accessor("categoria", {
            header: "Categoría",
            cell: ({ getValue }) => (
                <span className="text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                    {getValue()}
                </span>
            ),
            meta: { skeletonClass: "h-6 w-24" },
        }),
        columnHelper.accessor("precio", {
            header: "Precio",
            cell: ({ getValue }) => (
                <span className="font-bold text-slate-900">${Number(getValue()).toLocaleString()}</span>
            ),
            meta: { skeletonClass: "h-6 w-16" },
        }),
        columnHelper.accessor("stock", {
            header: "Stock",
            cell: ({ getValue }) => {
                const stock = getValue();
                return (
                    <span className={`font-bold ${stock < 5 ? "text-red-600" : "text-slate-700"}`}>
                        {stock} uds
                    </span>
                );
            },
            meta: { skeletonClass: "h-6 w-12" },
        }),
        columnHelper.accessor("estado", {
            header: "Estado",
            cell: ({ getValue }) => <StatusBadge status={getValue()} />,
            meta: { skeletonClass: "h-6 w-20" },
        }),
        ...(!esEmpleado ? [columnHelper.display({
            id: "_acciones",
            header: "Acciones",
            cell: ({ row: { original: p } }) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => handleOpenModal(p)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => handleToggleStatus(p.id, p.estado)}
                        className={`p-2 transition rounded-lg ${p.estado === "ACTIVO"
                            ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
                            : "text-slate-400 hover:text-green-600 hover:bg-green-50"
                        }`}
                        title={p.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                    >
                        {p.estado === "ACTIVO" ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
                    </button>
                </div>
            ),
            meta: { headerClassName: "text-right", skeletonClass: "h-6 w-10 float-right" },
        })] : []),
    ], [handleOpenModal, handleToggleStatus, esEmpleado]);

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">

            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                            <FaBoxOpen className="text-white text-xl" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventario de Productos</h1>
                    </div>
                    {!esEmpleado && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-600/20"
                        >
                            <FaPlus className="text-sm" />
                            Nuevo Producto
                        </button>
                    )}
                </div>
                <p className="text-sm font-medium text-slate-500 mt-2">Gestiona el catálogo, stock y visibilidad de tus productos desde un solo panel.</p>
            </header>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="relative col-span-1 md:col-span-2">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <CustomSelect
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        placeholder="Todas las Categorías"
                        options={[
                            { value: "", label: "Todas las Categorías" },
                            ...categorias.map(cat => ({ value: cat.catNombre, label: cat.catNombre }))
                        ]}
                    />
                </div>
            </div>

            {/* Tabla */}
            <DataTable
                columns={columns}
                data={productos}
                loading={loading}
                emptyMessage="No se encontraron productos en el inventario."
                pageSize={10}
                initialSorting={[{ id: "id", desc: false }]}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {duplicateConflict ? (
                            <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
                                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 text-4xl">
                                    <FaBox />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">¡Producto Existente!</h3>
                                    <p className="text-slate-500 mt-2">
                                        Ya existe "<span className="font-bold text-slate-800">{duplicateConflict.existing.nombre}</span>"
                                        en la categoría <span className="font-bold text-slate-800">{duplicateConflict.existing.categoria}</span>.
                                    </p>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-4 flex justify-around items-center">
                                        <div className="text-center">
                                            <p className="text-xs text-slate-400 font-bold uppercase">Stock Actual</p>
                                            <p className="text-xl font-bold text-slate-700">{duplicateConflict.existing.stock} uds</p>
                                        </div>
                                        <div className="text-amber-500 text-2xl font-bold">+</div>
                                        <div className="text-center">
                                            <p className="text-xs text-slate-400 font-bold uppercase">A sumar</p>
                                            <p className="text-xl font-bold text-blue-600">{duplicateConflict.newStock} uds</p>
                                        </div>
                                        <div className="text-slate-300 text-2xl">=</div>
                                        <div className="text-center">
                                            <p className="text-xs text-slate-400 font-bold uppercase">Nuevo Total</p>
                                            <p className="text-xl font-bold text-green-600">
                                                {parseInt(duplicateConflict.existing.stock) + parseInt(duplicateConflict.newStock)} uds
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setDuplicateConflict(null)}
                                        className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                                    >
                                        Cambiar Nombre
                                    </button>
                                    <button
                                        onClick={handleUpsertConfirm}
                                        disabled={isConfirmingUpsert}
                                        className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                    >
                                        {isConfirmingUpsert ? "Procesando..." : "Sí, Sumar Stock"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                                        <FaTimesCircle className="text-2xl" />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">
                                                Nombre del Producto <span className="text-red-500 ml-0.5">*</span>
                                            </label>
                                            <input
                                                type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">
                                                Categoría <span className="text-red-500 ml-0.5">*</span>
                                            </label>
                                            <CustomSelect
                                                value={formData.idCategoria}
                                                onChange={(val) => handleInputChange({ target: { name: "idCategoria", value: val } })}
                                                placeholder="Selecciona una categoría"
                                                options={categorias.map(cat => ({ value: String(cat.idCategoria), label: String(cat.catNombre) }))}
                                                required={true}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">
                                                Precio ($ COP) <span className="text-red-500 ml-0.5">*</span>
                                            </label>
                                            <input
                                                type="number" name="precio" value={formData.precio} onChange={handleInputChange} required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">
                                                Stock Inicial <span className="text-red-500 ml-0.5">*</span>
                                            </label>
                                            <input
                                                type="number" name="stock" value={formData.stock} onChange={handleInputChange} required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">
                                            URL de la Imagen <span className="text-red-500 ml-0.5">*</span>
                                        </label>
                                        <div className="flex gap-3">
                                            <input
                                                type="text" name="imagen" value={formData.imagen} onChange={handleInputChange} required
                                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                placeholder="https://ejemplo.com/imagen.jpg"
                                            />
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                                                {formData.imagen ? <img src={formData.imagen} className="w-full h-full object-cover" /> : <FaImage className="text-slate-300" />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">
                                            Descripción <span className="text-red-500 ml-0.5">*</span>
                                        </label>
                                        <textarea
                                            name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows="3" required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button" onClick={() => setIsModalOpen(false)}
                                            className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                                        >
                                            {editingProduct ? "Guardar Cambios" : "Crear Producto"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
}
