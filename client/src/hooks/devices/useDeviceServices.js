import { useState, useCallback, useEffect } from "react";
import { useToast } from "@components/utils";

const normalizeDeviceData = (data, onStatus) => {
  return Object.fromEntries(
    Object.entries(data).map(([floor, rooms]) => [
      floor,
      Object.values(rooms).map((room) => ({
        ...room,
        isOn: room.status.power === onStatus,
      })),
    ]),
  );
};

export function useDeviceServices(config, service) {
  const { errorToast, contextHolder } = useToast();

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
      console.log(err);
      errorToast(
        err.message.includes("timeout")
          ? `เซิร์ฟเวอร์ตอบสนองช้าเกินไป กรุณาลองใหม่อีกครั้ง`
          : "ไม่สามารถเชื่อมต่อเซิฟเวอร์ได้ในขณะนี้",
      );
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isError: err.message,
      }));
    }
  }, [service, setNormalizedData]);
  useEffect(() => {
    refresh();
    const unsubscribe = service.subscribe((payload) =>
      setNormalizedData(payload),
    );
    return () => unsubscribe();
  }, [refresh, service, setNormalizedData]);

  return { state, refresh, PageToast: contextHolder };
}
