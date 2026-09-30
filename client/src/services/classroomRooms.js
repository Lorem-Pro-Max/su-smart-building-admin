import { apiClient } from "../lib/apiClient";

export const getClassroomRoomsByFloor = async (params = {}) => {
  const res = await apiClient.get("/classroom-rooms/by-floor", { params });
  return res.data;
};

export const patchRoomTitle = async (id, payload) => {
  const res = await apiClient.patch(`/classroom-rooms/${id}`, payload);
  return res.data;
};

/* ห้องที่เปิดให้จอง พร้อมที่นั่ง/อาคาร สำหรับตัวเลือกห้อง */
export const getBookableRooms = async () => {
  const res = await apiClient.get("/classroom-rooms/bookable");

  return res.data.data;
};

/* % ห้องว่างรายวัน ใช้ระบายสีปฏิทิน */
export const getBuildingAvailability = async (start_date, end_date) => {
  const res = await apiClient.get("/classroom-rooms/availability", {
    params: { start_date, end_date },
  });

  return res.data.data;
};
