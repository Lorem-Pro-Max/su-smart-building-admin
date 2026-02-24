import {
  createDeviceActions,
  createDeviceDataFetch,
  createMetaFetch,
  createUsageFetchWithRooms,
  createUsageFetchWithoutRooms,
  createSensorDataFetch,
} from "./api.js";

import { DEVICE_CONFIGS } from "../config/devices.js";

export const valveService = {
  ...createDeviceActions(DEVICE_CONFIGS.VALVES.type),
  ...createDeviceDataFetch(DEVICE_CONFIGS.VALVES.type),
  ...createMetaFetch(DEVICE_CONFIGS.VALVES.type),
  ...createUsageFetchWithRooms(DEVICE_CONFIGS.VALVES.type),
};

export const electricityService = {
  ...createMetaFetch(DEVICE_CONFIGS.ELECTRICITY.type),
  ...createUsageFetchWithRooms(DEVICE_CONFIGS.ELECTRICITY.type),
};

export const doorService = {
  ...createDeviceActions(DEVICE_CONFIGS.DOORS.type),
  ...createDeviceDataFetch(DEVICE_CONFIGS.DOORS.type),
};

export const lightService = {
  ...createDeviceActions(DEVICE_CONFIGS.LIGHTS.type),
  ...createDeviceDataFetch(DEVICE_CONFIGS.LIGHTS.type),
};

export const acService = {
  ...createDeviceActions(DEVICE_CONFIGS.AC.type),
  ...createDeviceDataFetch(DEVICE_CONFIGS.AC.type),
};

export const exhaustFanService = {
  ...createDeviceActions(DEVICE_CONFIGS.EXHAUST_FANS.type),
  ...createDeviceDataFetch(DEVICE_CONFIGS.EXHAUST_FANS.type),
};

export const AirQualityService = {
  ...createMetaFetch(DEVICE_CONFIGS.AIR_QUALITY.type),
  ...createSensorDataFetch(DEVICE_CONFIGS.AIR_QUALITY.type),
};
