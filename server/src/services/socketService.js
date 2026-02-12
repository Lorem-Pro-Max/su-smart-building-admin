import { io as ioClient } from "socket.io-client";
import { getIO } from "../config/socket.js";
import { formatProductionUpdate } from "../utils/responseFormatter.js";
import { fetchDeviceMapping } from "./dbService.js";

const SOCKET_URL = process.env.IOT_SERVER_URL;

export let deviceCache = {};

export const initializeDeviceMapping = async () => {
  const rows = await fetchDeviceMapping();
  deviceCache = rows.reduce((acc, row) => {
    acc[row.device_id] = row;
    return acc;
  }, {});
};

export const emitDeviceUpdate = (room, data) => {
  const io = getIO();
  io.to(room).emit(`${room}_update`, data);
};

export const initHardwareListener = (refreshAllStatus) => {
  const iotSocket = ioClient(SOCKET_URL);
  iotSocket.on("connect", () => console.log("Connected to IoT Server"));

  iotSocket.onAny((eventName) => {
    console.log(`IoT emitted: ${eventName}.`);
    if (typeof refreshAllStatus === "function") {
      refreshAllStatus();
    }
  });

  return iotSocket;
};

export const syncAllDevices = async () => {
  try {
    const [doors, valves, ac, lights, exhaustFans] = await Promise.all([
      IoTService.fetchStatusByType("doors"),
      IoTService.fetchStatusByType("valves"),
      IoTService.fetchStatusByType("ac"),
      IoTService.fetchStatusByType("lights"),
      IoTService.fetchStatusByType("exhaustFans"),
    ]);

    emitDeviceUpdate("doors", formatProductionUpdate(doors));
    emitDeviceUpdate("valves", formatProductionUpdate(valves));
    emitDeviceUpdate("ac", formatProductionUpdate(ac));
    emitDeviceUpdate("lights", formatProductionUpdate(lights));
    emitDeviceUpdate("exhaustFans", formatProductionUpdate(exhaustFans));
    

    console.log("All device rooms synchronized via IoT trigger");
  } catch (error) {
    console.error("Sync failed:", error.message);
  }
};
