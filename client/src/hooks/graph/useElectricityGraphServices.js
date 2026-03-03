// src/hooks/pageHooks/useElectricityGraphServices.js
import { useState, useEffect, useCallback, useRef } from "react";
import { electricityService } from "@/services/deviceService";

export function useElectricityGraphServices() {
  const [graphState, setGraphState] = useState({
    metadata: {
      floors: [],
      devices: {}, // { floor: [{ key: deviceId, label: deviceId }] }
      phases: [], // ["L1", "L2", "L3"] หรือ phase ที่มี
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

  // --- fetch hourly ---
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

  // --- bootstrap metadata + default fetch ---
  useEffect(() => {
    const bootstrap = async () => {
      setGraphState((s) => ({ ...s, isLoading: true }));
      try {
        console.log("start bootstrap");
        const meta = await electricityService.getMetadata();
        console.log("meta", meta);
        // เพิ่มค่า default "all" สำหรับ floor, device, phase
        const floors = [
          { key: "all", label: "แสดงทุกชั้น" },
          ...meta.available_floors,
        ];
        const devices = {};
        for (const floor in meta.available_devices) {
          devices[floor] = [
            { key: "all", label: "ทุกอุปกรณ์" },
            ...meta.available_devices[floor],
          ];
        }
        const phases = ["all", "a", "b", "c"];
        const dates = meta.available_dates;

        const defaultFloor = floors[0]?.key || "all";
        const defaultDevice = "all";
        const defaultPhase = "all";
        const defaultDate = dates[0]?.key || "";

        // fetch default daily + hourly
        console.log("start fetch default daily + hourly");
        const [dailyData, hourlyData] = await Promise.all([
          electricityService.fetchDailyByFloor(defaultFloor),
          electricityService.fetchHourlyByFloor(defaultDate, defaultFloor),
        ]);

        setGraphState({
          metadata: { floors, devices, phases, dates },
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

  return { graphState, fetchDaily, fetchHourly };
}
