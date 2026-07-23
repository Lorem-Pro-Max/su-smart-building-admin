import { useDeviceServices } from "../devices/useDeviceServices";
import { useDeviceControl } from "../devices/useDeviceControl";
import { exhaustFanService } from "@services/deviceService";
import { DEVICE_CONFIGS } from "../../config/devices";

export function useExhaustFans() {
  const config = DEVICE_CONFIGS.EXHAUST_FANS;
  const { state, refresh, PageToast } = useDeviceServices(config, exhaustFanService);
  const control = useDeviceControl(config, refresh, exhaustFanService, state.data);

  return { dataState: state, control: control, PageToast };
}
