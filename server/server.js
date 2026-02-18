import { createServer } from "http";
import app from "./src/app.js";
import { initSocket } from "./src/config/socket.js";
import {
  initIotSocketListener,
  initializeDeviceMapping,
} from "./src/services/socketService.js";

const PORT = process.env.SERVER_PORT;
const httpServer = createServer(app);

initSocket(httpServer);
initIotSocketListener();
initializeDeviceMapping();

httpServer.listen(PORT, () => {
  console.log(`[Server] Backend running on port ${PORT}`);
});
