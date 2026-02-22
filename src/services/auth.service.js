import { api } from "./api";

export const loginService = (credenciales) => api.post("/auth/login", credenciales);

export const meService = () => api.get("/auth/me");