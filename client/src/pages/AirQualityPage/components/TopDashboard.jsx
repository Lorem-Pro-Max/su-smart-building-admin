import { CommonDropdown } from "@components/utils/CommonDropdown";

function TopDashboard() {
  return (
    <div className="w-full h-max ">
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
  );
}

export default TopDashboard;
