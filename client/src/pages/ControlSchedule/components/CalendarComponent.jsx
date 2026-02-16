import { useState, useMemo } from "react";
import { Calendar } from "antd";

const statusColor = {
  warning: "#faad14",
  error: "#ff4d4f",
  long: "#52c41a",
};

function CalendarComponent(selectedDate, setSelectedDate) {
  const events = useMemo(
    () => ({
      "2026-02-10": [
        { color: "#faad14", text: "This is warning event" },
        { color: "#52c41a", text: "This is very long event" },
        { color: "#52c41a", text: "This is very long event" },
        { color: "#52c41a", text: "This is very long event" },
        { color: "#52c41a", text: "This is very long event" },
      ],
      "2026-02-15": [{ color: "#ff4d4f", text: "This is error event" }],
      "2026-02-30": [
        { color: "#faad14", text: "ห้องว่างและสะอาด" },
        { color: "#52c41a", text: "คีย์บันทึกการจอง" },
      ],
    }),
    [],
  );

  const cellRender = (current) => {
    const date = current.format("YYYY-MM-DD");

    const dayEvents = events[date] || [];
    const isSelected = selectedDate === date;

    return (
      <div
        onClick={() => setSelectedDate(date)}
        style={{
          height: "100%",
          padding: 6,
          cursor: "pointer",
          background: isSelected ? "#E6FFFB" : undefined,
          borderRadius: 8,
        }}
      >
        {dayEvents.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: item.color,
              }}
            />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    );
  };
  return (
    <div style={{ flex: 1 }}>
      <Calendar
        fullscreen
        onSelect={(value) => setSelectedDate(value.format("YYYY-MM-DD"))}
        cellRender={cellRender}
        className="!m-4"
      />
    </div>
  );
}

export default CalendarComponent;
