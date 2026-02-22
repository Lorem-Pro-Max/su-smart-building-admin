import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

export const getIotLogs = async (params = {}) => {
  try {
    const res = await apiClient.get("/logs", {
      params,
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching IoT logs:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error;
  }
};
