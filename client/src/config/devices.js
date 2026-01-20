export const BASE_URL = import.meta.env.VITE_DEV_BACKEND_BASE_URL;

export const API_ENDPOINTS = {
  DOORS: `${BASE_URL}/api/status/doors`,
  VALVES: `${BASE_URL}/api/status/valves`,
};

export const DEVICE_CONFIGS = {
  DOORS: {
    actions: { on: "unlock", off: "lock" },
    deviceStatus: { on: "unlocked", off: "locked"},
    event: "door_update",
  },
  VALVES: {
    actions: { on: "open", off: "close" },
    deviceStatus: { on: "open", off: "closed"},
    event: "valve_update",
  },
};
