import { MdOutlineLock } from "react-icons/md";
import ErrorTemplate from "../../components/error/ErrorTemplate";

export default function Error403Page() {
  return (
    <ErrorTemplate
      codigo="403"
      tituloError="Acceso denegado"
      textoError="No tienes permisos para ver esta página. Si crees que esto es un error, contacta al administrador."
      imagenError={MdOutlineLock}
      altImagenError="Ícono de candado"
      imagenSize="w-36 h-36 md:w-52 md:h-52"
    />
  );
}
