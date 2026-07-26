import { CommonDropdown, getAirQualityColor } from "@components/utils";
import { RankBadgeIcon } from "@assets/icons";

// อันดับ 1-3 แสดงเป็น badge มีพื้นหลัง ส่วนอันดับอื่นแสดงเป็นจุดสีธรรมดา
const RANK_BADGE_COLORS = {
  1: "#FFEC3D",
  2: "#F0F0F0",
  3: "#FFD591",
};

const RANK_ICON_COLORS = {
  1: "#AD6800",
  2: "#000000A6",
  3: "#AD6800",
};

const PLAIN_DOT_COLOR = "#5CDBD3";

function AirQualityItem({ rank, item }) {
  const valueColor = getAirQualityColor(item.type, item.value);
  const badgeColor = RANK_BADGE_COLORS[rank];
  const iconColor = RANK_ICON_COLORS[rank];

  const unitMap = {
    pm25: "ug/m³",
    pm10: "ug/m³",
    temp: "°C",
    co2: "ppm",
    co: "ppm",
  };

  return (
    <div className="bg-white shadow-grid-items w-full rounded-2xl py-6 px-6 flex justify-between items-center transition-transform hover:scale-[1.01]">
      <div className="w-max h-full flex flex-col gap-2">
        {badgeColor ? (
          <div
            className="w-max flex items-center gap-2 rounded-lg px-3 py-1"
            style={{ backgroundColor: badgeColor }}
          >
            <RankBadgeIcon color={iconColor} />
            <h3 className="font-medium text-xl text-black leading-8">
              อันดับ {rank}
            </h3>
          </div>
        ) : (
          <div className="w-max flex items-center gap-3 py-1">
            <span
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: PLAIN_DOT_COLOR }}
            />
            <h3 className="font-medium text-xl text-black leading-8">
              อันดับ {rank}
            </h3>
          </div>
        )}

        <div className="flex flex-col">
          <h2 className="text-xl font-medium text-black leading-8">
            {item.room_title}
          </h2>
          <h2 className="text-sm font-normal text-black leading-5">
            ชั้น {item.floor}
          </h2>
        </div>
      </div>

      <div className="w-max h-max flex gap-4 items-baseline">
        <h3 className="text-xl font-medium leading-8">{item.type_title}</h3>
        <h3
          className="text-[32px] font-semibold leading-10"
          style={{ color: valueColor }}
        >
          {item.value ?? "--"}
        </h3>
        <h3 className="text-lg font-light leading-6">
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
  ];

  const orderOptions = [
    { key: "best", label: "อากาศดีที่สุด" },
    { key: "worst", label: "อากาศแย่ที่สุด" },
  ];

  return (
    <div className="h-full w-full flex flex-col">
      <div
        className="w-full max-w-[1118px] mx-auto h-22 px-7 py-6 flex justify-between items-center rounded-2xl"
        style={{ backgroundColor: "#B5F5EC" }}
      >
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
      <div className="px-7 py-6 flex flex-col gap-6">
        {rankings.data.length > 0 ? (
          rankings.data.map((item, index) => (
            <AirQualityItem key={item.id} rank={index + 1} item={item} />
          ))
        ) : (
          <p className="text-center py-10">ไม่พบข้อมูลอันดับ</p>
        )}
      </div>
    </div>
  );
}

export default BottomDashboard;
