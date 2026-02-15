import { createServer } from "http";
import app from "./src/app.js";
import { initSocket } from "./src/config/socket.js";
import {
  initHardwareListener,
  initializeDeviceMapping,
} from "./src/services/socketService.js";

const PORT = process.env.SERVER_PORT;
const httpServer = createServer(app);

initSocket(httpServer);
initHardwareListener();
initializeDeviceMapping();

httpServer.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
