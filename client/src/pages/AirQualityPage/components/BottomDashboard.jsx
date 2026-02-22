import { CommonDropdown } from "@components/utils/CommonDropdown";

function AirQualityItem({ rank, item, orderBy }) {
  const bestToWorstColors = ["#52C41A", "#FADB14", "#FA8C16", "#F5222D"];
  const worstToBestColors = ["#F5222D", "#FA8C16", "#FADB14", "#52C41A"];

  const activePalette =
    orderBy === "best" ? bestToWorstColors : worstToBestColors;

  const dotColor =
    activePalette[rank] || (orderBy === "best" ? "#F5222D" : "#52C41A");

  const unitMap = {
    pm25: "ug/m³",
    pm10: "ug/m³",
    temp: "°C",
    co2: "ppm",
    co: "ppm",
    smoke: "mg/m³",
  };

  return (
    <div className="bg-white shadow-grid-items w-full rounded-2xl py-8 px-6 flex justify-between items-center transition-transform hover:scale-[1.01]">
      <div className="w-max h-full flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div
            style={{ backgroundColor: dotColor }}
            className="w-5 h-5 rounded-full"
          />
          <h3 className="font-medium text-2xl text-black">อันดับ {rank + 1}</h3>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-[34px] font-medium text-black leading-10">
            {item.room_title}
          </h2>
          <h2 className="text-[18px] font-normal text-black leading-6">
            ชั้น {item.floor}
          </h2>
        </div>
      </div>

      <div className="w-max h-max flex gap-10 justify-between items-center">
        <h3 className="text-[40px] font-medium leading-10">
          {item.type_title}
        </h3>
        <h3
          className="text-[56px] font-semibold leading-10"
          style={{ color: dotColor }}
        >
          {item.value ?? "--"}
        </h3>
        <h3 className="text-[40px] font-light leading-10">
          {unitMap[item.type] || "ug/m³"}
        </h3>
      </div>
    </div>
  );
}

function BottomDashboard({ rankings, onFetchRankings }) {
  const typeOptions = [
    { key: "pm25", label: "PM 2.5" },
    { key: "pm10", label: "PM 10" },
    { key: "temp", label: "Temperature" },
    { key: "co2", label: "CO2" },
    { key: "co", label: "CO" },
    { key: "smoke", label: "Smoke" },
  ];

  const orderOptions = [
    { key: "best", label: "อากาศดีที่สุด" },
    { key: "worst", label: "อากาศแย่ที่สุด" },
  ];

  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full h-22 px-7 py-6 flex justify-between">
        <h3 className="font-medium text-2xl">จัดอันดับคุณภาพอากาศ</h3>
        <div className="flex w-max h-10 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-black">ประเภท</span>
            <CommonDropdown
              items={typeOptions}
              currentItem={rankings.type}
              onSelect={(val) => onFetchRankings(val, rankings.orderBy)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-black">เรียงลำดับข้อมูล</span>
            <CommonDropdown
              items={orderOptions}
              currentItem={rankings.orderBy}
              onSelect={(val) => onFetchRankings(rankings.type, val)}
            />
          </div>
        </div>
      </div>
      <div className="px-7 py-6 flex flex-col gap-7">
        {rankings.data.length > 0 ? (
          rankings.data.map((item, index) => (
            <AirQualityItem
              key={item.id}
              rank={index}
              item={item}
              orderBy={rankings.orderBy}
            />
          ))
        ) : (
          <p className="text-center py-10">ไม่พบข้อมูลอันดับ</p>
        )}
      </div>
    </div>
  );
}

export default BottomDashboard;
