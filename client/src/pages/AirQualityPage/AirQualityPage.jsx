import { AirQualityTitleIcon } from "@assets/icons";
import TopDashboard from "./components/TopDashboard";
import BottomDashboard from "./components/BottomDashboard";

function AirQualityPage() {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="w-full h-max flex flex-col items-center bg-top-section-gradient">
        <div className="w-full flex gap-2 h-max justify-center bg-white">
          <div className="max-w-max-page-content w-full flex gap-2 h-20 items-center px-7 py-6">
            <AirQualityTitleIcon />
            <h3 className="font-medium text-2xl">คุณภาพอากาศ</h3>
          </div>
        </div>
        <div className="w-full flex flex-col max-w-max-page-content px-7 py-6 gap-8">
          <TopDashboard />
        </div>
      </div>
      <div className="w-full h-max flex flex-col gap-8 items-center bg-bottom-section-gradient">
        <div className="w-full flex flex-col max-w-max-page-content">
          <BottomDashboard />
        </div>
      </div>
    </div>
  );
}

export default AirQualityPage;
