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
  const { successToast, errorToast, showLoadingToast, dismissToast, contextHolder } =
    useToast();

  const { onCount, offCount } = useMemo(() => {
    const rooms = Object.values(roomData).flat();
    const on = rooms.filter((room) => room.isOn).length;
    return { onCount: on, offCount: rooms.length - on };
  }, [roomData]);

  const deviceLabel = config.label || "";

  const executeAction = async (deviceIds, apiAction, statusThai) => {
    const totalCount = deviceIds.length;
    const loadingKey = showLoadingToast(
      `กำลัง${statusThai}${deviceLabel} ${totalCount} รายการ`,
    );

    try {
      const parsedDeviceIds = formatPayload(deviceIds);
      const response = await service.batchControl(parsedDeviceIds, apiAction);
      const { data } = response;

      if (data?.success) {
        if (data.partial) {
          successToast(
            `${statusThai}${deviceLabel}สำเร็จ ${data.successCount} รายการ`,
            3,
          );
          const firstError = data.failures?.[0]?.error || "Hardware Timeout";
          errorToast(
            `${statusThai}${deviceLabel}ไม่สำเร็จ ${data.failCount} รายการ: ${firstError}`,
            6,
          );
        } else {
          const successMsg =
            totalCount > 1
              ? `${statusThai}${deviceLabel}ทั้งหมด ${totalCount} รายการที่เลือกแล้ว`
              : `${statusThai}${deviceLabel}รายการที่เลือกแล้ว`;
          successToast(successMsg, 3);
        }

        if (onRefresh) setTimeout(() => onRefresh(), 800);
        return;
      }
    } catch (err) {
      const serverData = err.response?.data;
      const failedCount = serverData?.failCount || totalCount;
      const serverError =
        serverData?.message || err.message || "เกิดข้อผิดพลาด";

      const errorDisplay = `ไม่สามารถ${statusThai}${deviceLabel}${
        failedCount > 0
          ? ` ${failedCount} รายการที่เลือกได้`
          : "รายการที่เลือกได้"
      }: ${serverError}`;
      errorToast(errorDisplay, 6);
    } finally {
      dismissToast(loadingKey);
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
    const totalCount = onCount + offCount;
    const loadingKey = showLoadingToast(
      `กำลัง${statusThai}${deviceLabel}ทั้งอาคาร ${totalCount} รายการ`,
    );

    try {
      const response = await service.controlAll(apiAction);
      const { data } = response;

      if (data?.success) {
        if (data.partial) {
          successToast(
            `${statusThai}${deviceLabel}ทั้งอาคารสำเร็จ ${data.successCount} รายการ`,
            3,
          );
          const firstError = data.failures?.[0]?.error || "Hardware Timeout";
          errorToast(
            `${statusThai}${deviceLabel}ไม่สำเร็จ ${data.failCount} รายการ: ${firstError}`,
            6,
          );
        } else {
          successToast(`${statusThai}${deviceLabel}ทั้งอาคารสำเร็จ`, 3);
        }

        if (onRefresh) setTimeout(() => onRefresh(), 800);
      }
    } catch (err) {
      const serverData = err.response?.data;
      const serverError =
        serverData?.message || err.message || "เกิดข้อผิดพลาด";
      errorToast(
        `ไม่สามารถ${statusThai}${deviceLabel}ทั้งอาคารได้: ${serverError}`,
        6,
      );
    } finally {
      dismissToast(loadingKey);
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
