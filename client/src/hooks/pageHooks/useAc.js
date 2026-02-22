import { useState } from "react";
import { useDeviceServices } from "../devices/useDeviceServices";
import { useDeviceControl } from "../devices/useDeviceControl";
import { acService } from "@services/deviceService";
import { DEVICE_CONFIGS } from "../../config/devices";
import { useToast } from "@components/utils";

export function useAc() {
  const [activePopoverId, setActivePopoverId] = useState(null);

  const { successToast, errorToast, contextHolder } = useToast();

  const config = DEVICE_CONFIGS.AC;
  const { state, refresh, PageToast } = useDeviceServices(config, acService);
  const control = useDeviceControl(config, refresh, acService);

  const handlePopoverChange = (id, isOpen) => {
    setActivePopoverId(isOpen ? id : null);
  };

  const handleTempChange = async (deviceId, newTemp) => {
    try {
      const response = await acService.acTempControl(deviceId, newTemp);

      if (response.data.success) {
        successToast(`ปรับอุณหภูมิเป็น ${newTemp}°C สำเร็จ`, 1);
        setActivePopoverId(null);

        if (refresh) setTimeout(() => refresh(), 800);
      } else {
        throw new Error(response.data.error || "ไม่สามารถปรับอุณหภูมิได้");
      }
    } catch (error) {
      console.error("Temp Change Error:", error);
      errorToast(error.message || "เกิดข้อผิดพลาดในการปรับอุณหภูมิ");
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
    contextHolder,
    PageToast,
  };
}
