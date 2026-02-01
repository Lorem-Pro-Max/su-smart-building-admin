import axios from "axios";
import { socket } from "../services/socket";

const BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_PROD_BACKEND_BASE_URL 
  : import.meta.env.VITE_DEV_BACKEND_BASE_URL;

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

export const createDeviceActions = (device) => ({
  batchControl: (deviceIds, action, value) =>
    apiClient.post(`/${device}/batch-control`, { deviceIds, action, value }),

  controlAll: (action, value) =>
    apiClient.post(`/${device}/control-all`, { action, value }),
});

export const createDeviceDataFetch = (device) => ({
  getStatus: async (floor) => {
    const response = await apiClient.get(`/${device}/status`, {
      params: { floor },
    });
    return response.data.data;
  },

  subscribe: (onUpdate) => {
    const socketEvent = `${device}_update`;
    socket.emit("join-page", device);

    const handleUpdate = (payload) => {
      const freshData = payload.data || payload;
      onUpdate(freshData);
    };

    socket.on(socketEvent, handleUpdate);

    return () => {
      socket.off(socketEvent, handleUpdate);
    };
  },
});

export const createMetaFetch = (device) => ({
  getMetadata: async () => {
    const data = await apiClient.get(`/${device}/usage/metadata`, {});
    return data.data.data;
  },
});

export const createUsageFetchWithRooms = (device) => ({
  fetchDaily: async (floor, room) => {
    const { data } = await apiClient.get(`/${device}/usage/daily`, {
      params: { floor: floor, room: room },
    });
    return data.data;
  },

  fetchHourly: async (date, floor, room) => {
    const { data } = await apiClient.get(`/${device}/usage/hourly`, {
      params: { date: date, floor: floor, room: room },
    });
    return data.data;
  },
});

export const createUsageFetchWithoutRooms = (device) => ({
  fetchDaily: async (floor) => {
    const { data } = await apiClient.get(`/${device}/usage/daily`, {
      params: { floor: floor },
    });
    return data.data;
  },

  fetchHourly: async (date, floor) => {
    const { data } = await apiClient.get(`/${device}/usage/hourly`, {
      params: { date: date, floor: floor },
    });
    return data.data;
  },
});
