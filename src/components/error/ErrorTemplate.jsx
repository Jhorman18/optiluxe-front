import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/AuthContext";

export default function ErrorTemplate({
  codigo,
  tituloError,
  textoError,
  imagenError: ImagenError,
  altImagenError,
  imagenSize = "w-36 h-36 md:w-52 md:h-52",
}) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const irInicio = () => {
    navigate(isAuthenticated ? "/" : "/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <div className="mb-6">
        <ImagenError
          className={`${imagenSize} mx-auto text-blue-600`}
          aria-label={altImagenError}
          role="img"
        />
      </div>

      {codigo && (
        <h1 className="text-6xl md:text-7xl font-extrabold text-blue-600 mb-2">
          {codigo}
        </h1>
      )}

      <h2 className="md:text-2xl 2xl:text-4xl font-semibold text-gray-800 mb-3">
        {tituloError}
      </h2>

      <p className="text-gray-500 max-w-md mb-6 2xl:text-lg">
        {textoError}
      </p>

      <button
        onClick={irInicio}
        className="cursor-pointer px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
      >
        Volver al inicio
      </button>

      {codigo && (
        <p className="text-sm text-gray-400 mt-6">
          Código de error: {codigo}
        </p>
      )}
    </div>
  );
}
