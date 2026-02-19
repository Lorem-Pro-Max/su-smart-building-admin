import axios from "axios";

const IOT_BASE_URL = process.env.IOT_SERVER_URL;

const DEVICE_MAP = {
  ac: {
    path: "ac",
    actions: { on: true, off: false },
  },
  exhaustFans: {
    path: "fa",
    actions: { on: true, off: false },
  },
  lights: {
    path: "sw",
    actions: { on: true, off: false },
  },
  valves: {
    path: "water",
    actions: { on: true, off: false },
  },
  doors: {
    path: "door",
    actions: { on: "open", off: "close" },
  },
  sensors: {
    path: "sensor",
    actions: { on: true, off: false },
  },
};

export const fetchStatusByType = async (deviceType) => {
  const response = await axios.get(
    `${IOT_BASE_URL}/control/${DEVICE_MAP[deviceType]["path"]}/all`,
  );
  return response.data || {};
};

export const fetchDeviceList = async (baseType, deviceType) => {
  const response = await axios.get(
    `${IOT_BASE_URL}/control/${DEVICE_MAP[baseType]["path"]}/${deviceType}/list`,
  );
  return response.data || [];
};

export const executeBatch = async (type, ids, action, value = null) => {
  return await Promise.all(
    ids.map((id) =>
      axios
        .post(
          `${IOT_BASE_URL}/control/${DEVICE_MAP[type]["path"]}/${id}/command`,
          {
            power: DEVICE_MAP[type]["actions"][action],
          },
        )
        .then((r) => ({ status: r.status, data: r.data }))
        .catch((e) => ({
          id,
          status: "failed",
          error: e.response?.data?.message || e.message || "Unknown Error",
        })),
    ),
  );
};

export const executeDoorAction = async (type, ids, action) => {
  const indices = [1, 2];

  const batchResults = await Promise.all(
    ids.map(async (deviceId) => {
      const doorResults = await Promise.all(
        indices.map((index) =>
          axios
            .post(
              `${IOT_BASE_URL}/control/door/${deviceId}/${index}/${DEVICE_MAP["doors"]["actions"][action]}`,
            )
            .then((r) => ({ status: r.status, data: r.data }))
            .catch((e) => ({
              status: "failed",
              data: { success: false, error: e.message },
            })),
        ),
      );

      const doorSuccessful = doorResults.every((r) => r.status === 200);
      return { status: doorSuccessful ? 200 : 500, success: doorSuccessful };
    }),
  );

  const allDoorsSuccessful = batchResults.every((r) => r.success);

  return [
    {
      status: allDoorsSuccessful ? 200 : 500,
      data: { success: allDoorsSuccessful },
    },
  ];
};

export const executeAcTempAdjustment = async (acId, targetTemp) => {
  const response = await axios.post(
    `${IOT_BASE_URL}/control/ac/${acId}/command`,
    { temp: targetTemp },
  );
  return response.data || {};
};
