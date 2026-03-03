import { CommonDropdown } from "@components/utils";
import { DaysGraphRenderer, HoursGraphRenderer } from "@components/layout";
import { getColor } from "@components/utils";

export function DaysGraph({
  title,
  data,
  selectionService,
  metadata,
  alternateTitle,
}) {
  const { selection, setDailyFloor, setDailyRoom } = selectionService;
  const floorsItems = metadata.available_floors || [];
  const roomsItems = metadata?.available_rooms?.[selection.dailyFloor] || null;
  const mUnit = metadata.measurementUnit;
  const usageData = data || {};
  let colorList = [];

  Object.entries(usageData).forEach((_, index) => {
    colorList.push(getColor(index));
  });

  return (
    <div className="w-full rounded-2xl p-8 shadow-graph-container bg-white flex flex-col gap-6">
      <div className="w-full flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-medium">
            อัตราการใช้{alternateTitle || title} 7 วันย้อนหลัง
          </h3>
          <Legend data={usageData} colorList={colorList} />
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">ชั้น</span>
            <CommonDropdown
              items={floorsItems}
              currentItem={selection.dailyFloor}
              onSelect={setDailyFloor}
            />
          </div>
          {roomsItems && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">ห้อง</span>
              <CommonDropdown
                items={roomsItems}
                currentItem={selection.dailyRoom}
                onSelect={setDailyRoom}
              />
            </div>
          )}
        </div>
      </div>
      <div className="h-68.5 w-full flex items-center justify-center">
        <DaysGraphRenderer
          data={data}
          measurementUnit={mUnit}
          colorList={colorList}
        />
      </div>
    </div>
  );
}

export function HoursGraph({
  title,
  data,
  selectionService,
  totalUsageIcon,
  metadata,
  alternateTitle,
}) {
  const { selection, setHourlyFloor, setHourlyRoom, setHourlyDate } =
    selectionService;
  const datesItmes = metadata.available_dates || [];
  const floorsItems = metadata.available_floors || [];
  const roomsItems = metadata?.available_rooms?.[selection.hourlyFloor] || null;
  const mUnit = metadata.measurement_unit;
  const usageData = data || {};
  let colorList = [];
  let total_number = 0;

  Object.entries(usageData).forEach(([_, value], index) => {
    colorList.push(getColor(index));
    const roomTotal = value.data.reduce((sum, d) => sum + (d.value || 0), 0);
    total_number += roomTotal || 0;
  });


  return (
    <div className="w-full rounded-2xl p-8 shadow-graph-container bg-white flex flex-col gap-8">
      <div className="w-full flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-medium">
            อัตราการใช้{alternateTitle || title} (รายชั่วโมง)
          </h3>
          <Legend data={usageData} colorList={colorList} />
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 w-max">วันที่</span>
            <CommonDropdown
              items={datesItmes}
              currentItem={selection.hourlyDate}
              onSelect={setHourlyDate}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">ชั้น</span>
            <CommonDropdown
              items={floorsItems}
              currentItem={selection.hourlyFloor}
              onSelect={setHourlyFloor}
            />
          </div>
          {roomsItems && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">ห้อง</span>
              <CommonDropdown
                items={roomsItems}
                currentItem={selection.hourlyRoom}
                onSelect={setHourlyRoom}
              />
            </div>
          )}
        </div>
      </div>

      <TotalUsageBanner
        icon={totalUsageIcon}
        label={`ใช้${alternateTitle || title}รวมทั้งหมด`}
        value={total_number.toFixed(3)}
        isBlue={roomsItems ? true : false}
      />

      <div className="h-68.5 w-full flex items-center justify-center">
        <HoursGraphRenderer
          data={data}
          measurementUnit={mUnit}
          colorList={colorList}
        />
      </div>
    </div>
  );
}

const Legend = ({ data, colorList }) => {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div className="flex w-full flex-wrap gap-x-2 mt-2">
      {Object.entries(data).map(([id, roomObj], i) => (
        <div key={id} className="flex flex-row items-center gap-1 py-0.5 pr-2">
          <div
            style={{ backgroundColor: colorList[i] }}
            className="w-3 h-3 rounded-full"
          />
          <p className="text-base font-normal">{roomObj.label}</p>
        </div>
      ))}
    </div>
  );
};

const TotalUsageBanner = ({ icon, label, value, isBlue }) => (
  <div
    className={`w-full rounded-xl p-5 flex justify-between items-center ${isBlue ? "bg-graph-total-usage-gradient-blue" : "bg-graph-total-usage-gradient-orange"}`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-lg font-medium text-gray-800">{label}</span>
    </div>
    <div className="flex items-end gap-2">
      <span
        className={`text-5xl font-bold ${isBlue ? "text-[#08979C]" : "text-[#FA8C16]"}`}
      >
        {value}
      </span>
      <span className="text-xl font-bold text-gray-800 leading-8">หน่วย</span>
    </div>
  </div>
);

export function GraphContainer({ children }) {
  return <div className="w-full flex flex-col gap-8 min-w-0">{children}</div>;
}
