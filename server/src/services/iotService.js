import axios from "axios";

const IOT_BASE_URL = "http://127.0.0.1:3000/api";

export const fetchStatus = async (deviceType) => {
  const response = await axios.get(`${IOT_BASE_URL}/status/${deviceType}`);
  return response.data; 
};

export const executeBatch = async (type, ids, action, value = null) => {
  return await Promise.all(
    ids.map((id) =>
      axios.post(`${IOT_BASE_URL}/control/${type}/${id}`, { action, value })
        .then(r => ({ id, status: "success" }))
        .catch(e => ({ id, status: "failed", error: e.message }))
    )
  );
};

export const executeGlobal = async (type, action, value = null) => {
  const response = await axios.post(`${IOT_BASE_URL}/control/${type}/all`, { action, value });
  return response.data;
};