import axios from "axios";

export const crearFactura = async (data) => {
  const response = await axios.post(
    "http://localhost:3000/api/factura",
    data,
    { withCredentials: true }
  );

  return response.data;
};