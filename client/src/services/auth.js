import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

export const loginService = async (username, password) => {
  const response = await apiClient.post("/auth/login", { username, password });
  return response.data;
  å;
};

export const logoutService = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};
