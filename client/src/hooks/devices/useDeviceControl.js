import { notification } from "antd";

export function useDeviceControl(config, onRefresh, service) {
  const [api, contextHolder] = notification.useNotification({
    stack: { threshold: 0 },
  });

const openNotification = (type, message) => {
  const description = typeof message === 'object' ? (message.message || "An unexpected error occurred") : message;

  api[type]({
    title: "ล้มเหลว",
    description: String(description),
    duration: 5,
    placement: "topRight",
    style: {
      backgroundColor: type === "success" ? "#F6FFED" : "#FFE5E5",
    },
  });
};

  const handleSingleToggle = async (roomId, isTurningOn) => {
    const action = isTurningOn ? config.actions.on : config.actions.off;
    try {
      const response = await service.batchControl([roomId], action);
      const { data } = response;

      if (data.success == true) {
        setTimeout(() => onRefresh?.(), 800);
      } else {
        openNotification("error", data.error);
      }
    } catch (error) {
      openNotification("error", error.message || "การเชื่อมต่อล้มเหลว");
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
