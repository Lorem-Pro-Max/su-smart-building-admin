import { useDeviceServices } from "../devices/useDeviceServices";
import { useDeviceControl } from "../devices/useDeviceControl";
import { lightService } from "@services/deviceService";
import { DEVICE_CONFIGS } from "../../config/devices";

export function useLights() {
  const config = DEVICE_CONFIGS.LIGHTS;
  const { state, refresh, PageToast } = useDeviceServices(config, lightService);
  const control = useDeviceControl(config, refresh, lightService);

  return { dataState: state, control: control, PageToast };
}
