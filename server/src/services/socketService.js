import { io as ioClient } from "socket.io-client";
import { getIO } from "../config/socket.js";

const SOCKET_URL = process.env.IOT_SOCKET_URL;

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
    const [doors, valves] = await Promise.all([
      IoTService.fetchStatus("doors"),
      IoTService.fetchStatus("valves"),
    ]);

    emitDeviceUpdate("doors", groupDevicesByFloor(doors));
    emitDeviceUpdate("valves", groupDevicesByFloor(valves));

    console.log("All device rooms synchronized via IoT trigger");
  } catch (error) {
    console.error("Sync failed:", error.message);
  }
};
