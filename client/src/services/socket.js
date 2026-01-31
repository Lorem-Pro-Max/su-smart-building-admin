import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_DEV_BACKEND_BASE_URL

export const socket = io(BASE_URL, {
  reconnection: true,
  reconnectionAttempts: 20,
});

socket.on("connect", () => console.log("Socket Connected:", socket.id));
socket.on("disconnect", () => console.log("Socket Disconnected"));
