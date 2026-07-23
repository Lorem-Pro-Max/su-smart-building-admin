import { useMemo } from "react";
import { useToast } from "../../components/utils";
import { BuildingControlMenu } from "../../components/layout/ContentLayout/BuildingControlMenu";
import { BuildingOpenIcon, BuildingCloseIcon } from "../../assets/icons";

const formatPayload = (deviceIds) => {
  return deviceIds.map((uid) => {
    if (typeof uid === "string" && uid.includes("::")) {
      const [id, sub_id] = uid.split("::");
      return { id, sub_id };
    }
    return uid;
  });
};

export function useDeviceControl(config, onRefresh, service, roomData = {}) {
  const { successToast, errorToast, contextHolder } = useToast();

  const { onCount, offCount } = useMemo(() => {
    const rooms = Object.values(roomData).flat();
    const on = rooms.filter((room) => room.isOn).length;
    return { onCount: on, offCount: rooms.length - on };
  }, [roomData]);

  const executeAction = async (deviceIds, apiAction, statusThai) => {
    const totalCount = deviceIds.length;

    try {
      const parsedDeviceIds = formatPayload(deviceIds);
      const response = await service.batchControl(parsedDeviceIds, apiAction);
      const { data } = response;

      if (data?.success) {
        if (data.partial) {
          successToast(`${statusThai}สำเร็จ ${data.successCount} รายการ`, 3);
          const firstError = data.failures?.[0]?.error || "Hardware Timeout";
          errorToast(
            `${statusThai}ไม่สำเร็จ ${data.failCount} รายการ: ${firstError}`,
            4,
          );
        } else {
          const successMsg =
            totalCount > 1
              ? `${statusThai}ทั้งหมด ${totalCount} รายการที่เลือกแล้ว`
              : `${statusThai}รายการที่เลือกแล้ว`;
          successToast(successMsg, 2);
        }

        if (onRefresh) setTimeout(() => onRefresh(), 800);
        return;
      }
    } catch (err) {
      const serverData = err.response?.data;
      const failedCount = serverData?.failCount || totalCount;
      const serverError =
        serverData?.message || err.message || "เกิดข้อผิดพลาด";

      const errorDisplay = `ไม่สามารถ${statusThai}${
        failedCount > 0
          ? ` ${failedCount} รายการที่เลือกได้`
          : "รายการที่เลือกได้"
      }: ${serverError}`;
      errorToast(errorDisplay);
    }
  };

  const handleSingleToggle = async (roomUid, isTurningOn) => {
    const action = isTurningOn ? config.actions.on : config.actions.off;
    const statusThai = isTurningOn ? "เปิด" : "ปิด";
    await executeAction([roomUid], action, statusThai);
  };

  const handleExecuteAction = async (deviceIds, actionKey) => {
    if (!deviceIds?.length) return;

    const apiAction = config.actions[actionKey];
    const statusThai = actionKey === "on" ? "เปิด" : "ปิด";
    await executeAction(deviceIds, apiAction, statusThai);
  };

  const handleExecuteAllAction = async (actionKey) => {
    const apiAction = config.actions[actionKey];
    const statusThai = actionKey === "on" ? "เปิด" : "ปิด";

    try {
      const response = await service.controlAll(apiAction);
      const { data } = response;

      if (data?.success) {
        if (data.partial) {
          successToast(`${statusThai}ทั้งอาคารสำเร็จ ${data.successCount} รายการ`, 3);
          const firstError = data.failures?.[0]?.error || "Hardware Timeout";
          errorToast(
            `${statusThai}ไม่สำเร็จ ${data.failCount} รายการ: ${firstError}`,
            4,
          );
        } else {
          successToast(`${statusThai}ทั้งอาคารสำเร็จ`, 2);
        }

        if (onRefresh) setTimeout(() => onRefresh(), 800);
      }
    } catch (err) {
      const serverData = err.response?.data;
      const serverError =
        serverData?.message || err.message || "เกิดข้อผิดพลาด";
      errorToast(`ไม่สามารถ${statusThai}ทั้งอาคารได้: ${serverError}`);
    }
  };

  const buildingControl = (
    <BuildingControlMenu
      openIcon={<BuildingOpenIcon />}
      closeIcon={<BuildingCloseIcon />}
      onOpen={() => handleExecuteAllAction("on")}
      onClose={() => handleExecuteAllAction("off")}
      onCount={onCount}
      offCount={offCount}
    />
  );

  return {
    handleSingleToggle,
    handleExecuteAction,
    handleExecuteAllAction,
    buildingControl,
    contextHolder,
  };
}
