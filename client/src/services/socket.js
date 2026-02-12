import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("Current Base URL:", BASE_URL); 

export const socket = io(BASE_URL, {
  reconnection: true,
  reconnectionAttempts: 20,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => console.log("Socket Connected:", socket.id));
socket.on("disconnect", () => console.log("Socket Disconnected"));
