import { ElectricGraphPageContainer } from "@components/layout";
import { ElectricityTitleIcon, TotalUsageIconOrange } from "@assets/icons";
import { useElectricityGraphServices } from "../../hooks/graph/useElectricGraphServices";
import DownloadReportButton from "@components/common/DownloadReport/DownloadReportButton";
import { REPORT_CONFIGS } from "@config/reports";

const displayConfig = {
  multiTabs: false,
  defaultPage: "dashboard"
};

function ElectricityPage() {
  const { graphState, fetchDailyByFloor, fetchHourlyByFloor } = useElectricityGraphServices();

  const graphService = {
    graphState,
    fetchDailyByFloor,
    fetchHourlyByFloor,
  };
  return (
    <ElectricGraphPageContainer
      pageIcon={<ElectricityTitleIcon />}
      pageTitle={"กระแสไฟฟ้า"}
      alternateTitle={"ไฟ"}
      displayConfig={displayConfig}
      graphService={graphService}
      totalUsageIcon={<TotalUsageIconOrange />}
      headerActions={
        <DownloadReportButton
          report={REPORT_CONFIGS.ELECTRICITY}
          icon={<ElectricityTitleIcon />}
        />
      }
    />
  );
}

export default ElectricityPage;
