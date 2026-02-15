import { useState, useCallback, useEffect, useRef } from "react";
import { AirQualityService } from "../../services/deviceService";

const service = AirQualityService

function useAirQualityServices() {
  const [aqState, setAqState] = useState({
    metadata: {},
    roomStatus: { data: {}, floor: "", room: "" },
    rankings: { data: [], type: "pm25", orderBy: "best" },
    isLoading: true,
    isError: null,
  });

  const hasInitialized = useRef(false);

  const fetchRoomStatus = useCallback(
    async (floor, room) => {
      try {
        const data = await service.fetchRoomStatus(floor, room);
        setAqState((s) => ({ ...s, roomStatus: { data, floor, room } }));
      } catch (err) {
        setAqState((s) => ({ ...s, isError: err.message }));
      }
    },
    [service]
  );

  const fetchRankings = useCallback(
    async (type) => {
      try {
        const data = await service.fetchRankings(type);
        setAqState((s) => ({ ...s, rankings: { data, type } }));
      } catch (err) {
        setAqState((s) => ({ ...s, isError: err.message }));
      }
    },
    [service]
  );

  useEffect(() => {
    const bootstrap = async () => {
      setAqState((s) => ({ ...s, isLoading: true }));
      try {
        const meta = await service.getMetadata();

        if (meta.available_rooms) {
          for (const floor in meta.available_rooms) {
            meta.available_rooms[floor] = [
              { key: "all", label: "ทุกห้อง" },
              ...meta.available_rooms[floor],
            ];
          }
        }

        const defaultFloor = meta.available_floors?.[0]?.key || "floor_1";
        const defaultRoom = meta.available_room?.[0]?.key;
        const defaultType = "pm25";

        const [statusData, rankingData] = await Promise.all([
          service.fetchRoomStatus(defaultFloor, defaultRoom),
          service.fetchRankings(defaultType),
        ]);

        setAqState({
          metadata: meta,
          roomStatus: { data: statusData, floor: defaultFloor, room: defaultRoom },
          rankings: { data: rankingData, type: defaultType },
          isLoading: false,
          isError: null,
        });
        hasInitialized.current = true;
      } catch (err) {
        setAqState((s) => ({ ...s, isLoading: false, isError: err.message }));
      }
    };

    if (!hasInitialized.current) bootstrap();
  }, [service]);

  return { aqState, fetchRoomStatus, fetchRankings };
}