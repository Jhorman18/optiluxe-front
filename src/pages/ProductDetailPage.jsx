import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductoById, getProductos } from "../services/productoService";
import { useCart } from "../context/cart/CartContext";
import { FaStar, FaChevronRight, FaShoppingCart, FaArrowLeft, FaCheck } from "react-icons/fa";
import Footer from "../components/layout/Footer";
import HeaderHome from "../components/home/HeaderHome";

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cargando: cartLoading } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [adding, setAdding] = useState(false);

    useEffect(() => {
        let active = true;

        async function fetchProduct() {
            try {
                setLoading(true);
                setError(null);
                let data;
                try {
                    data = await getProductoById(id);
                } catch (e) {
                    const all = await getProductos();
                    data = all.find(p => String(p.id) === String(id));
                    if (!data) throw new Error("Producto no encontrado");
                }

                if (active) setProduct(data);
            } catch (err) {
                if (active) setError(err.message || "No se pudo cargar el producto.");
            } finally {
                if (active) setLoading(false);
            }
        }

        fetchProduct();
        return () => { active = false; };
    }, [id]);

    const handleAddToCart = () => {
        setAdding(true);
        addToCart(product.id, 1);
        setTimeout(() => setAdding(false), 500);
    };

    if (loading) {
        return (
            <>
                <HeaderHome />
                <div className="max-w-7xl mx-auto px-6 py-20 animate-pulse">
                    <div className="h-4 w-48 bg-slate-200 rounded mb-16"></div>
                    <div className="h-10 w-3/4 mx-auto bg-slate-200 rounded mb-6"></div>

                    <div className="flex flex-col md:flex-row gap-12 mt-16">
                        <div className="md:w-1/2 h-96 bg-slate-200 rounded-2xl"></div>
                        <div className="md:w-1/2 space-y-4">
                            <div className="h-8 w-full bg-slate-200 rounded"></div>
                            <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                            <div className="h-4 w-full bg-slate-200 rounded"></div>
                            <div className="h-6 w-32 bg-slate-200 rounded mt-8"></div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || !product) {
        return (
            <>
                <HeaderHome />
                <div className="max-w-3xl mx-auto px-6 py-32 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">¡Ups! Producto no encontrado</h2>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <button
                        onClick={() => navigate('/productos')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <FaArrowLeft /> Volver a Productos
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    const description = product.descripcion || "Montura oftálmica premium diseñada para ofrecer la máxima comodidad y durabilidad. Incorpora tecnología de vanguardia y un diseño ergonómico que se adapta perfectamente a tu rostro.";
    const features = product.caracteristicas || [
        "Material ultraligero y resistente",
        "Diseño ergonómico para uso diario",
        "Estilo moderno y profesional",
        "Garantía oficial de 12 meses"
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <HeaderHome />

            <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
                {/* Breadcrumb */}
                <nav className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-12">
                    <Link to="/" className="hover:text-blue-600 transition">Inicio</Link>
                    <FaChevronRight className="mx-2 text-[10px]" />
                    <Link to="/productos" className="hover:text-blue-600 transition">Todos los Productos</Link>
                    <FaChevronRight className="mx-2 text-[10px]" />
                    <span className="text-blue-600 line-clamp-1">{product.nombre}</span>
                </nav>

                {/* Headline Superior (Big Slogan) */}
                <div className="text-center md:max-w-4xl mx-auto mb-16">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-blue-700 mb-4 leading-tight">
                        Descubre la Claridad y el Estilo Ideal
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl font-medium">
                        Renueva tu visión con el modelo {product.nombre}, la fusión perfecta de diseño y salud visual.
                    </p>
                </div>

                {/* Layout de dos columnas: Detalle */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">

                    {/* Columna Izquierda: Imagen */}
                    <div className="lg:w-1/2 flex items-center justify-center">
                        <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-slate-50 rounded-3xl p-8 border border-slate-100 flex items-center justify-center shadow-inner group">
                            <img
                                src={product.imagen || "https://via.placeholder.com/600"}
                                alt={product.nombre}
                                className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                            />
                            <span className="absolute top-6 left-6 bg-white shadow py-1.5 px-3 rounded-full text-xs font-bold tracking-wider text-slate-800 uppercase">
                                {product.categoria}
                            </span>
                        </div>
                    </div>

                    {/* Columna Derecha: Información */}
                    <div className="lg:w-1/2 flex flex-col justify-center">

                        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                            {product.nombre}
                        </h2>

                        <p className="text-slate-500 text-base md:text-lg mb-6 leading-relaxed">
                            {description}
                        </p>

                        <ul className="space-y-3 mb-8">
                            {features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-slate-700 font-medium">
                                    <div className="mt-1 bg-blue-100 text-blue-600 p-0.5 rounded-full text-[10px]">
                                        <FaCheck />
                                    </div>
                                    {feat}
                                </li>
                            ))}
                        </ul>

                        {/* Precio */}
                        <div className="mb-8">
                            <span className="text-4xl font-extrabold text-slate-900">
                                ${product.precio?.toLocaleString()} <span className="text-lg text-slate-400 font-medium">COP</span>
                            </span>
                        </div>

                        {/* Acción de Compra */}
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0 || cartLoading || adding}
                            className={`w-full md:w-auto px-10 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${product.stock === 0
                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                                : adding
                                    ? 'bg-green-500 text-white shadow-green-500/30'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-600/30 hover:-translate-y-1'
                                }`}
                        >
                            {product.stock === 0 ? (
                                "Agotado"
                            ) : adding ? (
                                <> <FaCheck className="text-xl" /> ¡Añadido! </>
                            ) : (
                                <> <FaShoppingCart className="text-xl" /> Añadir al Carrito </>
                            )}
                        </button>

                        {product.stock > 0 && product.stock <= 5 && (
                            <p className="mt-4 text-orange-500 text-sm font-semibold flex items-center gap-1">
                                ¡Solo quedan {product.stock} unidades disponibles!
                            </p>
                        )}

                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
