import axios from "axios";

const IOT_BASE_URL = process.env.IOT_SERVER_URL;
const DEVICE_MAP = {
  ac: {
    path: "ac",
    actions: { on: true, off: false },
  },
  "exhaust-fans": {
    path: "fa",
    actions: { on: true, off: false },
  },
  lights: {
    path: "sw",
    actions: { on: true, off: false },
  },
  valves: {
    path: "water",
    actions: { on: "open", off: "close" },
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

export const apiClient = axios.create({
  baseURL: `${IOT_BASE_URL}/control`,
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

export const fetchStatusByType = async (deviceType) => {
  const response = await apiClient.get(
    `/${DEVICE_MAP[deviceType]["path"]}/all`,
  );
  return response.data || {};
};

export const fetchDeviceList = async (baseType, deviceType) => {
  const response = await apiClient.get(
    `/${DEVICE_MAP[baseType]["path"]}/${deviceType}/list`,
  );
  return response.data || [];
};

export const executeBatch = async (
  baseType,
  deviceObjects,
  action,
  value = null,
) => {
  return Promise.all(
    deviceObjects.map(async ({ id }) => {
      const path = DEVICE_MAP[baseType]?.path;
      const powerValue = DEVICE_MAP[baseType]?.actions[action];
      const url = `/${path}/${id}/command`;

      try {
        const r = await apiClient.post(url, { power: powerValue });

        if (r.data?.success === false) {
          return {
            id,
            status: 200,
            data: r.data,
            error: r.data.error || r.data.detail,
          };
        }
        return { id, status: r.status, data: r.data };
      } catch (e) {
        return {
          id,
          status: e.response?.status || 500,
          data: e.response?.data || { success: false },
          error:
            e.response?.data?.detail || e.response?.data?.error || e.message,
        };
      }
    }),
  );
};

export const executeDoorAction = async (
  type,
  deviceObjects,
  action,
  value = null,
) => {
  const doorAction = DEVICE_MAP[type]["actions"][action];
  const indices = [1, 2];

  return Promise.all(
    deviceObjects.map(async ({ id }) => {
      try {
        const doorResults = await Promise.all(
          indices.map((index) =>
            apiClient.post(`/door/${id}/${index}/${doorAction}`),
          ),
        );

        const hardwareError = doorResults.find(
          (r) => r.data?.success === false,
        );
        if (hardwareError) {
          return {
            id,
            status: 200,
            data: hardwareError.data,
            error: hardwareError.data.error,
          };
        }

        return { id, status: 200, data: { success: true } };
      } catch (e) {
        return {
          id,
          status: e.response?.status || 500,
          data: e.response?.data || { success: false },
          error: e.response?.data?.detail || e.message,
        };
      }
    }),
  );
};

export const executeValveAction = async (
  type,
  deviceObjects,
  action,
  value = null,
) => {
  const valveAction = DEVICE_MAP[type]["actions"][action];

  return Promise.all(
    deviceObjects.map(async ({ id, sub_id }) => {
      const url = `/water/${id}/${sub_id}/${valveAction}`;
      try {
        const r = await apiClient.post(url);

        if (r.data.status !== "success") {
          return {
            id,
            status: 200,
            data: r.data,
            error: r.data.error || r.data.detail,
          };
        }
        return { id, status: r.status, data: { success: true } };
      } catch (e) {
        return {
          id,
          status: e.response?.status || 500,
          data: e.response?.data || { success: false },
          error: e.response?.data?.detail || e.message,
        };
      }
    }),
  );
};

export const executeAcTempAdjustment = async (acId, targetTemp) => {
  const url = `/ac/${acId}/command`;
  try {
    const r = await apiClient.post(url, { temp: targetTemp });

    if (r.data?.success === false) {
      return {
        id: acId,
        status: 200,
        data: r.data,
        error: r.data.error || r.data.detail || "Hardware Rejected Command",
      };
    }

    return { id: acId, status: r.status, data: r.data };
  } catch (e) {
    return {
      id: acId,
      status: e.response?.status || 500,
      data: e.response?.data || { success: false },
      error: e.response?.data?.detail || e.response?.data?.error || e.message,
    };
  }
};
