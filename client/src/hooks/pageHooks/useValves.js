import { useDeviceServices } from "@hooks/devices/useDeviceServices";
import { useDeviceControl } from "@hooks/devices/useDeviceControl";
import { useGraphServices } from "@hooks/graph/useGraphServices";
import { valveService } from "@services/deviceService";
import { DEVICE_CONFIGS } from "../../config/devices";

export function useValves() {
  const config = DEVICE_CONFIGS.VALVES;
  const { state, refresh } = useDeviceServices(config, valveService);
  const control = useDeviceControl(config, refresh, valveService);
  const graphService = useGraphServices(valveService);

  return {
    dataState: state,
    control: control,
    graphService: graphService
  };
}
