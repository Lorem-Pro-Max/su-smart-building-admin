export const DEVICE_CONFIGS = {
  DOORS: {
    type: "doors",
    actions: { on: "open", off: "close" },
    deviceStatus: { on: true, off: false },
  },
  VALVES: {
    type: "valves",
    actions: { on: true, off: false },
    deviceStatus: { on: true, off: false },
  },
  ELECTRICITY: {
    type: "electricity",
  },
  AC: {
    type: "ac",
    actions: { on: true, off: false },
    deviceStatus: { on: true, off: false },
  },
  LIGHTS: {
    type: "lights",
    actions: { on: true, off: false },
    deviceStatus: { on: true, off: false },
  },
  EXHAUST_FANS: {
    type: "exhaustfans",
    actions: { on: true, off: false },
    deviceStatus: { on: true, off: false },
  },
  AIR_QUALITY: {
    type: "air-quality",
  },
};
