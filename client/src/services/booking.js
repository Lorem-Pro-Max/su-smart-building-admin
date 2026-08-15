import { apiClient } from "../lib/apiClient";

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

export const getApproveBookingFilters = async () => {
  const res = await apiClient.get("/bookings/filters");
  return res.data;
};