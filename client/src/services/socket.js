import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const socket = io(window.location.origin, {
  path: `${BASE_URL}/socket.io/`,
  reconnection: true,
  reconnectionAttempts: 20,
  withCredentials: true,
  transports: ["websocket", "polling"],
});
