import { CommonDropdown } from "@components/utils/CommonDropdown";

function BottomDashboard() {
  return (
    <div className="h-280 w-full bg-bottom-section-gradient flex flex-col gap-8">
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
      <div className=""></div>
    </div>
  );
}

export default BottomDashboard;
