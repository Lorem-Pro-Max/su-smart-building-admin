export function useDeviceControl(config, onRefresh, service) {
  const handleSingleToggle = async (roomId, isTurningOn) => {
    const action = isTurningOn ? config.actions.on : config.actions.off;
    try {
      await service.batchControl([roomId], action);
      setTimeout(() => onRefresh?.(), 800);
    } catch (error) {
      console.error(`${config.type} toggle failed`, error);
    }
  };

  const handleExecuteAction = async (deviceIds, actionKey) => {
    const apiAction = config.actions[actionKey];
    if (!deviceIds || deviceIds.length === 0) return;

    try {
      await service.batchControl(deviceIds, apiAction);
      setTimeout(() => onRefresh?.(), 800);
    } catch (error) {
      console.error(`${config.type} action failed`, error);
    }
  };

  return { handleSingleToggle, handleExecuteAction };
}