import { Calendar, Grid } from "antd";
import { useState } from "react";
import BookingListModal from "./BookingModal/BookingListModal";
import { getAvailabilityColor } from "../utils/bookingAvailability";
import dayjs from "dayjs";

function BookingCalendar({ date, setDate, bookings, availabilityMap, loading }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isFullscreen = screens.xl;

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

  const fullCellRender = (current, info) => {
    const isDate = info.type === "date";
    const isToday = current.isSame(dayjs(), isDate ? "day" : "month");
    const color =
      isDate && !disabledDate(current)
        ? getAvailabilityColor(availabilityMap?.[current.format("YYYY-MM-DD")])
        : "";

    return (
      <div
        className={`ant-picker-cell-inner ant-picker-calendar-date${isToday ? " ant-picker-calendar-date-today" : ""}`}
      >
        <div
          className={`ant-picker-calendar-date-value${color ? ` ${color} !text-white` : ""}`}
        >
          {isDate ? current.format("DD") : current.format("MMM")}
        </div>
        <div className="ant-picker-calendar-date-content" />
      </div>
    );
  };

  return (<>
    <div className="create-booking-calendar w-full p-5 h-full">

      <Calendar
        value={date}
        onSelect={onSelect}
        onPanelChange={onPanelChange}
        fullscreen={isFullscreen}
        disabledDate={disabledDate}
        fullCellRender={fullCellRender}
      />

    </div >
    <BookingListModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} bookings={bookings} availabilityMap={availabilityMap} loading={loading} /></>
  );
}

export default BookingCalendar
