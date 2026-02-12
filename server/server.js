import { createServer } from "http";
import app from "./src/app.js"; 
import { initSocket } from "./src/config/socket.js";
import {
  initHardwareListener,
  syncAllDevices,
} from "./src/services/socketService.js";

const PORT = 4000;
const httpServer = createServer(app);

initSocket(httpServer);
initHardwareListener(syncAllDevices);

httpServer.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Socket.io ready`);
});