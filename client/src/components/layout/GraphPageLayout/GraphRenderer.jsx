import { useMemo } from "react";
import { Line, Area } from "@ant-design/plots";
import { full30MinDomain, visibleTicks, getColor } from "@components/utils";

const transformChartData = (usageData) => {
  console.log("yi", usageData);

  const roomsDictionary = usageData;
  if (!roomsDictionary) return [];
  const chartData = [];

  for (const roomId in roomsDictionary) {
    const room = roomsDictionary[roomId];
    const label = room.label;

    for (let i = 0; i < room.data.length; i++) {
      const point = room.data[i];

      chartData.push({
        date: point.date.replaceAll("-", "/"),
        value: point.value,
        label: label,
      });
    }
  }

  return chartData;
};

const transformHourlyData = (usageData) => {
  const chartData = [];
  for (const roomId in usageData) {
    const room = usageData[roomId];
    if (!room?.data) continue;
    for (let i = 0; i < room.data.length; i++) {
      const p = room.data[i];
      chartData.push({
        hour: p.time,
        value: p.value,
        label: room.label,
      });
    }
  }
  return chartData;
};

export function DaysGraphRenderer({ data, measurementUnit, colorList }) {
  const chartData = useMemo(() => transformChartData(data), [data]);
  const roomCount = Object.keys(data || {}).length;

  const config = {
    data: chartData,
    autoFit: true,
    xField: "date",
    yField: "value",
    seriesField: "label",
    colorField: "label",
    shapeField: "smooth",
    padding: "auto",
    legend: false,
    scale: {
      x: { range: [0, 1] },
    },
    color: colorList,
    smooth: true,
    axis: {
      x: { tick: false, line: false },
      y: { tick: false, line: false, grid: false },
    },
    tooltip: {
      showMarkers: true,
      title: "date",
      items: [
        {
          channel: "y",
          name: "usage",
          valueFormatter: (v) => `${v.toFixed(3)} ${measurementUnit}`,
        },
      ],
    },
  };

  return (
    <div className="w-full h-full min-w-0">
      <div className="text-sm font-medium text-black pl-3 h-7">
        {measurementUnit}
      </div>
      <Line {...config} key={`daily-graph-${roomCount}`} />
    </div>
  );
}

export function HoursGraphRenderer({ data, measurementUnit, colorList }) {
  const chartData = useMemo(() => transformHourlyData(data), [data]);
  const roomCount = Object.keys(data || {}).length;

  const config = {
    data: chartData,
    xField: "hour",
    yField: "value",
    colorField: "label",
    seriesField: "label",
    color: colorList,
    padding: "auto",
    autoFit: true,
    legend: false,
    scale: {
      x: { domain: full30MinDomain },
    },
    tooltip: {
      showMarkers: true,
      title: "hour",
      items: [
        {
          channel: "y",
          name: "Usage",
          valueFormatter: (v) => `${v.toFixed(3)} ${measurementUnit}`,
        },
      ],
    },
    style: {
      fillOpacity: roomCount > 1 ? 0.15 : 0.4,
    },
    line: { style: { lineWidth: 1.5 } },
    point: { sizeField: 2, shape: "circle" },
    axis: {
      x: {
        line: false,
        tick: false,
        labelFontSize: 12,
        labelFormatter: (val) => (visibleTicks.includes(val) ? val : ""),
      },
      y: { line: false, tick: false, grid: false, labelFontSize: 12 },
    },
  };

  return (
    <div className="w-full h-full min-w-0">
      <div className="text-sm font-medium text-black pl-3 h-7">
        {measurementUnit}
      </div>
      <Area {...config} key={`hours-graph-${roomCount}`} />
    </div>
  );
}
