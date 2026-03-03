export function useElectricGraphSelection(graphState, actions) {
  const selection = {
    dailyFloor: graphState.daily.floor,
    dailyDevice: graphState.daily.device,
    hourlyFloor: graphState.hourly.floor,
    hourlyRoom: graphState.hourly.room,
    hourlyDate: graphState.hourly.date,
  };

  const setDailyFloor = (floor) => {
    console.log("setDailyFloor", floor);
    actions.fetchDailyByFloor(floor);
  };

  const setDailyDevice = (device) => {
    console.log("graphState.daily", graphState.daily);
    actions.fetchDailyByDevice(graphState.daily.floor, device);
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
