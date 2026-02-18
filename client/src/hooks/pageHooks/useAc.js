import { useDeviceServices } from "../devices/useDeviceServices";
import { useDeviceControl } from "../devices/useDeviceControl";
import { acService } from "@services/deviceService";
import { DEVICE_CONFIGS } from "../../config/devices";
import { useState } from "react";

export function useAc() {
  const [activePopoverId, setActivePopoverId] = useState(null);

  const config = DEVICE_CONFIGS.AC;
  const { state, refresh } = useDeviceServices(config, acService);
  const control = useDeviceControl(config, refresh, acService);

  const handlePopoverChange = (id, isOpen) => {
    setActivePopoverId(isOpen ? id : null);
  };

  const handleTempChange = async (deviceId, newTemp) => {
    try {
      const response = await acService.acTempControl(deviceId, newTemp);

      if (response.data.success) {
        setActivePopoverId(null);
      }
    } catch (error) {
      console.error("Temp Change Error:", error);
    }
  };

  return {
    dataState: state,
    control: control,
    tempControl: {
      activePopoverId,
      handlePopoverChange,
      handleTempChange,
    },
  };
}
