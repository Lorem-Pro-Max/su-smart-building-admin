import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:7185", "http://localhost:8080", "http://100.75.100.116:8080"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: false,
    },
    allowEIO3: true,
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    socket.on("join-page", (pageName) => {
      socket.join(pageName);
      console.log(`Socket ${socket.id} joined room: ${pageName}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket client has not been initialized.");
  }
  return io;
};
