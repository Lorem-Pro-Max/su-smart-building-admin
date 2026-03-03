import { useMemo } from "react";
import { Line, Area } from "@ant-design/plots";
import { full30MinDomain, visibleTicks } from "@components/utils";

const transformChartData = (usageData) => {
  if (!usageData) return [];

  const chartData = [];

  for (const deviceId in usageData) {
    const device = usageData[deviceId];
    const label = device.label;

    for (const point of device.data) {
      const date = point.date?.replaceAll("-", "/");

      const phases = ["a", "b", "c"];

      phases.forEach((phase) => {
        chartData.push({
          date,
          value: Number(point[phase] || 0),
          label: `${label} - ${phase.toUpperCase()}`,
        });
      });
    }
  }

  return chartData;
};

const transformHourlyData = (usageData, selectedDevice) => {
  const deviceMap = {};

  for (const deviceId in usageData) {
    const device = usageData[deviceId];
    if (!device?.data) continue;

    if (selectedDevice !== "all" && deviceId !== selectedDevice) continue;

    deviceMap[deviceId] = {
      label: device.label,
      points: {},
    };

    for (const point of device.data) {
      const hour = new Date(point.time).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok",
      });

      if (!deviceMap[deviceId].points[hour]) {
        deviceMap[deviceId].points[hour] = {};
      }

      ["a", "b", "c"].forEach((phase) => {
        if (point[phase] !== undefined) {
          deviceMap[deviceId].points[hour][phase] = point[phase];
        }
      });
    }
  }

  const chartData = [];

  for (const deviceId in deviceMap) {
    const { label, points } = deviceMap[deviceId];

    full30MinDomain.forEach((hour) => {
      ["a", "b", "c"].forEach((phase) => {
        chartData.push({
          hour,
          value: points[hour]?.[phase] ?? 0,
          label: `${label}-${phase.toUpperCase()}`,
        });
      });
    });
  }

  return chartData;
};

export function ElectricDaysGraphRenderer({ data, measurementUnit, colorList }) {
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
      x: { range: [0, 1], padding: 0.25 },
      color: { range: colorList },
    },
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

export function ElectricHoursGraphRenderer({
  data,
  measurementUnit,
  colorList,
  selectedDevice,
}) {
  const chartData = useMemo(
    () => transformHourlyData(data, selectedDevice),
    [data, selectedDevice]
  );

  const config = {
    data: chartData,
    xField: "hour",
    yField: "value",
    colorField: "label",
    seriesField: "label",
    padding: "auto",
    autoFit: true,
    legend: false,
    stack: false,
    scale: {
      x: { domain: full30MinDomain, padding: 0.4 },
      color: {
        range: colorList,
      },
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
      fillOpacity: 0.15,
    },

    line: { style: { lineWidth: 1 } },
    point: { sizeField: 1.3, shape: "circle" },
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
      <Area {...config} key={`hours-graph-${chartData.length}`} />
    </div>
  );
}
