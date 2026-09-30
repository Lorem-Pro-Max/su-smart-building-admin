import { AirQualityTitleIcon } from "@assets/icons";
import TopDashboard from "./components/TopDashboard";
import BottomDashboard from "./components/BottomDashboard";
import { useAirQualityServices } from "@hooks/pageHooks/useAirQuality";
import { LoadingScreen } from "@components/utils/LoadingScreen";
import DownloadReportButton from "@components/common/DownloadReport/DownloadReportButton";
import { REPORT_CONFIGS } from "@config/reports";

function AirQualityPage() {
  const { aqState, fetchRoomStatus, fetchRankings, contextHolder } =
    useAirQualityServices();


return (
    <>
      {contextHolder}
      {aqState.isLoading ? (
        <LoadingScreen />
      ) : (
        <div className="w-full h-full overflow-y-auto bg-bottom-section-gradient">
          <div className="w-full h-max flex flex-col items-center bg-top-section-gradient">
            <div className="w-full flex gap-2 h-max justify-center bg-white">
              <div className="max-w-max-page-content w-full flex justify-between h-20 items-center px-7 py-6">
                <div className="flex gap-2 items-center">
                  <AirQualityTitleIcon />
                  <h3 className="font-medium text-2xl">คุณภาพอากาศ</h3>
                </div>
                <DownloadReportButton
                  report={REPORT_CONFIGS.AIR_QUALITY}
                  icon={<AirQualityTitleIcon />}
                />
              </div>
            </div>
            <div className="w-full h-max flex flex-col max-w-max-page-content px-7 py-6 gap-8">
              <TopDashboard
                data={aqState.roomStatus}
                metadata={aqState.metadata}
                onFetchRoom={fetchRoomStatus}
              />
            </div>
          </div>
          <div className="w-full h-max flex flex-col gap-8 items-center bg-bottom-section-gradient">
            <div className="w-full flex flex-col max-w-max-page-content">
              <BottomDashboard
                rankings={aqState.rankings}
                onFetchRankings={fetchRankings}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AirQualityPage;
