import { BiSearchAlt2 } from "react-icons/bi";
import ErrorTemplate from "../../components/error/ErrorTemplate";

export default function Error404Page() {
  return (
    <ErrorTemplate
      codigo="404"
      tituloError="Página no encontrada"
      textoError="La página que buscas no existe o fue movida. Verifica la URL o regresa al inicio."
      imagenError={BiSearchAlt2}
      altImagenError="Ícono de lupa"
      imagenSize="w-36 h-36 md:w-52 md:h-52"
    />
  );
}
