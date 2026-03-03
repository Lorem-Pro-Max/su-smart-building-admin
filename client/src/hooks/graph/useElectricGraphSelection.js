export function useElectricGraphSelection(graphState, actions) {
  const selection = {
    dailyFloor: graphState.daily.floor,
    dailyDevice: graphState.daily.device,
    hourlyFloor: graphState.hourly.floor,
    hourlyRoom: graphState.hourly.room,
    hourlyDate: graphState.hourly.date,
  };

  const setDailyFloor = (floor) => {
    actions.fetchDailyByFloor(floor, graphState.daily.deviceId || "all");
  };

  const setDailyDevice = (deviceId) => {
    actions.fetchDailyByFloor(graphState.daily.floor || "all", deviceId);
  };

  const setHourlyFloor = (floor) => {
    actions.fetchHourlyByFloor(graphState.hourly.date, floor);
  };

  const setHourlyDevice = (device) => {
    actions.fetchHourlyByDevice(
      graphState.hourly.date,
      graphState.hourly.floor,
      device,
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
