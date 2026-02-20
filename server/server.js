import { createServer } from "http";
import app from "./src/app.js";
import { initSocket } from "./src/config/socket.js";
import {
  initIotSocketListener,
  initDeviceMapping,
} from "./src/services/socketService.js";
import { addIotJob, removeIotJob } from "./src/services/deviceQueueService.js";

const PORT = process.env.SERVER_PORT;
const httpServer = createServer(app);

initSocket(httpServer);

const runFullLifecycleTest = async () => {
  await addIotJob(
    "4836",
    "off",
    "2026-02-20 17:04:00+07",
    "booking_101",
    "qid_005",
  );
};

httpServer.listen(PORT, async () => {
  initIotSocketListener();
  await initDeviceMapping();
  runFullLifecycleTest();

  console.log(`[Server] Backend running on port ${PORT}`);
});
