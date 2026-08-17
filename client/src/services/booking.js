import { apiClient } from "../lib/apiClient";

export const getBookings = async ({
  page,
  limit,
  bookingTypes,
  floors,
  statuses,
}) => {
  const params = {
    page,
    limit,
  };

  if (bookingTypes?.length) {
    params.bookingTypes = bookingTypes.join(",");
  }

  if (floors?.length) {
    params.floors = floors.join(",");
  }

  if (statuses?.length) {
    params.statuses = statuses.join(",");
  }

  const res = await apiClient.get("/bookings", {
    params,
  });

  return res.data;
};

export const updateBookingStatus = async (
  id,
  status,
  reason = "",
  cancelIds = [],
) => {
  const res = await apiClient.patch(`/bookings/${id}/status`, {
    status,
    reason,
    cancelIds,
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

export const deleteBookings = async (ids) => {
  const response = await apiClient.delete("/bookings", {
    data: {
      ids,
    },
  });

  return response.data;
};
