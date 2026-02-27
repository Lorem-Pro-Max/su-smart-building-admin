import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const socket = io("/", {
  path: "/admin-dashboard/socket.io/",
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 15000,
  transports: ["websocket", "polling"],
});
