import axios from "axios";

const BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_PROD_BACKEND_BASE_URL
  : import.meta.env.VITE_DEV_BACKEND_BASE_URL;

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

export const getBookings = async (params = {}) => {
  const res = await apiClient.get("/bookings", {
    params,
  });
  return res.data;
};

export const updateBookingStatus = async (id, status, reason, cancelId) => {
  const res = await apiClient.patch(`/bookings/${id}/status`, {
    status,
    reason,
    cancelId,
  });

  return res.data;
};

export const getBookingById = async (id) => {
  const res = await apiClient.get(`/bookings/${id}`);

  return res.data;
};
