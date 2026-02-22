import { useDeviceServices } from "../devices/useDeviceServices";
import { useDeviceControl } from "../devices/useDeviceControl";
import { doorService } from "@services/deviceService";
import { DEVICE_CONFIGS } from "../../config/devices";

export function useDoors() {
  const config = DEVICE_CONFIGS.DOORS;
  const { state, refresh, PageToast } = useDeviceServices(config, doorService);
  const control = useDeviceControl(config, refresh, doorService);

  return { dataState: state, control: control, PageToast };
}
