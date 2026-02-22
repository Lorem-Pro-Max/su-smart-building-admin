import { useState, useCallback, useEffect, useRef } from "react";
import { AirQualityService as service } from "../../services/deviceService";
import { useToast } from "../../components/utils";

export function useAirQualityServices() {
  const { errorToast, contextHolder } = useToast();
  const [aqState, setAqState] = useState({
    metadata: {
      available_floors: [],
      available_rooms: {},
    },
    roomStatus: { data: {}, floor: "", roomId: "" },
    rankings: { data: [], type: "pm25", orderBy: "best" },
    isLoading: true,
  });

  const hasInitialized = useRef(false);
  const extract = (res) => res?.data ?? res ?? {};

  const getErrorMessage = (err, defaultMsg) => {
    if (!err.response) {
      return "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
    }
    const status = err.response?.status;
    if (status === 404) return "ไม่พบสถานะจากอุปกรณ์ในห้อง (Sensor is Offline)";
    if (status >= 500) return "ระบบขัดข้อง ไม่สามารถเชื่อมต่อกับเซ็นเซอร์ได้";
    return defaultMsg || "เกิดข้อผิดพลาดในการโหลดข้อมูล";
  };

  const fetchRoomStatus = useCallback(
    async (floor, roomId) => {
      if (!roomId) return;
      try {
        const response = await service.getSensorRoomData(roomId);
        setAqState((s) => ({
          ...s,
          roomStatus: { data: extract(response), floor, roomId },
        }));
      } catch (err) {
        const message = getErrorMessage(
          err,
          `ไม่สามารถโหลดข้อมูลห้องที่เลือกได้`,
        );
        errorToast(message);

        setAqState((s) => ({ ...s, roomStatus: { data: {}, floor, roomId } }));
      }
    },
    [errorToast],
  );

  const fetchRankings = useCallback(
    async (type = "pm25", orderby = "best") => {
      try {
        const response = await service.getSensorRankedData(type, orderby);
        setAqState((s) => ({
          ...s,
          rankings: { data: extract(response) || [], type, orderBy: orderby },
        }));
      } catch (err) {
        const message = getErrorMessage(
          err,
          "ไม่สามารถโหลดข้อมูลการจัดอันดับได้",
        );
        errorToast(message);

        setAqState((s) => ({
          ...s,
          rankings: { data: [], type, orderBy: orderby },
        }));
      }
    },
    [errorToast],
  );

  useEffect(() => {
    if (hasInitialized.current) return;

    const bootstrap = async () => {
      try {
        const metaRes = await service.getSensorMetadata();
        const meta = extract(metaRes);

        if (!meta || !meta.available_floors) {
          throw { response: { status: 404 } };
        }

        const defaultFloor = meta.available_floors?.[0]?.key || "";
        const defaultRoomId =
          meta.available_rooms?.[defaultFloor]?.[0]?.key || "";

        setAqState((s) => ({ ...s, metadata: meta, isLoading: false }));
        hasInitialized.current = true;

        await Promise.allSettled([
          fetchRoomStatus(defaultFloor, defaultRoomId),
          fetchRankings("pm25", "best"),
        ]);
      } catch (err) {
        errorToast(
          getErrorMessage(err, "ไม่สามารถเชื่อมต่อระบบตรวจสอบอากาศได้"),
        );
        setAqState((s) => ({
          ...s,
          isLoading: false,
          metadata: { available_floors: [], available_rooms: {} },
        }));
        hasInitialized.current = true;
      }
    };

    bootstrap();
  }, [fetchRoomStatus, fetchRankings, errorToast]);

  return { aqState, fetchRoomStatus, fetchRankings, contextHolder };
}
