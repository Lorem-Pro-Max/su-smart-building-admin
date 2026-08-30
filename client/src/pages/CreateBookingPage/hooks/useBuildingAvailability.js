import { useState } from "react";
import dayjs from "dayjs";
import { getBuildingAvailability } from "@services/classroomRooms";

export const useBuildingAvailability = () => {
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailability = async (value) => {
    const startDate = value.startOf("month").format("YYYY-MM-DD");
    const endDate = value.endOf("month").format("YYYY-MM-DD");

    try {
      setLoading(true);
      setError(null);

      const result = await getBuildingAvailability(startDate, endDate);

      const lookup = {};
      result.forEach((item) => {
        const raw = item.booking_date ?? item.date;
        const key = dayjs(raw).format("YYYY-MM-DD");
        lookup[key] = Number(item.available_percent);
      });

      setAvailabilityMap(lookup);
    } catch (err) {
      console.error("Fetch availability failed", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    availabilityMap,
    fetchAvailability,
    loading,
    error,
  };
};
