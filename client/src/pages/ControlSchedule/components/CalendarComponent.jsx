import { useMemo } from "react";
import { Calendar } from "antd";
import dayjs from "dayjs";

function CalendarComponent({ selectedDate, setSelectedDate, data }) {
  const events = useMemo(() => {
    const map = {};

    (data || []).forEach((item) => {
      const firstSchedule = item.schedules?.[0];
      if (!firstSchedule) return;

      const date = dayjs(firstSchedule.action_time).format("YYYY-MM-DD");

      if (!map[date]) map[date] = [];

      const action = firstSchedule.action?.toLowerCase();

      let color = "bg-gray-400";

      if (action === "close" || action === "off") {
        color = "bg-red-500";
      } else if (action === "open" || action === "on") {
        color = "bg-green-500";
      }

      map[date].push({
        color,
        text: item.meeting_name || item.room?.title,
      });
    });

    return map;
  }, [data]);
  const cellRender = (current) => {
    const date = current.format("YYYY-MM-DD");

    const dayEvents = events[date] || [];
    const isSelected = selectedDate === date;

    return (
      <div
        onClick={() => setSelectedDate(date)}
        className={`h-full p-1 rounded-lg cursor-pointer transition
        ${isSelected ? "bg-teal-50" : ""}
      `}
      >
        <div className="flex flex-col gap-[2px] overflow-hidden">
          {dayEvents.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-1 text-[11px] leading-none"
            >
              <span
                className={`inline-block flex-none w-[8px] h-[8px] aspect-square rounded-full ${item.color}`}
              />
              <span className="truncate">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1">
      <Calendar
        fullscreen
        value={selectedDate ? dayjs(selectedDate) : undefined}
        onSelect={(value) => setSelectedDate(value.format("YYYY-MM-DD"))}
        cellRender={cellRender}
        className="!m-4"
      />
    </div>
  );
}

export default CalendarComponent;
