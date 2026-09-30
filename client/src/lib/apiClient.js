import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 8000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const errorData = error.response?.data;
    if (errorData instanceof Blob && errorData.type.includes("json")) {
      error.response.data = await errorData
        .text()
        .then(JSON.parse)
        .catch(() => errorData);
    }

    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      error.message = "Request timeout";
    }
    if (error.response?.status === 403) {
      const msg = error.response?.data?.message || "";
      if (msg.includes("ระงับ") || msg.includes("Access Token Expired")) {
        localStorage.removeItem("accessToken");
        window.location.href = "/admin-dashboard/login";
      }
    }
    return Promise.reject(error);
  },
);
