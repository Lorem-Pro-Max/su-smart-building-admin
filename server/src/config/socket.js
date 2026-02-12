import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["https://ssb.slwlabs.dev", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    allowEIO3: true,
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
    throw new Error(
      "Socket client has not been initialized.",
    );
  }
  return io;
};
