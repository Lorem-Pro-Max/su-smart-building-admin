import { CommonDropdown } from "@components/utils/CommonDropdown";

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

function GridDashboard() {
  return (
    <div className="grid grid-cols-12 grid-rows-12 gap-6 h-142 ">
      <GridItem
        gridSetting={`col-span-6 row-span-6`}
        label="PM 2.5"
        valueColor="#52C41A"
        value="40"
        measurement="ug/m³"
      />
      <GridItem
        gridSetting={`col-span-3 row-span-8`}
        label="Temp"
        measurement="ํC"
        valueColor="#000"
        value="24.06"
      />
      <GridItem
        gridSetting={`col-span-3 row-span-4`}
        label="CO"
        valueColor="#FA8C16"
        ValueSize="48px"
        value="1"
        measurement="ppm"
        measurementSize="38px"
      />
      <GridItem
        gridSetting={`col-span-3 row-span-4`}
        label="CO2"
        measurement="ppm"
        ValueSize="48px"
        valueColor="#722ED1"
        value="406"
        measurementSize="38px"
      />
      <GridItem
        gridSetting={`col-span-6 row-span-6`}
        label="PM 10"
        valueColor="#FADB14"
        value="46"
        measurement="ug/m³"
      />
      <GridItem
        gridSetting={`col-span-6 row-span-4`}
        label="Smoke"
        value="38"
        ValueSize="48px"
        measurement="mg/m³"
        measurementSize="38px"
      />
    </div>
  );
}

function TopDashboard() {
  return (
    <>
      <div className="w-full h-max">
        <div className="w-full h-16 flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h3 className="font-medium text-2xl">Air Quality Detector</h3>
            <p className="font-normal text-base">
              เลือกชัั้นและห้องที่ต้องการดูข้อมูล
            </p>
          </div>
          <div className="flex w-max h-10 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-black">ชั้น</span>
              <CommonDropdown />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-black">ห้อง</span>
              <CommonDropdown />
            </div>
          </div>
        </div>
      </div>
      <GridDashboard />
    </>
  );
}

export default TopDashboard;
