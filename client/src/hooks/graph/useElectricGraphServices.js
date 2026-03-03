import { useState, useEffect, useCallback, useRef } from "react";
import { electricityService } from "@/services/deviceService";

export function useElectricityGraphServices() {
  const [graphState, setGraphState] = useState({
    metadata: {
      floors: [],
      devices: {},
      phases: [],
      dates: [],
    },
    daily: { data: {}, floor: "", deviceId: "", phase: "" },
    hourly: { data: {}, floor: "", deviceId: "", phase: "", date: "" },
    isLoading: true,
    isError: null,
  });

  const hasInitialized = useRef(false);

  const fetchDaily = useCallback(
    async (floor, deviceId = "all", phase = "all") => {
      try {
        let data;
        if (deviceId === "all") {
          data = await electricityService.fetchDailyByFloor(floor);
        } else {
          data = await electricityService.fetchDailyByDevice(floor, deviceId);
        }
        setGraphState((s) => ({
          ...s,
          daily: { data, floor, deviceId, phase },
        }));
      } catch (err) {
        setGraphState((s) => ({ ...s, isError: err.message }));
      }
    },
    [],
  );

  const fetchHourly = useCallback(
    async (date, floor, deviceId = "all", phase = "all") => {
      try {
        let data;
        if (deviceId === "all") {
          data = await electricityService.fetchHourlyByFloor(date, floor);
        } else {
          data = await electricityService.fetchHourlyByDevice(
            date,
            floor,
            deviceId,
          );
        }
        setGraphState((s) => ({
          ...s,
          hourly: { data, floor, deviceId, phase, date },
        }));
      } catch (err) {
        setGraphState((s) => ({ ...s, isError: err.message }));
      }
    },
    [],
  );

  useEffect(() => {
    const bootstrap = async () => {
      setGraphState((s) => ({ ...s, isLoading: true }));
      try {
        const meta = await electricityService.getMetadata();
        const floors = [
          { key: "all", label: "แสดงทุกชั้น" },
          ...meta.available_floors.map((f) => ({
            key: String(f.key),
            label: f.label,
          })),
        ];

        const devices = {};

        for (const floor in meta.available_devices) {
          devices[String(floor)] = [
            ...meta.available_devices[floor].map((d) => ({
              ...d,
              key: String(d.key),
            })),
          ];
        }
        const phases = ["all", "a", "b", "c"];
        const dates = meta.available_dates;
        const measurementUnit = meta.measurement_unit;

        const defaultFloor = floors[0]?.key;
        const defaultDevice = "all";
        const defaultPhase = "all";
        const defaultDate = dates[0]?.key || "";

        const [dailyData, hourlyData] = await Promise.all([
          electricityService.fetchDailyByFloor(defaultFloor),
          electricityService.fetchHourlyByFloor(defaultDate, defaultFloor),
        ]);

        setGraphState({
          metadata: { floors, devices, phases, dates, measurementUnit },
          daily: {
            data: dailyData,
            floor: defaultFloor,
            deviceId: defaultDevice,
            phase: defaultPhase,
          },
          hourly: {
            data: hourlyData,
            floor: defaultFloor,
            deviceId: defaultDevice,
            phase: defaultPhase,
            date: defaultDate,
          },
          isLoading: false,
          isError: null,
        });
        hasInitialized.current = true;
      } catch (err) {
        console.error("bootstrap error:", err);
        setGraphState((s) => ({
          ...s,
          isLoading: false,
          isError: err.message,
        }));
      }
    };

    if (!hasInitialized.current) bootstrap();
  }, []);

  return {
    graphState,
    fetchDailyByFloor: fetchDaily,
    fetchHourlyByFloor: fetchHourly,
  };
}
