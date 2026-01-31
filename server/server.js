import { createServer } from "http";
import app from "./src/app.js"; 
import { initSocket } from "./src/utils/socketManager.js";
import { syncAllDevices } from "./src/services/syncService.js"; 
import dotenv from "dotenv";

dotenv.config(); 

const PORT = process.env.PORT || 4000;
const httpServer = createServer(app);

initSocket(httpServer, syncAllDevices); 

httpServer.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Socket.io ready`);
});