import { Server } from "socket.io";
import { io as ioClient } from "socket.io-client";

let io;
const IOT_SOCKET_URL = "http://127.0.0.1:3000";

export const initSocket = (server, refreshAllStatus) => {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  const iotSocket = ioClient(IOT_SOCKET_URL);

  iotSocket.on("connect", () => console.log("Connected to IoT(3000)"));
  iotSocket.onAny((eventName) => {
    console.log(`IoT emitted: ${eventName}. Triggering broadcast...`);
    if (typeof refreshAllStatus === "function") {
      refreshAllStatus();
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-page", (pageName) => {
      socket.join(pageName);
      console.log(`Socket ${socket.id} joined room: ${pageName}`);
    });
  });
};

export const emitDeviceUpdate = (room, data) => {
  if (io) {
    io.to(room).emit(`${room}_update`, data);
  }
};
