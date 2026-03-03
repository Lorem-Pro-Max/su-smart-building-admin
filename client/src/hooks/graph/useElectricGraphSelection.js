export function useElectricGraphSelection(graphState, actions) {
  const selection = {
    dailyFloor: graphState.daily.floor,
    dailyDevice: graphState.daily.deviceId,
    hourlyFloor: graphState.hourly.floor,
    hourlyDevice: graphState.hourly.deviceId,
    hourlyDate: graphState.hourly.date,
  };

  const setDailyFloor = (floor) => {
    actions.fetchDailyByFloor(floor, "all");
  };

  const setDailyDevice = (deviceId) => {
    actions.fetchDailyByFloor(graphState.daily.floor || "all", deviceId);
  };

  const setHourlyFloor = (floor) => {
    actions.fetchHourlyByFloor(graphState.hourly.date, floor);
  };

  const setHourlyDevice = (deviceId) => {
    actions.fetchHourlyByFloor(
      graphState.hourly.date,
      graphState.hourly.floor,
      deviceId,
    );
  };

  const setHourlyDate = (date) => {
    actions.fetchHourlyByFloor(date, graphState.hourly.floor);
  };

  return {
    selection,
    setDailyFloor,
    setDailyDevice,
    setHourlyFloor,
    setHourlyDevice,
    setHourlyDate,
  };
}
