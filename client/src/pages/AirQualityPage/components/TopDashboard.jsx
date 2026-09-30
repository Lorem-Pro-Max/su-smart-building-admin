import { CommonDropdown, getAirQualityColor } from "@components/utils";

function GridItem({
  gridSetting,
  label,
  value,
  valueColor,
  measurement,
  ValueSize = 56,
  measurementSize = 40,
  valueWeight = 600,
}) {
  return (
    <div
      className={`flex flex-col bg-white rounded-2xl gap-6 justify-center items-center shadow-grid-items ${gridSetting}`}
    >
      <h2 className="text-[#000000A6] text-2xl font-normal">{label}</h2>
      <div className="flex gap-4 leading-10">
        <h2
          style={{
            color: valueColor,
            fontSize: ValueSize,
            fontWeight: valueWeight,
          }}
        >
          {value}
        </h2>
        <h2 className={"font-light"} style={{ fontSize: measurementSize }}>
          {measurement}
        </h2>
      </div>
    </div>
  );
}

function GridDashboard({ data }) {
  return (
    <div className="grid grid-cols-12 grid-rows-12 gap-6 h-142 ">
      <GridItem
        gridSetting="col-span-6 row-span-6"
        label="PM 2.5"
        valueColor={getAirQualityColor("pm25", data.pm25)}
        value={data.pm25 ?? "--"}
        measurement="ug/m³"
      />
      <GridItem
        gridSetting="col-span-3 row-span-8"
        label="Temp"
        measurement="°C"
        valueColor={getAirQualityColor("temp", data.temp)}
        value={data.temp ?? "--"}
      />
      <GridItem
        gridSetting="col-span-3 row-span-4"
        label="CO"
        valueColor={getAirQualityColor("co", data.co)}
        ValueSize="48px"
        value={data.co ?? "--"}
        measurement="ppm"
        measurementSize="38px"
      />
      <GridItem
        gridSetting="col-span-3 row-span-4"
        label="CO2"
        measurement="ppm"
        ValueSize="48px"
        valueColor={getAirQualityColor("co2", data.co2)}
        value={data.co2 ?? "--"}
        measurementSize="38px"
      />
      <GridItem
        gridSetting="col-span-6 row-span-6"
        label="PM 10"
        valueColor={getAirQualityColor("pm10", data.pm10)}
        value={data.pm10 ?? "--"}
        measurement="ug/m³"
      />
      <GridItem
        gridSetting="col-span-6 row-span-4"
        label="Smoke"
        valueColor="#000000A6"
        value={data.smoke ?? "--"}
        ValueSize="48px"
        measurement=""
        measurementSize="38px"
      />
    </div>
  );
}

function TopDashboard({ data, metadata, onFetchRoom }) {
  const currentFloor = data?.floor || "";
  const currentRoom = data?.roomId || "";

  const roomsOnFloor = metadata?.available_rooms?.[currentFloor] || [];

  const handleFloorChange = (floorKey) => {
    const floorRooms = metadata?.available_rooms?.[floorKey] || [];
    const firstRoomOnFloor = floorRooms[0]?.key;
    onFetchRoom(floorKey, firstRoomOnFloor);
  };

  return (
    <>
      <div className="w-full h-max">
        <div className="w-full h-16 flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h3 className="font-medium text-2xl">Air Quality Detector</h3>
            <p className="font-normal text-base">
              เลือกชั้นและห้องที่ต้องการดูข้อมูล
            </p>
          </div>
          <div className="flex w-max h-10 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-black">ชั้น</span>
              <CommonDropdown
                items={metadata?.available_floors || []}
                currentItem={currentFloor}
                onSelect={handleFloorChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-black">ห้อง</span>
              <CommonDropdown
                items={roomsOnFloor}
                currentItem={currentRoom}
                onSelect={(roomKey) => onFetchRoom(currentFloor, roomKey)}
              />
            </div>
          </div>
        </div>
      </div>
      <GridDashboard data={data?.data || {}} />
    </>
  );
}

export default TopDashboard;
