import { apiClient } from "../lib/apiClient";

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
