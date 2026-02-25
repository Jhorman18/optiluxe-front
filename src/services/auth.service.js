import { api } from "./api";


export const loginService = async ({ correo, password }) => {
  return api.post("/auth/login", {
    correo,
    password,
  });
};

export const registerService = async (data) => {
  return api.post("/auth/register", data);
};

export const meService = async () => {
  return api.get("/auth/me");
};

export const logoutService = async () => {
  return api.post("/auth/logout");
};