const generatePastDates = (daysCount = 7) => {
  const dates = [];
  const today = new Date(); 

  for (let i = 0; i < daysCount; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    const dateString = `${day}/${month}/${year}`;
    dates.push({ key: dateString, label: dateString });
  }

  return dates;
};

export const AVAILABLE_FLOORS = [
  { key: "floor_1", label: "ชั้น 1" },
  { key: "floor_2", label: "ชั้น 2" },
  { key: "floor_3", label: "ชั้น 3" },
  { key: "floor_4", label: "ชั้น 4" },
  { key: "floor_5", label: "ชั้น 5" },
];

export const AVAILABLE_DATES = generatePastDates(7);

export const getFloorItems = (hasRooms) => {
  if (hasRooms) return AVAILABLE_FLOORS;
  return [{ key: "all", label: "แสดงทุกชั้น" }, ...AVAILABLE_FLOORS];
};