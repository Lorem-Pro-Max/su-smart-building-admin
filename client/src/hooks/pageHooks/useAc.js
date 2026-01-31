import { useDeviceServices } from "../devices/useDeviceServices";
import { useDeviceControl } from "../devices/useDeviceControl";
import { acService } from "@services/deviceService";
import { DEVICE_CONFIGS } from "../../config/devices";

export function useAc() {
  const config = DEVICE_CONFIGS.AC;
  const { state, refresh } = useDeviceServices(config, acService);
  const control = useDeviceControl(config, refresh, acService);

  return { dataState: state, control: control };
}
