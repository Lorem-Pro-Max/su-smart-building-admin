import { notification } from "antd";

export function useDeviceControl(config, onRefresh, service) {
  const [api, contextHolder] = notification.useNotification({
    stack: { threshold: 0 },
  });

  const openNotification = (type, apiAction, length) => {
    api[type]({
      title: "ล้มเหลว",
      description: `${apiAction == "on" ? "เปิด" : "ปิด"} สำหรับ ${length} ห้อง`,
      duration: 1.5,
      styles: {
        root: {
          backgroundColor: type == "success" ? "#F6FFED" : "#FFE5E5",
        },
      },
    });
  };

  const handleSingleToggle = async (roomId, isTurningOn) => {
    const action = isTurningOn ? config.actions.on : config.actions.off;
    try {
      const response = await service.batchControl([roomId], action);
      const { data } = response;

      if (data?.success || response.status === 200) {
        setTimeout(() => onRefresh?.(), 800);
      } else {
        throw new Error(data?.error || "Unknown device error");
      }
    } catch (error) {
      openNotification("error", error);
    }
  };

  const handleExecuteAction = async (deviceIds, actionKey) => {
    const apiAction = config.actions[actionKey];
    if (!deviceIds?.length) return;

    try {
      const response = await service.batchControl(deviceIds, apiAction);

      if (response.data?.success) {
        setTimeout(() => onRefresh?.(), 800);
      } else {
        throw new Error(response.data?.error || "Batch control failed");
      }
    } catch (error) {
      openNotification("error", error);
    }
  };

  return { handleSingleToggle, handleExecuteAction, contextHolder };
}
