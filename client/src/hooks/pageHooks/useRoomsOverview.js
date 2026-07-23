import { useDeviceServices } from "../devices/useDeviceServices";
import {
  doorService,
  exhaustFanService,
  lightService,
  acService,
} from "@services/deviceService";
import { DEVICE_CONFIGS } from "../../config/devices";

export function useRoomsOverview() {
  const doors = useDeviceServices(DEVICE_CONFIGS.DOORS, doorService);
  const fans = useDeviceServices(DEVICE_CONFIGS.EXHAUST_FANS, exhaustFanService);
  const lights = useDeviceServices(DEVICE_CONFIGS.LIGHTS, lightService);
  const ac = useDeviceServices(DEVICE_CONFIGS.AC, acService);

  return {
    doorsData: doors.state.data,
    fansData: fans.state.data,
    lightsData: lights.state.data,
    acData: ac.state.data,
    PageToasts: [doors.PageToast, fans.PageToast, lights.PageToast, ac.PageToast],
  };
}
