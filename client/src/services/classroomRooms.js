import { apiClient } from "../lib/apiClient";

export const getClassroomRoomsByFloor = async (params = {}) => {
  const res = await apiClient.get("/classroom-rooms/by-floor", { params });
  return res.data;
};

export const patchRoomTitle = async (id, payload) => {
  const res = await apiClient.patch(`/classroom-rooms/${id}`, payload);
  return res.data;
};
