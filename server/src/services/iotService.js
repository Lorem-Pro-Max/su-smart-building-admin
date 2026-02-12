import axios from "axios";

const IOT_BASE_URL = process.env.IOT_SERVER_URL;

const mapping = {
  ac: "ac",
  exhaustFans: "fa",
  lights: "sw",
  doors: "door",
  sensors: "sensor",
};

export const fetchStatus = async (deviceType) => {
  const response = await axios.get(`${IOT_BASE_URL}/status/${deviceType}`);
  return response.data;
};

export const fetchStatusByType = async (deviceType) => {
  const response = await axios.get(
    `${IOT_BASE_URL}/control/${mapping[deviceType]}/all`,
  );
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

export const executeGlobal = async (type, action, value = null) => {
  const response = await axios.post(`${IOT_BASE_URL}/control/${type}/all`, {
    action,
    value,
  });
  return response.data;
};
