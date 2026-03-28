import { apiClient } from "../lib/apiClient";

export const getClassroomRoomsByFloor = async (params = {}) => {
  const res = await apiClient.get("/classroom-rooms/by-floor", { params });
  return res.data;
};
