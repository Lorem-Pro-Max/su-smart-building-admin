const DATES = [
  "2026-01-21",
  "2026-01-22",
  "2026-01-23",
  "2026-01-24",
  "2026-01-25",
  "2026-01-26",
  "2026-01-27",
];

const floors = [
  { id: "floor_1", label: "ชั้น 1" },
  { id: "floor_2", label: "ชั้น 2" },
  { id: "floor_3", label: "ชั้น 3" },
  { id: "floor_4", label: "ชั้น 4" },
  { id: "floor_5", label: "ชั้น 5" },
];
const generateElectricityData = () => {
  const masterData = {
    all: {},
  };

  floors.forEach((f) => {
    const floorKey = f.id;
    
    const dailyPoints = DATES.map((date) => ({
      date,
      value: Math.floor(Math.random() * 200) + 100,
    }));

    const floorData = {
      label: f.label,
      total_usage: dailyPoints.reduce((sum, p) => sum + p.value, 0),
      data: dailyPoints,
    };

    masterData[floorKey] = floorData;
    masterData.all[floorKey] = floorData;
  });

  return masterData;
};

export const electricDailyUsageData = generateElectricityData();

const generateElectricityHourlyData = () => {
  const hours = Array.from(
    { length: 24 },
    (_, i) => `${String(i).padStart(2, "0")}:00`,
  );

  const masterData = {};

  DATES.forEach((date) => {
    masterData[date] = { all: {} };

    floors.forEach((f) => {
      const floorHourlyPoints = hours.map((hour) => ({
        time: hour,

        label: f.label, 
        value: Math.floor(Math.random() * 40) + 20,
      }));

      const floorResult = {
        label: f.label,
        total_usage: floorHourlyPoints.reduce((sum, p) => sum + p.value, 0),
        data: floorHourlyPoints,
      };

      masterData[date][f.id] = floorResult;
      masterData[date].all[f.id] = floorResult;
    });
  });

  return masterData;
};

export const electricHourlyUsageData = generateElectricityHourlyData();
