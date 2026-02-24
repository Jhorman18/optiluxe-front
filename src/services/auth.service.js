import { api } from "./api";

/**
 * LOGIN
 * @param {Object} credenciales
 * @param {string} credenciales.correo
 * @param {string} credenciales.password
 */
export const loginService = async ({ correo, password }) => {
  return api.post("/auth/login", {
    correo,
    password,
  });
};

/**
 * REGISTER
 * Recibe el payload ya mapeado desde AuthContext
 */
export const registerService = async (data) => {
  return api.post("/auth/register", data);
};

/**
 * OBTENER USUARIO ACTUAL
 */
export const meService = async () => {
  return api.get("/auth/me");
};

/**
 * LOGOUT (opcional si usas cookies o sesión)
 */
export const logoutService = async () => {
  return api.post("/auth/logout");
};