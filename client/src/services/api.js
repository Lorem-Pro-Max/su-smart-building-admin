import { apiClient } from "../lib/apiClient";
import { socket } from "../services/socket";
import dayjs from "dayjs";

const formatDeviceIds = (deviceIds) => {
  return deviceIds.map((uid) => {
    if (typeof uid === "string" && uid.includes("::")) {
      const [id, sub_id] = uid.split("::");
      return { id: id, sub_key: sub_id };
    }

    if (typeof uid === "object" && uid !== null) return uid;
    return { id: uid, sub_key: null };
  });
};

export const createDeviceActions = (device) => ({
  batchControl: (deviceIds, action, value) => {
    const formattedDeviceIds = formatDeviceIds(deviceIds);

    return apiClient.post(`/${device}/batch-control`, {
      deviceIds: formattedDeviceIds,
      action,
      value,
    });
  },

  acTempControl: (deviceId, temp) =>
    apiClient.post(`/ac/temp-control`, { device_id: deviceId, temp: temp }),

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

export const createSensorDataFetch = (device) => ({
  getSensorRoomData: async (id) => {
    const response = await apiClient.get(`/${device}/sensor/room/${id}`);
    return response.data;
  },

  getSensorRankedData: async (type, orderby) => {
    const response = await apiClient.get(
      `/${device}/sensor/ranking?type=${type}&order=${orderby}`,
    );
    return response.data;
  },
});

export const createMetaFetch = (device) => ({
  getMetadata: async () => {
    const data = await apiClient.get(`/${device}/usage/metadata`, {});
    return data.data.data;
  },

  getSensorMetadata: async () => {
    const data = await apiClient.get(`/${device}/sensor/metadata`, {});
    return data.data;
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
    const formattedDate = dayjs(date).format("YYYY-MM-DD");

    const { data } = await apiClient.get(`/${device}/usage/hourly`, {
      params: { date: formattedDate, floor: floor, room: room },
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

export const createElectricityUsageFetch = (device) => ({
  getMetadata: async () => {
    const { data } = await apiClient.get(`/${device}/usage/metadata`);
    return data.data;
  },

  fetchDailyByFloor: async (floor) => {
    const { data } = await apiClient.get(`/${device}/usage/daily`, {
      params: { floor, device: "all" },
    });
    return data.data;
  },

  fetchDailyByDevice: async (floor, deviceId) => {
    const { data } = await apiClient.get(`/${device}/usage/daily`, {
      params: { floor, device: deviceId },
    });
    return data.data;
  },

  fetchHourlyByFloor: async (date, floor) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");

    const { data } = await apiClient.get(`/${device}/usage/hourly`, {
      params: { date: formattedDate, floor, device: "all" },
    });

    return data.data;
  },

  fetchHourlyByDevice: async (date, floor, deviceId) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");

    const { data } = await apiClient.get(`/${device}/usage/hourly`, {
      params: { date: formattedDate, floor, device: deviceId },
    });

    return data.data;
  },
});
