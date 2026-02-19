export const actionSet = {
  actions: { on: "on", off: "off" },
  deviceStatus: { on: true, off: false },
};

export const DEVICE_CONFIGS = {
  DOORS: {
    type: "doors",
    ...actionSet,
  },
  VALVES: {
    type: "valves",
    ...actionSet,
  },
  ELECTRICITY: {
    type: "electricity",
    ...actionSet,
  },
  AC: {
    type: "ac",
    ...actionSet,
  },
  LIGHTS: {
    type: "lights",
    ...actionSet,
  },
  EXHAUST_FANS: {
    type: "exhaustfans",
    ...actionSet,
  },
  AIR_QUALITY: {
    type: "air-quality",
  },
};
