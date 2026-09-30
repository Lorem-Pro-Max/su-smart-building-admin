export const getAirQualityColor = (type, value) => {
  if (value === undefined || value === null || value === "--")
    return "#000000A6";
  const val = parseFloat(value);
  if (isNaN(val)) return "#000000A6";

  const BLUE = "#1890FF";
  const GREEN = "#52C41A";
  const YELLOW = "#FADB14";
  const ORANGE = "#FA8C16";
  const RED = "#F5222D";

  switch (type) {
    case "pm25":
      if (val <= 15.0) return BLUE;
      if (val <= 25.0) return GREEN;
      if (val <= 37.5) return YELLOW;
      if (val <= 75.0) return ORANGE;
      return RED;
    case "pm10":
      if (val <= 50) return BLUE;
      if (val <= 80) return GREEN;
      if (val <= 120) return YELLOW;
      if (val <= 180) return ORANGE;
      return RED;
    case "co":
      if (val <= 9) return GREEN;
      if (val <= 35) return YELLOW;
      return RED;
    case "co2":
      if (val <= 800) return GREEN;
      if (val <= 1000) return YELLOW;
      if (val <= 2000) return ORANGE;
      return RED;
    case "temp":
      if (val < 22) return BLUE;
      if (val <= 27) return GREEN;
      if (val <= 32) return YELLOW;
      return RED;
    default:
      return "#000000";
  }
};
