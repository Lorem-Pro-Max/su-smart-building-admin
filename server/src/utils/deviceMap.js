import { deviceCache } from "../services/socketService.js";

export const getDeviceByHardwareId = (hardwareId) => {
  const cache = deviceCache.byDeviceId[hardwareId];
  if (!cache || cache.length === 0) return null;
  
  return Array.isArray(cache) ? cache[0] : cache;
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