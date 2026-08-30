import { Calendar, ConfigProvider, Grid } from "antd";
import { useState, useEffect } from "react";
import BookingListModal from "./BookingModal/BookingListModal";
import { useBuildingAvailability } from "../hooks/useBuildingAvailability";
import dayjs from "dayjs";

function BookingCalendar({ date, setDate, bookings, loading }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isFullscreen = screens.xl;

  const {
    availabilityMap,
    fetchAvailability,
  } = useBuildingAvailability();


  const onSelect = (date, { source }) => {
    setDate(date);
    setIsModalOpen(true);
  };

  const onPanelChange = (newValue) => {
    setDate(newValue);
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  useEffect(() => {
    if (date) { fetchAvailability(date); }
  }, [date]);

  return (<>
    <div className="create-booking-calendar w-full p-5 h-full">

      <Calendar
        value={date}
        onSelect={onSelect}
        onPanelChange={onPanelChange}
        fullscreen={isFullscreen}
        disabledDate={disabledDate}
      />

    </div >
    <BookingListModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} bookings={bookings} availabilityMap={availabilityMap} loading={loading} /></>
  );
}

export default BookingCalendar