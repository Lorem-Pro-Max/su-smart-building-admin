import axios from "axios";

const BASE_URL = import.meta.env.VITE_DEV_BACKEND_BASE_URL;

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

export const getAllSchedule = async (params = {}) => {
  const res = await apiClient.get("/schedule/iot-schedule", {
    params,
  });
  return res.data;
};

export const deleteScheduleById = async (idList) => {
  const res = await apiClient.delete("/schedule/iot-schedule/deletes", {
    data: { idList },
  });

  return res.data;
};

export const getRooms = async (params = {}) => {
  const res = await apiClient.get("/schedule/rooms", {
    params,
  });
  return res.data;
};

export const getRoomById = async (roomId) => {
  const res = await apiClient.get(`/schedule/room-device/${roomId}`);
  return res.data;
};

export const createSchedules = async (params = {}) => {
  const res = await apiClient.post("/schedule/iot-schedule/bulk", {
    ...params,
  });
  return res.data;
};

export const getAllBooking = async (params = {}) => {
  const res = await apiClient.get("/schedule/iot-schedule/booking", {
    params,
  });
  return res.data;
};
