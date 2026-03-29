import { useState, useCallback, useEffect, useRef } from "react";

function normalizeMetadata(meta) {
  if (!meta) return meta;

  if (meta.available_floors?.length) {
    meta.available_floors = meta.available_floors.map((f) => ({
      ...f,
      key: String(f.key),
    }));
  }

  if (meta.available_rooms) {
    const next = {};
    for (const floor of Object.keys(meta.available_rooms)) {
      const floorKey = String(floor);
      next[floorKey] = [
        { key: "all", label: "ทุกห้อง" },
        ...meta.available_rooms[floor].map((r) => ({
          ...r,
          key: String(r.key),
        })),
      ];
    }
    meta.available_rooms = next;
  } else if (meta.available_floors?.length) {
    meta.available_floors = [
      { key: "all", label: "แสดงทุกชั้น" },
      ...meta.available_floors,
    ];
  }

  if (meta.available_dates?.length) {
    meta.available_dates = meta.available_dates.map((d) => ({
      ...d,
      key: String(d.key),
    }));
  }

  return meta;
}

export function useGraphServices(service) {
  const [graphState, setGraphState] = useState({
    metadata: [],
    daily: { data: {}, floor: "", room: "all" },
    hourly: { data: {}, floor: "", room: "all", date: "" },
    isLoading: true,
    isError: null,
  });

  const hasInitialized = useRef(false);

  const fetchDaily = useCallback(
    async (floor, room) => {
      try {
        const data = await service.fetchDaily(floor, room);
        setGraphState((s) => ({
          ...s,
          daily: { data, floor: String(floor), room: String(room) },
        }));
      } catch (err) {
        setGraphState((prev) => ({ ...prev, isError: err.message }));
      }
    },
    [service],
  );

  const fetchHourly = useCallback(
    async (date, floor, room) => {
      try {
        const data = await service.fetchHourly(date, floor, room);
        setGraphState((s) => ({
          ...s,
          hourly: {
            data,
            floor: String(floor),
            room: String(room),
            date,
          },
        }));
      } catch (err) {
        setGraphState((s) => ({ ...s, isError: err.message }));
      }
    },
    [service],
  );

  useEffect(() => {
    const bootstrap = async () => {
      setGraphState((s) => ({ ...s, isLoading: true }));
      try {
        const meta = await service.getMetadata();
        normalizeMetadata(meta);

        const defaultFloor = meta.available_floors?.[0]?.key || "all";
        const defaultDate = meta.available_dates?.[0]?.key || "";
        const defaultRoom = "all";

        const [dData, hData] = await Promise.all([
          service.fetchDaily(defaultFloor, defaultRoom),
          service.fetchHourly(defaultDate, defaultFloor, defaultRoom),
        ]);

        setGraphState({
          metadata: meta,
          daily: { data: dData, floor: defaultFloor, room: defaultRoom },
          hourly: {
            data: hData,
            floor: defaultFloor,
            room: defaultRoom,
            date: defaultDate,
          },
          isLoading: false,
          isError: null,
        });
        hasInitialized.current = true;
      } catch (err) {
        setGraphState((s) => ({
          ...s,
          isLoading: false,
          isError: err.message,
        }));
      }
    };

    if (!hasInitialized.current) bootstrap();
  }, [service]);

  return {
    graphState: graphState,
    fetchDaily,
    fetchHourly,
  };
}
