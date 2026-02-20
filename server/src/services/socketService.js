import WebSocket from "ws";
import { getIO } from "../config/socket.js";
import { formatDeviceUpdate } from "../utils/responseFormatter.js";
import { fetchDeviceMapping } from "./dbService.js";
import * as IoTService from "./iotService.js";

const SOCKET_URL = process.env.WEBSOCKET_URL;

export let deviceCache = {
  byId: {},
  byDeviceId: {},
};

const DEVICE_PREFIX_MAP = {
  VA: "valves",
  DO: "doors",
  IR: "ac",
  SW: "lights",
  FA: "exhaustFans",
  SD: "smoke",
  MT: "sensors",
};

const EMERGENCY_PREFIXES = new Set(["SM"]);

export const initDeviceMapping = async () => {
  try {
    const rows = await fetchDeviceMapping(); 

    if (!rows || rows.length === 0) {
      console.warn(
        "[Server] No device IDs found from the server",
      );
      deviceCache = { byId: {}, byDeviceId: {} };
      return;
    }

    const byId = {};
    const byDeviceId = {};

    rows.forEach((row) => {
      byId[row.id] = row;

      if (!byDeviceId[row.device_id]) {
        byDeviceId[row.device_id] = [];
      }

      byDeviceId[row.device_id].push(row);
    });
    deviceCache = { byId, byDeviceId };

    console.log(
      `[Server] ${rows.length} devices IDs cached`,
    );
  } catch (error) {
    console.error(
      "[Server] CRITICAL: Failed to initialize device mapping:",
      error.message,
    );
    deviceCache = { byId: {}, byDeviceId: {} };
  }
};

export const emitDeviceUpdate = (room, data) => {
  const io = getIO();
  io.to(room).emit(`${room}_update`, data);
};

export const syncIotDevice = async (deviceType) => {
  try {
    const rawData = await IoTService.fetchStatusByType(deviceType);
    emitDeviceUpdate(deviceType, formatDeviceUpdate(rawData, deviceType));
    // console.log(`[IoT Websocket] Device sync: ${deviceType}`);
  } catch (error) {
    console.error(`[Websocket] Failed to sync '${deviceType}':`, error.message);
  }
};

const throttles = new Map();
const throttleMillisec = 1000;

export const initIotSocketListener = () => {
  console.log("[Websocket] Connecting to IoT server");
  const ws = new WebSocket(SOCKET_URL);

  ws.on("open", () => {
    console.log("[Websocket] IoT server connected");
  });

  ws.on("message", (data) => {
    try {
      const rawData = JSON.parse(data.toString());
      const topic = rawData.topic;

      if (!topic) {
        throw new Error(
          "[Websocket] Failed to receive update topic from IoT server",
        );
      }

      const parts = topic.split("/");
      const fullId = parts[1];

      if (fullId) {
        const prefix = fullId.substring(0, 2);
        const deviceType = DEVICE_PREFIX_MAP[prefix];

        if (deviceType) {
          if (EMERGENCY_PREFIXES.has(prefix)) {
            console.warn(`[Websocket] EMERGENCY DETECTED: ${deviceType}.`);
            syncIotDevice(deviceType);
            return;
          }

          const now = Date.now();
          const lastRun = throttles.get(deviceType) || 0;

          if (now - lastRun >= throttleMillisec) {
            throttles.set(deviceType, now);
            syncIotDevice(deviceType);
          }
        }
      } else {
        throw new Error(
          "[Websocket] Failed to receive device ID from IoT server",
        );
      }
    } catch (error) {
      console.error("[Websocket] IoT device Update Error:", error.message);
    }
  });

  ws.on("error", (err) => {
    console.error("[Websocket] Failed to connect IoT server", err.message);
  });

  ws.on("close", () => {
    console.log("[Websocket] Connection closed. Retrying in 10s...");
    setTimeout(initIotSocketListener, 10000);
  });
};
