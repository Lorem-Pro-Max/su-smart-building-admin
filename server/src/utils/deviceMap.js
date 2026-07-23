import { deviceCache } from "../services/socketService.js";

export const getDeviceByHardwareId = (hardwareId) => {
  const cache = deviceCache.byDeviceId[hardwareId];
  
  if (!cache) return [];
  
  return Array.isArray(cache) ? cache : [cache];
};

export const getDevicesByRoomId = (roomId) => {
  return deviceCache.byRoomId[roomId] || [];
};

export const getDeviceByTableId = (tableId) => {
  return deviceCache.byId[tableId] || null;
};

export const getSensorsByRoomId = (roomId) => {
  return deviceCache.byRoomSensor[roomId] || [];
};

export const getAllDeviceIdsByType = (deviceType) => {
  const seen = new Set();
  const result = [];

  Object.values(deviceCache.byId).forEach((row) => {
    if (row.key !== deviceType) return;

    const dedupeKey = `${row.device_id}::${row.device_sub_id || ""}`;
    if (seen.has(dedupeKey)) return;

    seen.add(dedupeKey);
    result.push({ id: row.device_id, sub_id: row.device_sub_id || null });
  });

  return result;
};