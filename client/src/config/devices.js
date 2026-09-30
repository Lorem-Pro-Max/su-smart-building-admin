export const actionSet = {
  actions: { on: "on", off: "off" },
  deviceStatus: { on: true, off: false },
};

export const DEVICE_CONFIGS = {
  DOORS: {
    type: "doors",
    label: "ประตู",
    ...actionSet,
  },
  VALVES: {
    type: "valves",
    label: "น้ำ",
    ...actionSet,
  },
  ELECTRICITY: {
    type: "electricity",
    ...actionSet,
  },
  AC: {
    type: "ac",
    label: "เครื่องปรับอากาศ",
    ...actionSet,
  },
  LIGHTS: {
    type: "lights",
    label: "แสงสว่าง",
    ...actionSet,
  },
  EXHAUST_FANS: {
    type: "exhaustfans",
    label: "พัดลมดูดอากาศ",
    ...actionSet,
  },
  AIR_QUALITY: {
    type: "air-quality",
  },
};
