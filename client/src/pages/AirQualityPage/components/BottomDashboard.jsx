import { CommonDropdown } from "@components/utils/CommonDropdown";

function AirQualityItem() {
  return (
    <div className=" bg-white shadow-grid-items w-full rounded-2xl py-8 px-6 flex justify-between items-center">
      <div className="w-max h-full flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div
            style={{ backgroundColor: "#FADB14" }}
            className="w-5 h-5 rounded-full"
          />
          <h3 className="font-medium text-2xl text-black">อันดับ 1</h3>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-[34px] font-medium text-black leading-10">
            สัมมนา 2
          </h2>
          <h2 className="text-[18px] font-normal text-black leading-6">
            ชั้น 2
          </h2>
        </div>
      </div>
      <div className="w-max h-max flex gap-10 justify-between">
        <h3 className="text-[40px] font-medium leading-10">PM 2.5</h3>
        <h3 className="text-[56px] font-semibold leading-10 text-[#F5222D]">
          40
        </h3>
        <h3 className="text-[40px] font-light leading-10">ug/m³</h3>
      </div>
    </div>
  );
}

function BottomDashboard() {
  return (
    <div className="min-h-280 h-full w-full bg-bottom-section-gradient flex flex-col">
      <div className="w-full h-22 px-7 py-6 flex justify-between">
        <h3 className="font-medium text-2xl">จัดอันดับคุณภาพอากาศ</h3>
        <div className="flex w-max h-10 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-black">ประเภท</span>
            <CommonDropdown />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-black">เรียงลำดับข้อมูล</span>
            <CommonDropdown />
          </div>
        </div>
      </div>
      <div className="px-7 py-6 flex flex-col gap-7">
        <AirQualityItem />
      </div>
    </div>
  );
}

export default BottomDashboard;
