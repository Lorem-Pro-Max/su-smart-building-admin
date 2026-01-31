import { useState, useCallback, useEffect } from "react";

const normalizeDeviceData = (data, onStatus) => {
  return Object.fromEntries(
    Object.entries(data).map(([floor, rooms]) => [
      floor,
      Object.values(rooms).map((room) => ({
        ...room,
        isOn: room.status === onStatus,
      })),
    ]),
  );
};

export function useDeviceServices(config, service) {
  const [state, setState] = useState({
    data: {},
    isLoading: true,
    isError: null,
  });

  const setNormalizedData = useCallback(
    (rawData) => {
      const normalized = normalizeDeviceData(rawData, config.deviceStatus.on);
      setState({ data: normalized, isLoading: false, isError: null });
    },
    [config.deviceStatus.on],
  );

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const freshData = await service.getStatus();
      setNormalizedData(freshData);
    } catch (err) {
      setState((prev) => ({ ...prev, isLoading: false, isError: err.message }));
    }
  }, [service, setNormalizedData]);

  useEffect(() => {
    refresh();
    const unsubscribe = service.subscribe((payload) =>
      setNormalizedData(payload),
    );
    return () => unsubscribe();
  }, [refresh, service, setNormalizedData]);

  return { state, refresh };
}
