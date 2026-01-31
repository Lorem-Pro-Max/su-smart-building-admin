export const DEVICE_CONFIGS = {
  DOORS: {
    type: "doors",
    actions: { on: "unlock", off: "lock" },
    deviceStatus: { on: "unlocked", off: "locked" },
  },
  VALVES: {
    type: "valves",
    actions: { on: "open", off: "close" },
    deviceStatus: { on: "open", off: "closed" },
  },
  ELECTRICITY: {
    type: "electricity",
  },
  AC: {
    type: "ac",
    actions: { on: "on", off: "off" },
    deviceStatus: { on: "on", off: "off" },
  },
  LIGHTS: {
    type: "lights",
    actions: { on: "on", off: "off" },
    deviceStatus: { on: "on", off: "off" },
  },
  EXHAUST_FANS: {
    type: "exhaustfans",
    actions: { on: "on", off: "off" },
    deviceStatus: { on: "on", off: "off" },
  },
};
