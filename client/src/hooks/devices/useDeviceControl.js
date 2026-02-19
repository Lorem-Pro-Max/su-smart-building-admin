import { useToast } from "../../components/utils";

export function useDeviceControl(config, onRefresh, service) {
  const { successToast, errorToast, contextHolder } = useToast();

  const executeAction = async (deviceIds, apiAction, statusThai) => {
    const totalCount = deviceIds.length;

    try {
      const response = await service.batchControl(deviceIds, apiAction);
      const { data } = response;

      if (data?.success) {
        const successMsg =
          totalCount > 1
            ? `${statusThai}ทั้งหมด ${totalCount} รายการที่เลือกแล้ว`
            : `${statusThai}รายการที่เลือกแล้ว`;

        successToast(successMsg, 1);
        if (onRefresh) setTimeout(() => onRefresh(), 800);
        return;
      }

      throw {
        message: data?.error,
        failedCount: data?.failedCount,
      };
    } catch (err) {
      const serverData = err.response?.data;
      const failedCount = serverData?.failedCount || 0;
      const serverError = serverData?.error || err.message || "เกิดข้อผิดพลาด";

      const errorDisplay =
        failedCount == 1
          ? `ไม่สามารถ${statusThai}รายการที่เลือกได้ 
        (${serverError})`
          : failedCount > 1
            ? `ไม่สามารถ${statusThai}ได้ ${failedCount} รายการ 
        (${serverError})`
            : serverError;

      errorToast(errorDisplay);
    }
  };

  const handleSingleToggle = async (roomId, isTurningOn) => {
    const action = isTurningOn ? config.actions.on : config.actions.off;
    const statusThai = isTurningOn ? "เปิด" : "ปิด";
    await executeAction([roomId], action, statusThai);
  };

  const handleExecuteAction = async (deviceIds, actionKey) => {
    if (!deviceIds?.length) return;

    const apiAction = config.actions[actionKey];
    const statusThai = actionKey === "on" ? "เปิด" : "ปิด";
    await executeAction(deviceIds, apiAction, statusThai);
  };

  return { handleSingleToggle, handleExecuteAction, contextHolder };
}
