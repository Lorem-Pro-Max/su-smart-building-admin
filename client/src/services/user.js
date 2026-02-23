import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

export const getUsers = async (params = {}) => {
  const res = await apiClient.get("/users", {
    params,
  });

  return res.data;
};

export const getUserById = async (id) => {
  const res = await apiClient.get(`/users/${id}`);
  return res.data;
};

export const createUser = async (payload) => {
  const res = await apiClient.post("/users", payload);
  return res.data;
};

export const updateUser = async (id, payload) => {
  const res = await apiClient.patch(`/users/${id}`, payload);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await apiClient.delete(`/users/${id}`);
  return res.data;
};
