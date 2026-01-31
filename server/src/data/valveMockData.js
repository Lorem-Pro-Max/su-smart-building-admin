const DATES = [
  "2026-01-21",
  "2026-01-22",
  "2026-01-23",
  "2026-01-24",
  "2026-01-25",
  "2026-01-26",
  "2026-01-27",
];

const FLOORS = [
  { id: "floor_1", prefix: "sci", label: "ห้องวิทย์" },
  { id: "floor_2", prefix: "com", label: "ห้องคอม" },
  { id: "floor_3", prefix: "lib", label: "ห้องสมุด" },
  { id: "floor_4", prefix: "off", label: "ธุรการ" },
  { id: "floor_5", prefix: "meet", label: "ประชุม" },
];

const HOURS = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`,
);

const generateDailyData = () => {
  const masterData = {};

  FLOORS.forEach((f, floorIndex) => {
    const floorKey = f.id;
    masterData[floorKey] = { all: {} };

    for (let i = 1; i <= 5; i++) {
      const roomId = `${f.prefix}-${(floorIndex + 1) * 100 + i}`;
      const roomLabel = `${f.label}-${String.fromCharCode(64 + i)}`;

      const dataPoints = DATES.map((date) => ({
        date,
        value: Math.floor(Math.random() * 50) + 10,
      }));

      const currentRoom = {
        label: roomLabel,
        total_usage: dataPoints.reduce((sum, p) => sum + p.value, 0),
        data: dataPoints,
      };

      masterData[floorKey][roomId] = currentRoom;
      masterData[floorKey].all[roomId] = currentRoom;
    }

  });

  return masterData;
};

const generateHourlyData = () => {
  const masterData = {};

  DATES.forEach((date) => {
    masterData[date] = {};

    FLOORS.forEach((f, floorIndex) => {
      const floorKey = f.id;
      masterData[date][floorKey] = { all: {} };

      for (let i = 1; i <= 5; i++) {
        const roomId = `${f.prefix}-${(floorIndex + 1) * 100 + i}`;
        const roomLabel = `${f.label}-${String.fromCharCode(64 + i)}`;

        const dataPoints = HOURS.map((hour) => ({
          time: hour,
          value: Math.floor(Math.random() * 10) + 2,
        }));

        const currentRoom = {
          label: roomLabel,
          total_usage: dataPoints.reduce((sum, p) => sum + p.value, 0),
          data: dataPoints,
        };

        masterData[date][floorKey][roomId] = currentRoom;
        masterData[date][floorKey].all[roomId] = currentRoom;
      }
    });
  });
  return masterData;
};

export const valveDailyUsageData = generateDailyData();
export const valveHourlyUsageData = generateHourlyData();
