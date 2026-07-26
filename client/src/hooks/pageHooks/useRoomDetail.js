import { useState } from "react";
import { useDeviceServices } from "../devices/useDeviceServices";
import { useDeviceControl } from "../devices/useDeviceControl";
import {
  doorService,
  exhaustFanService,
  lightService,
  acService,
} from "@services/deviceService";
import { DEVICE_CONFIGS } from "../../config/devices";
import { apiClient } from "../../lib/apiClient";
import { roomActions } from "@services/api";
import { isDeviceInRoom } from "../../lib/roomSlug";
import { useToast } from "@components/utils";

const filterByRoom = (data, routeParams) =>
  Object.values(data)
    .flat()
    .filter((device) => isDeviceInRoom(device, routeParams));

export function useRoomDetail(routeParams) {
  const doors = useDeviceServices(DEVICE_CONFIGS.DOORS, doorService);
  const fans = useDeviceServices(DEVICE_CONFIGS.EXHAUST_FANS, exhaustFanService);
  const lights = useDeviceServices(DEVICE_CONFIGS.LIGHTS, lightService);
  const ac = useDeviceServices(DEVICE_CONFIGS.AC, acService);

  const doorsControl = useDeviceControl(
    DEVICE_CONFIGS.DOORS,
    doors.refresh,
    doorService,
    doors.state.data,
  );
  const fansControl = useDeviceControl(
    DEVICE_CONFIGS.EXHAUST_FANS,
    fans.refresh,
    exhaustFanService,
    fans.state.data,
  );
  const lightsControl = useDeviceControl(
    DEVICE_CONFIGS.LIGHTS,
    lights.refresh,
    lightService,
    lights.state.data,
  );
  const acControl = useDeviceControl(
    DEVICE_CONFIGS.AC,
    ac.refresh,
    acService,
    ac.state.data,
  );

  const { successToast, errorToast, showLoadingToast, dismissToast, contextHolder } =
    useToast();

  const [activePopoverId, setActivePopoverId] = useState(null);

  const handlePopoverChange = (id, isOpen) => {
    setActivePopoverId(isOpen ? id : null);
  };

  const handleTempChange = async (deviceId, newTemp) => {
    try {
      const response = await acService.acTempControl(deviceId, newTemp);

      if (response.data.success) {
        successToast(`ปรับอุณหภูมิเป็น ${newTemp}°C สำเร็จ`, 1);
        setActivePopoverId(null);
        setTimeout(ac.refresh, 800);
      } else {
        throw new Error(response.data.error || "ไม่สามารถปรับอุณหภูมิได้");
      }
    } catch (error) {
      errorToast(error.message || "เกิดข้อผิดพลาดในการปรับอุณหภูมิ");
    }
  };

  const roomDevices = {
    doors: filterByRoom(doors.state.data, routeParams),
    fans: filterByRoom(fans.state.data, routeParams),
    lights: filterByRoom(lights.state.data, routeParams),
    ac: filterByRoom(ac.state.data, routeParams),
  };

  const allRoomDevices = [
    ...roomDevices.doors,
    ...roomDevices.fans,
    ...roomDevices.lights,
    ...roomDevices.ac,
  ];
  const room = allRoomDevices[0];

  // API ของห้องยังใช้ numeric id จึงต้องหาจาก device ที่ match ได้
  const roomId = room?.room_id;

  const refreshAll = () => {
    doors.refresh();
    fans.refresh();
    lights.refresh();
    ac.refresh();
  };

  const handleMasterSwitch = async (action) => {
    const statusThai = action === "on" ? "เปิด" : "ปิด";
    const totalCount = allRoomDevices.length;
    const loadingKey = showLoadingToast(
      `กำลัง${statusThai}อุปกรณ์ทั้งห้อง (${totalCount} อุปกรณ์)`,
    );

    try {
      const response = await apiClient.post(
        `/classroom-rooms/${roomId}/control-all`,
        { action },
      );
      const { data } = response;

      if (data?.success) {
        if (data.partial) {
          successToast(
            `${statusThai}อุปกรณ์สำเร็จ ${data.successCount} อุปกรณ์`,
            3,
          );
          const firstError = data.failures?.[0]?.error || "Hardware Timeout";
          errorToast(
            `${statusThai}ไม่สำเร็จ ${data.failCount} อุปกรณ์: ${firstError}`,
            6,
          );
        } else {
          successToast(
            `${statusThai}อุปกรณ์ทั้งห้องสำเร็จ (${totalCount} อุปกรณ์)`,
            3,
          );
        }
        setTimeout(refreshAll, 800);
      }
    } catch (err) {
      const serverData = err.response?.data;
      const serverError =
        serverData?.message || err.message || "เกิดข้อผิดพลาด";
      errorToast(`ไม่สามารถ${statusThai}อุปกรณ์ทั้งห้องได้: ${serverError}`, 6);
    } finally {
      dismissToast(loadingKey);
    }
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingRoom, setIsSavingRoom] = useState(false);

  const handleSaveRoom = async (fields) => {
    setIsSavingRoom(true);
    try {
      const { data } = await roomActions.updateRoom(roomId, fields);

      if (data?.success) {
        successToast("บันทึกข้อมูลห้องสำเร็จ", 3);
        setIsEditModalOpen(false);
        // ปลอดภัยที่จะ refresh ทันที เพราะ backend await recache เสร็จก่อนตอบกลับแล้ว
        refreshAll();
      } else {
        throw new Error(data?.message || "ไม่สามารถบันทึกข้อมูลห้องได้");
      }
    } catch (err) {
      const serverError =
        err.response?.data?.message || err.message || "เกิดข้อผิดพลาด";
      errorToast(`ไม่สามารถบันทึกข้อมูลห้องได้: ${serverError}`, 6);
    } finally {
      setIsSavingRoom(false);
    }
  };

  return {
    room,
    roomDevices,
    editModal: {
      isOpen: isEditModalOpen,
      isSaving: isSavingRoom,
      open: () => setIsEditModalOpen(true),
      close: () => setIsEditModalOpen(false),
      save: handleSaveRoom,
    },
    controls: {
      doors: doorsControl,
      fans: fansControl,
      lights: lightsControl,
      ac: acControl,
    },
    handleMasterSwitch,
    tempControl: {
      activePopoverId,
      handlePopoverChange,
      handleTempChange,
    },
    contextHolder,
    deviceContextHolders: [
      doorsControl.contextHolder,
      fansControl.contextHolder,
      lightsControl.contextHolder,
      acControl.contextHolder,
    ],
  };
}
