import { useState, useEffect, useMemo } from "react";
import {
    FaPlus, FaSearch, FaFilter, FaEdit, FaToggleOn, FaToggleOff,
    FaBox, FaImage, FaTrash, FaCheckCircle, FaTimesCircle,
    FaSort, FaSortUp, FaSortDown
} from "react-icons/fa";
import * as productoService from "../../services/productoService";
import toast from "react-hot-toast";

const CATEGORIES = ["Gafas de Sol", "Monturas", "Lentes de Contacto", "Accesorios"];

export default function InventarioPage() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    const [formData, setFormData] = useState({
        nombre: "",
        categoria: "",
        precio: "",
        stock: "",
        descripcion: "",
        imagen: ""
    });
    const [customCategory, setCustomCategory] = useState("");
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [duplicateConflict, setDuplicateConflict] = useState(null);
    const [isConfirmingUpsert, setIsConfirmingUpsert] = useState(false);

    const fetchProductos = async () => {
        try {
            setLoading(true);
            const data = await productoService.getProductos({
                admin: true,
                categoria: selectedCategory,
                busqueda: searchTerm
            });
            setProductos(data);
        } catch (error) {
            toast.error("Error al cargar inventario");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProductos();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedCategory]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedProductos = useMemo(() => {
        let sortableItems = [...productos];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [productos, sortConfig]);

    const handleOpenModal = (producto = null) => {
        setIsCustomCategory(false);
        setCustomCategory("");
        setDuplicateConflict(null);
        setIsConfirmingUpsert(false);

        if (producto) {
            setEditingProduct(producto);
            const isKnownCategory = CATEGORIES.includes(producto.categoria);

            setFormData({
                nombre: producto.nombre,
                categoria: isKnownCategory ? producto.categoria : "OTRA",
                precio: producto.precio,
                stock: producto.stock,
                descripcion: producto.descripcion || "",
                imagen: producto.imagen || ""
            });

            if (!isKnownCategory) {
                setIsCustomCategory(true);
                setCustomCategory(producto.categoria);
            }
        } else {
            setEditingProduct(null);
            setFormData({
                nombre: "",
                categoria: CATEGORIES[0],
                precio: "",
                stock: "",
                descripcion: "",
                imagen: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "categoria") {
            if (value === "OTRA") {
                setIsCustomCategory(true);
            } else {
                setIsCustomCategory(false);
                setCustomCategory("");
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            categoria: isCustomCategory ? customCategory : formData.categoria
        };

        if (isCustomCategory && !customCategory.trim()) {
            return toast.error("Por favor escribe el nombre de la nueva categoría");
        }

        try {
            if (editingProduct) {
                await productoService.updateProducto(editingProduct.id, finalData);
                toast.success("Producto actualizado correctamente");
            } else {
                await productoService.createProducto(finalData);
                toast.success("Producto creado correctamente");
            }
            setIsModalOpen(false);
            fetchProductos();
        } catch (error) {
            if (error.response?.status === 409) {
                setDuplicateConflict({
                    existing: error.response.data.producto,
                    newStock: formData.stock
                });
            } else {
                toast.error(error.response?.data?.message || "Error al guardar producto");
            }
        }
    };

    const handleUpsertConfirm = async () => {
        if (!duplicateConflict) return;
        const existingStock = parseInt(duplicateConflict.existing.stock);
        const addedStock = parseInt(duplicateConflict.newStock);
        const newStock = existingStock + addedStock;

        try {
            setIsConfirmingUpsert(true);
            await productoService.updateProducto(duplicateConflict.existing.id, {
                ...formData,
                stock: newStock,
                categoria: isCustomCategory ? customCategory : formData.categoria
            });
            toast.success(`Stock actualizado: ${existingStock} → ${newStock}`);
            setIsModalOpen(false);
            setDuplicateConflict(null);
            fetchProductos();
        } catch (error) {
            toast.error("Error al actualizar stock");
        } finally {
            setIsConfirmingUpsert(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const nuevoEstado = currentStatus === "ACTIVO" ? "INACTIVO" : "ACTIVO";
        try {
            await productoService.toggleProductoEstado(id, nuevoEstado);
            toast.success(`Producto ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'}`);
            fetchProductos();
        } catch (error) {
            toast.error("Error al cambiar estado");
        }
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <FaSort className="text-slate-300 ml-1" />;
        return sortConfig.direction === 'asc' ? <FaSortUp className="text-blue-600 ml-1" /> : <FaSortDown className="text-blue-600 ml-1" />;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventario de Productos</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Gestiona el catálogo, stock y visibilidad de tus productos</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-600/20"
                >
                    <FaPlus className="text-sm" />
                    Nuevo Producto
                </button>
            </div>

            {/* Filtros y Buscador */}
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
                    <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none cursor-pointer"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Todas las Categorías</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabla de Productos */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition group select-none"
                                    onClick={() => handleSort('nombre')}
                                >
                                    <div className="flex items-center">
                                        Producto <SortIcon column="nombre" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition group select-none"
                                    onClick={() => handleSort('id')}
                                >
                                    <div className="flex items-center">
                                        ID DB <SortIcon column="id" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition group select-none"
                                    onClick={() => handleSort('categoria')}
                                >
                                    <div className="flex items-center">
                                        Categoría <SortIcon column="categoria" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition group select-none"
                                    onClick={() => handleSort('precio')}
                                >
                                    <div className="flex items-center">
                                        Precio <SortIcon column="precio" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition group select-none"
                                    onClick={() => handleSort('stock')}
                                >
                                    <div className="flex items-center">
                                        Stock <SortIcon column="stock" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition group select-none"
                                    onClick={() => handleSort('estado')}
                                >
                                    <div className="flex items-center">
                                        Estado <SortIcon column="estado" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 w-40 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-12 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-12 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-10 bg-slate-100 float-right rounded"></div></td>
                                    </tr>
                                ))
                            ) : sortedProductos.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No se encontraron productos en el inventario.
                                    </td>
                                </tr>
                            ) : (
                                sortedProductos.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                                                    {p.imagen ? (
                                                        <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FaBox className="text-slate-400 text-xs" />
                                                    )}
                                                </div>
                                                <span className="font-bold text-slate-900 line-clamp-1">{p.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                                                ID: #{p.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                                                {p.categoria}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">${p.precio.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${p.stock < 5 ? 'text-red-600' : 'text-slate-700'}`}>
                                                {p.stock} uds
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {p.estado === 'ACTIVO' ? <FaCheckCircle /> : <FaTimesCircle />}
                                                {p.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
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
                                                    className={`p-2 transition rounded-lg ${p.estado === 'ACTIVO'
                                                        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                                        : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={p.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                                                >
                                                    {p.estado === 'ACTIVO' ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
                                            <div className="space-y-3">
                                                <select
                                                    name="categoria" value={formData.categoria} onChange={handleInputChange} required
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none cursor-pointer"
                                                >
                                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                    <option value="OTRA">Otra categoría...</option>
                                                </select>

                                                {isCustomCategory && (
                                                    <div className="animate-in slide-in-from-top-2 duration-300">
                                                        <input
                                                            type="text"
                                                            placeholder="Escribe la nueva categoría"
                                                            className="w-full px-4 py-3 bg-blue-50/50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-blue-300 text-blue-900 font-medium"
                                                            value={customCategory}
                                                            onChange={(e) => setCustomCategory(e.target.value)}
                                                            autoFocus
                                                        />
                                                    </div>
                                                )}
                                            </div>
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
                                        ></textarea>
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
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
