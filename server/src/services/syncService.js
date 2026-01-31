import * as IoTService from "./iotService.js";
import { emitDeviceUpdate } from "../utils/socketManager.js";
import { groupDevicesByFloor } from "../utils/responseFormatter.js";

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
