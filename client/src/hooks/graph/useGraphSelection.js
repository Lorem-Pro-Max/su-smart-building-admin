export function useGraphSelection(graphState, actions) {
  const selection = {
    dailyFloor: graphState.daily.floor,
    dailyRoom: graphState.daily.room,
    hourlyFloor: graphState.hourly.floor,
    hourlyRoom: graphState.hourly.room,
    hourlyDate: graphState.hourly.date,
  };

  const setDailyFloor = (floor) => {
    actions.fetchDaily(floor, "all");
  };

  const setDailyRoom = (room) => {
    actions.fetchDaily(graphState.daily.floor, room);
  };

  const setHourlyFloor = (floor) => {
    actions.fetchHourly(graphState.hourly.date, floor, "all");
  };

  const setHourlyRoom = (room) => {
    actions.fetchHourly(graphState.hourly.date, graphState.hourly.floor, room);
  };

  const setHourlyDate = (date) => {
    actions.fetchHourly(date, graphState.hourly.floor, "all");
  };

  return {
    selection,
    setDailyFloor,
    setDailyRoom,
    setHourlyFloor,
    setHourlyRoom,
    setHourlyDate,
  };
}
