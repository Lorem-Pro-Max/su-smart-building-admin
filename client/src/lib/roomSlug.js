/**
 * URL ของห้องใช้รูปแบบ /rooms-overview/f{ชั้น}/{ชื่อห้อง}
 * แยกชั้นเป็น segment ของตัวเอง เพื่อกันชื่อห้องซ้ำข้ามชั้น (เช่น โถงลิฟต์ มีทุกชั้น)
 */

export const getFloorSegment = (floor) => `f${floor}`;

export const getRoomNameSegment = (name) =>
  String(name ?? "")
    .trim()
    .replace(/\s+/g, "-");

export const getRoomPath = (name, floor) =>
  `/rooms-overview/${getFloorSegment(floor)}/${getRoomNameSegment(name)}`;

/**
 * เช็คว่า device อยู่ในห้องที่ URL ระบุหรือไม่
 * รองรับทั้งรูปแบบใหม่ (floor + name) และ room id เดิม เพื่อไม่ให้ลิงก์เก่าพัง
 */
export const isDeviceInRoom = (device, { floorParam, roomParam }) => {
  if (!roomParam) return false;

  // ลิงก์เดิมแบบ /rooms-overview/13
  if (!floorParam) return String(device.room_id) === String(roomParam);

  return (
    getFloorSegment(device.floor) === String(floorParam) &&
    getRoomNameSegment(device.name) === String(roomParam)
  );
};
