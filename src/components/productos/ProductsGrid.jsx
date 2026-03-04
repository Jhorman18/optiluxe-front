import { useEffect, useState, useMemo } from "react";
import { getProductos } from "../../services/productoService";
import ProductCard from "./ProductCard";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";

export default function ProductsGrid() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [priceRange, setPriceRange] = useState(10000000); // Límite inicial a 10M
  const [sortBy, setSortBy] = useState("default");

  // Estado de Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Estado para la UI móvil
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const data = await getProductos();
        if (!cancelado) {
          setProductos(data);

          // Calcular el precio máximo real del catálogo al cargar para setear el slider
          if (data && data.length > 0) {
            const max = Math.max(...data.map(p => p.precio || 0));
            setPriceRange(max);
          }
        }
      } catch {
        if (!cancelado) setError("No fue posible cargar los productos.");
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();
    return () => { cancelado = true; };
  }, []);

  // Obtener categorías únicas dinámicamente
  const categories = useMemo(() => {
    const cats = new Set(productos.map(p => p.categoria));
    return ["Todas", ...Array.from(cats)].filter(Boolean);
  }, [productos]);

  // Precio máximo absoluto del catálogo actual para límite superior del input range
  const maxCatalogPrice = useMemo(() => {
    if (productos.length === 0) return 10000000;
    return Math.max(...productos.map(p => p.precio || 0));
  }, [productos]);

  // Ejecución de pipeline de filtrado y ordenamiento interactivo
  const filteredProducts = useMemo(() => {
    let result = [...productos];

    // 1. Búsqueda por texto (nombre)
    if (searchTerm) {
      const lowerQuery = searchTerm.toLowerCase();
      result = result.filter(p => p.nombre.toLowerCase().includes(lowerQuery));
    }

    // 2. Filtrado por categoría
    if (selectedCategory !== "Todas") {
      result = result.filter(p => p.categoria === selectedCategory);
    }

    // 3. Filtrado por rango de precio
    result = result.filter(p => p.precio <= priceRange);

    // 4. Ordenamiento (Sorting)
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.precio - b.precio);
        break;
      case "price-desc":
        result.sort((a, b) => b.precio - a.precio);
        break;
      case "name-asc":
        result.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case "name-desc":
        result.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      default:
        // default es el orden original del fetch (recomendados)
        break;
    }

    return result;
  }, [productos, searchTerm, selectedCategory, priceRange, sortBy]);

  // Efecto para resetear la página a 1 cada vez que cambia un filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange, sortBy]);

  // Datos Paginados
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Manejador para resetear todos los filtros a la vez
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Todas");
    setPriceRange(maxCatalogPrice);
    setSortBy("default");
  };

  if (cargando) {
    return (
      <section className="py-10 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-6">
          {/* Skeleton para Sidebar en pantallas grandes */}
          <div className="hidden md:block col-span-1 border border-gray-100 p-6 animate-pulse bg-white h-auto rounded-3xl shadow-sm">
            <div className="bg-gray-200 rounded-lg h-6 w-1/2 mb-8" />
            <div className="bg-gray-200 rounded-lg h-4 w-full mb-4" />
            <div className="bg-gray-200 rounded-lg h-4 w-4/5 mb-4" />
            <div className="bg-gray-200 rounded-lg h-4 w-3/4 mb-10" />

            <div className="bg-gray-200 rounded-lg h-6 w-1/2 mb-6" />
            <div className="bg-gray-200 rounded-lg h-10 w-full mb-3" />
            <div className="bg-gray-200 rounded-lg h-3 w-4/5" />
          </div>

          {/* Skeletons para el Grid Principal */}
          <div className="md:col-span-3">
            <div className="bg-white p-4 h-16 w-full rounded-2xl border border-gray-100 shadow-sm animate-pulse mb-6"></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 p-4 animate-pulse bg-white">
                  <div className="bg-gray-200 rounded-xl h-44 w-full mb-5" />
                  <div className="bg-gray-200 rounded h-3 w-1/3 mb-3" />
                  <div className="bg-gray-200 rounded h-4 w-2/3 mb-4" />
                  <div className="flex justify-between mb-4">
                    <div className="bg-gray-200 rounded h-4 w-1/4" />
                    <div className="bg-gray-200 rounded h-4 w-1/4" />
                  </div>
                  <div className="bg-gray-200 rounded h-6 w-1/4 mb-5" />
                  <div className="bg-gray-200 rounded-xl h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-slate-50 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <FaTimes />
          </div>
          <p className="text-red-500 font-bold mb-2 text-lg">¡Ups! Algo salió mal.</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-8">

        {/* ===================== OVERLAY MÓVIL ===================== */}
        {showFilters && (
          <div
            className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* ===================== SIDEBAR ===================== */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl p-6 transform transition-transform duration-300 ease-in-out overflow-y-auto
          md:relative md:translate-x-0 md:w-64 md:bg-transparent md:shadow-none md:p-0 md:z-0 md:flex-shrink-0
          ${showFilters ? "translate-x-0" : "-translate-x-full"}
        `}>
          {/* Cabecera Sidebar en Móvil */}
          <div className="flex items-center justify-between md:hidden mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FaFilter className="text-blue-600" /> Filtros
            </h2>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            >
              <FaTimes />
            </button>
          </div>

          <div className="md:bg-white md:p-6 md:rounded-3xl md:border md:border-gray-100 md:shadow-sm space-y-8">
            <div className="hidden md:flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FaFilter className="text-blue-600 text-sm" /> Filtros
              </h2>
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white font-medium transition"
              >
                Limpiar
              </button>
            </div>

            {/* ---> Bloque Filtro: Categorías <--- */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Categorías</h3>
              <div className="space-y-3">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={selectedCategory === cat}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-slate-200 rounded-full peer-checked:border-blue-600 peer-checked:bg-white transition-all group-hover:border-blue-400"></div>
                      <div className="absolute w-2 h-2 bg-blue-600 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity transform scale-0 peer-checked:scale-100 duration-200"></div>
                    </div>
                    <span className={`text-sm transition-colors ${selectedCategory === cat ? 'text-slate-900 font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* ---> Bloque Filtro: Precio <--- */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Precio Máximo</h3>

              <div className="mb-4 text-center bg-blue-50 py-2.5 rounded-xl text-blue-700 font-bold text-sm border border-blue-100">
                Hasta ${priceRange.toLocaleString()}
              </div>

              <input
                type="range"
                min="0"
                max={maxCatalogPrice}
                step="10000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                <span>$0</span>
                <span>${maxCatalogPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Bóton Limpiar Filtros móvil */}
            <div className="md:hidden pt-6 border-t border-gray-100">
              <button
                onClick={clearFilters}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 border border-slate-200 transition"
              >
                Restablecer Filtros
              </button>
            </div>
          </div>
        </aside>

        {/* ===================== CONTENEDOR PRINCIPAL ===================== */}
        <div className="flex-1">

          {/* ---> Top Bar: Buscador y Ordenamiento <--- */}
          <div className="bg-white p-3 md:p-4 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Buscador de texto */}
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o modelo..."
                className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-700 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
              />
            </div>

            {/* Controles a la derecha */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Botón Filtros (solo móvil visible) */}
              <button
                onClick={() => setShowFilters(true)}
                className="md:hidden flex items-center justify-center gap-2 flex-1 sm:flex-none py-3 px-5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-2xl text-sm font-bold transition"
              >
                <FaFilter /> Filtros
              </button>

              {/* Selector de ordenamiento */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none block w-full pl-4 pr-10 py-3 text-sm border border-slate-200 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-slate-700 font-medium hover:border-slate-300 transition-colors appearance-none relative"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: `right 0.5rem center`,
                  backgroundRepeat: `no-repeat`,
                  backgroundSize: `1.5em 1.5em`
                }}
              >
                <option value="default">Recomendados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="name-asc">Nombre: A - Z</option>
                <option value="name-desc">Nombre: Z - A</option>
              </select>
            </div>
          </div>

          {/* ---> Rejilla (Grid) de Productos <--- */}
          {filteredProducts.length > 0 ? (
            <div>
              <div className="mb-5 text-sm text-slate-500 flex items-center gap-2">
                Mostrando <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-md font-bold text-xs">{paginatedProducts.length}</span> de {filteredProducts.length} producto{filteredProducts.length !== 1 && 's'}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Controles de Paginación */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Anterior
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition ${currentPage === pageNum
                            ? "bg-blue-600 text-white border-blue-600"
                            : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-600"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border md:border-dashed border-gray-200 rounded-3xl py-24 px-6 text-center">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <FaSearch className="text-slate-300 text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sin coincidencias</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                No pudimos encontrar ningún producto que coincida con tus criterios de búsqueda. Intenta ajustar los filtros.
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 text-white font-bold py-3 px-8 rounded-xl transition"
              >
                Explorar todos
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}