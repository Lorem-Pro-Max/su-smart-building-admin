import { useMemo } from "react";
import { Calendar } from "antd";
import dayjs from "dayjs";

function CalendarComponent({ selectedDate, setSelectedDate, data }) {
  const events = useMemo(() => {
    const map = {};

    (data || []).forEach((item) => {
      if (!item.start_dateTime) return;

      const date = dayjs(item.schedules[0].action_time).format("YYYY-MM-DD");

      if (!map[date]) map[date] = [];

      const hasClose = item.schedules?.some(
        (s) => s.action?.toLowerCase() === "close",
      );

      const hasOpen = item.schedules?.some(
        (s) => s.action?.toLowerCase() === "open",
      );

      let color = "bg-gray-400";

      if (hasClose) {
        color = "bg-red-500";
      } else if (hasOpen) {
        color = "bg-green-500";
      }

      map[date].push({
        color,
        text: item.meeting_name,
      });
    });

    return map;
  }, [data]);

  const cellRender = (current) => {
    const date = current.format("YYYY-MM-DD");

    const dayEvents = events[date] || [];
    const isSelected = selectedDate === date;

    const visibleEvents = dayEvents.slice(0, 2);
    const remainingCount = dayEvents.length - 2;

    return (
      <div
        onClick={() => setSelectedDate(date)}
        className={`h-full p-1 rounded-lg cursor-pointer transition
        ${isSelected ? "bg-teal-50" : ""}
      `}
      >
        <div className="flex flex-col gap-[2px] overflow-hidden">
          {visibleEvents.map((item, index) => (
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

          {remainingCount > 0 && (
            <div className="text-[10px] text-gray-500 pl-[10px] leading-none">
              +{remainingCount} more
            </div>
          )}
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
