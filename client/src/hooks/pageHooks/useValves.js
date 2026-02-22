import { useDeviceServices } from "../devices/useDeviceServices";
import { useDeviceControl } from "../devices/useDeviceControl";
import { valveService } from "@services/deviceService";
import { useGraphServices } from "@hooks/graph/useGraphServices";
import { DEVICE_CONFIGS } from "../../config/devices";

export function useValves() {
  const config = DEVICE_CONFIGS.VALVES;
  const { state, refresh, PageToast } = useDeviceServices(config, valveService);
  const control = useDeviceControl(config, refresh, valveService);
  const graphService = useGraphServices(valveService);

  return {
    dataState: state,
    control: control,
    graphService: graphService,
    PageToast
  };
}
