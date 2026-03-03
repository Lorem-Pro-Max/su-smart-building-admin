import { createServer } from "http";
import app from "./src/app.js";
import { initSocket } from "./src/config/socket.js";
import {
  initIotSocketListener,
  initDeviceMapping,
} from "./src/services/socketService.js";
import {
  initColdStartSync,
  initActiveRoomSync,
} from "./src/services/deviceQueueService.js";

const PORT = process.env.SERVER_PORT;
const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, async () => {
  initIotSocketListener();
  await initDeviceMapping();
  await initColdStartSync();
  await initActiveRoomSync();
  console.log(`[Server] Backend running on port ${PORT}`);
});
