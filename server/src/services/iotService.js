import axios from "axios";

const IOT_BASE_URL = process.env.IOT_SERVER_URL;

const mapping = {
  ac: "ac",
  exhaustFans: "fa",
  lights: "sw",
  doors: "door",
  sensors: "sensor",
  valves: "water",
};

export const fetchStatusByType = async (deviceType) => {
  const response = await axios.get(
    `${IOT_BASE_URL}/control/${mapping[deviceType]}/all`,
  );
  return response.data || {};
};

export const fetchDeviceList = async (deviceType) => {
  const response = await axios.get(`${IOT_BASE_URL}/control/${deviceType}/all`);
  return response.data || {};
};

export const executeBatch = async (type, ids, action, value = null) => {
  return await Promise.all(
    ids.map((id) =>
      axios
        .post(`${IOT_BASE_URL}/control/${mapping[type]}/${id}/command`, {
          power: action,
        })
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
            .post(`${IOT_BASE_URL}/control/door/${deviceId}/${index}/${action}`)
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
