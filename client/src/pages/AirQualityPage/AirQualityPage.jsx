import { AirQualityTitleIcon } from "@assets/icons";
import TopDashboard from "./components/TopDashboard";
import BottomDashboard from "./components/BottomDashboard";

function AirQualityPage() {
  return (
    <>
      <div className="w-full h-full flex flex-col items-center overflow-y-auto bg-top-section-gradient">
        <div className="w-full flex gap-2 h-max justify-center bg-white">
          <div className="max-w-max-page-content w-full flex gap-2 h-20 items-center px-7 py-6">
            <AirQualityTitleIcon />
            <h3 className="font-medium text-2xl">คุณภาพอากาศ</h3>
          </div>
        </div>
        <div className="w-full flex flex-col max-w-max-page-content px-7 py-6 gap-8">
          <TopDashboard />
          <BottomDashboard />
        </div>
      </div>
    </>
  );
}

export default AirQualityPage;
