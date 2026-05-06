import { MdOutlineWifiOff } from "react-icons/md";
import ErrorTemplate from "../../components/error/ErrorTemplate";

export default function Error500Page() {
  return (
    <ErrorTemplate
      codigo="500"
      tituloError="Error del servidor"
      textoError="Algo salió mal en el servidor. Estamos trabajando para solucionarlo. Intenta de nuevo en unos minutos."
      imagenError={MdOutlineWifiOff}
      altImagenError="Ícono de sin conexión"
      imagenSize="w-36 h-36 md:w-52 md:h-52"
    />
  );
}
